/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  ClientSession,
  Collection,
  Connection,
  isValidObjectId,
} from 'mongoose'
import { ObjectID } from 'bson'
import { Transaction } from '../Utils/Transaction'
import { DriverFactory } from '../Utils/DriverFactory'
import { InternalServerException } from '@secjs/exceptions'
import { DriverContract } from '../Contracts/DriverContract'
import { Is, paginate, PaginatedResponse } from '@secjs/utils'
import { TableNotSetException } from '../Exceptions/TableNotSetException'
import { NotImplementedException } from '../Exceptions/NotImplementedException'
import { NullQueryBuilderException } from '../Exceptions/NullQueryBuilderException'

export class MongoDriver implements DriverContract {
  private defaultTable: string | any

  private client: Connection
  private session: ClientSession
  private isConnected: boolean
  private readonly configs: any
  private readonly connection: string

  constructor(
    client: any | string,
    configs: any = {},
    session?: ClientSession,
  ) {
    if (Is.String(client)) {
      this.isConnected = false
      this.defaultTable = null

      this.configs = configs
      this.connection = client

      return this
    }

    this.client = client
    this.session = session || null
    this.isConnected = true
  }

  private _queryBuilder: Collection

  private get queryBuilder() {
    if (!this._queryBuilder) {
      throw new NullQueryBuilderException(MongoDriver.name)
    }

    return this._queryBuilder
  }

  // This is important only for update and delete queries
  private _where = {}

  private get where() {
    const where = { ...this._where }

    this._where = {}

    return where
  }

  // This is important to be global in class to manipulate data before some operations
  private _pipeline = []

  private get pipeline() {
    const pipeline = [...this._pipeline]

    this._pipeline = []

    return pipeline
  }

  async commit(): Promise<any | any[]> {
    const doc = await this.session.commitTransaction()
    await this.session.endSession()

    this.session = null

    return doc
  }

  async rollback(): Promise<any | any[]> {
    if (!this.session) return

    const doc = await this.session.abortTransaction()
    await this.session.endSession()

    this.session = null

    return doc
  }

  async connect(force = false, saveOnDriver = true): Promise<void> {
    if (this.isConnected && !force) return

    this.client = await DriverFactory.generateDriverClient(
      'mongo',
      this.connection,
      this.configs,
      saveOnDriver,
    )

    this.isConnected = true
  }

  on(event: string, callback: (...params: any) => void): void {
    this.client.on(event, callback)
  }

  cloneQuery() {
    return {
      session: this.session,
      where: this._where,
      pipeline: this._pipeline,
      defaultTable: this.defaultTable,
      client: this.query(),
    }
  }

  async beginTransaction(): Promise<Transaction> {
    const session = await this.client.startSession()

    session.startTransaction()

    return new Transaction(new MongoDriver(this.client, this.configs, session))
  }

  async transaction(callback: (trx: any) => Promise<void>): Promise<void> {
    const trx = await this.client.startSession()

    await trx.withTransaction(callback)

    await trx.endSession()
  }

  async createDatabase(databaseName: string): Promise<void> {
    const client = await DriverFactory.generateDriverClient(
      'mongo',
      this.connection,
      {
        database: databaseName,
      },
      false,
    )

    await client.close()
  }

  async dropDatabase(databaseName: string): Promise<void> {
    const client = await DriverFactory.generateDriverClient(
      'mongo',
      this.connection,
      {
        database: databaseName,
      },
      false,
    )

    await client.dropDatabase()
    await client.close()
  }

  async createTable(): Promise<void> {
    throw new NotImplementedException(this.createTable.name, MongoDriver.name)
  }

  async dropTable(tableName: string): Promise<void> {
    try {
      await this.client.dropCollection(tableName)
    } catch (err) {}
  }

  async raw(raw: string, queryValues?: any[]): Promise<any> {
    queryValues.forEach(
      value => (raw = raw.replace(/(\?\?)|(\?)/, `"${value}"`)),
    )

    const db = this.client.db
    // eslint-disable-next-line no-new-func
    const fn = new Function('db', `return ${raw}`)

    const result = await fn(db)

    const rawSplit = raw.split('.')
    let command = rawSplit.pop()

    if (command === 'toArray()') command = rawSplit.pop()

    return {
      command,
      rowCount: result.length,
      rows: result,
    }
  }

  setQueryBuilder(query: any): void {
    this.session = query.session
    this._where = query._where
    this._pipeline = query._pipeline
    this.defaultTable = query.defaultTable

    if (this.defaultTable) this._queryBuilder = this.query()
  }

  query(): Collection {
    if (!this.defaultTable) {
      throw new TableNotSetException(MongoDriver.name)
    }

    if (Is.String(this.defaultTable)) {
      return this.client.collection(this.defaultTable, {
        session: this.session,
      })
    }

    return this.client.model(
      this.defaultTable.name,
      this.defaultTable.schema,
      this.defaultTable.collection,
    ).collection
  }

  async find(): Promise<any> {
    const data = await this.queryBuilder
      .aggregate(this.pipeline, { session: this.session })
      .toArray()

    return data[0]
  }

  async findMany(): Promise<any[]> {
    return this.queryBuilder
      .aggregate(this.pipeline, { session: this.session })
      .toArray()
  }

  async insert(values: any | any[]): Promise<string[]> {
    if (Is.Array(values)) {
      const data = await this.queryBuilder.insertMany(values)

      return Object.keys(data.insertedIds).map(key =>
        data.insertedIds[key].toString(),
      )
    }

    const data = await this.queryBuilder.insertOne(values, {
      session: this.session,
    })

    return [data.insertedId.toString()]
  }

  async insertAndGet(values: any | any[]): Promise<any[]> {
    const arrayOfId = (await this.insert(values)).map(id => new ObjectID(id))

    return this.queryBuilder
      .find({ _id: { $in: arrayOfId } }, { session: this.session })
      .toArray()
  }

  async update(key: any | string, value?: any): Promise<string[]> {
    if (typeof key === 'object') {
      const { modifiedCount } = await this.queryBuilder.updateMany(
        this._where,
        { $set: key },
        { upsert: false },
      )

      if (!modifiedCount) {
        this._where = {}

        return []
      }

      const data = await this.queryBuilder.find(this.where).toArray()

      return data.map(model => model._id.toString())
    }

    const { modifiedCount } = await this.queryBuilder.updateMany(
      this._where,
      { $set: { [key]: value } },
      { upsert: false },
    )

    if (!modifiedCount) {
      this._where = {}

      return []
    }

    const data = await this.queryBuilder.find(this.where).toArray()

    return data.map(model => model._id.toString())
  }

  async updateAndGet(key: any | string, value?: any): Promise<any[]> {
    if (typeof key === 'object') {
      const { modifiedCount } = await this.queryBuilder.updateMany(
        this._where,
        { $set: key },
        { upsert: false },
      )

      if (!modifiedCount) {
        this._where = {}

        return []
      }

      return this.queryBuilder.find(this.where).toArray()
    }

    const { modifiedCount } = await this.queryBuilder.updateMany(
      this._where,
      { $set: { [key]: value } },
      { upsert: false },
    )

    if (!modifiedCount) {
      this._where = {}

      return []
    }

    return this.queryBuilder.find(this.where).toArray()
  }

  async delete(): Promise<number> {
    const { deletedCount } = await this.queryBuilder.deleteMany(this.where)

    return deletedCount
  }

  async truncate(tableName: string): Promise<void> {
    await this.client.collection(tableName).drop()
  }

  async forPage(page: number, limit: number): Promise<any[]> {
    return this.buildSkip(page).buildLimit(limit).findMany()
  }

  async paginate(
    page: number,
    limit: number,
    resourceUrl?: string,
  ): Promise<PaginatedResponse> {
    const data = await this.buildSkip(page).buildLimit(limit).findMany()
    const count = await this.count()

    return paginate(data, count, { page, limit, resourceUrl })
  }

  async count(column = '*'): Promise<number> {
    const pipeline = []
    this._pipeline = []

    if (column !== '*') {
      const match = {
        $match: {},
      }

      if (!Is.Empty(this._where)) {
        match.$match = { ...this.where, [column]: { $ne: null } }
      } else {
        match.$match = { [column]: { $ne: null } }
      }

      pipeline.push(match)
    }

    pipeline.push({ $group: { _id: null, count: { $sum: 1 } } })
    pipeline.push({ $project: { _id: 0, count: 1 } })

    const [{ count }] = await this.queryBuilder
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return count
  }

  async countDistinct(column = '*'): Promise<number> {
    const pipeline = []
    this._pipeline = []

    if (column !== '*') {
      const match = {
        $match: {},
      }

      if (!Is.Empty(this._where)) {
        match.$match = { ...this.where, [column]: { $ne: null } }
      } else {
        match.$match = { [column]: { $ne: null } }
      }

      pipeline.push(match)
    }

    pipeline.push({ $group: { _id: null, set: { $addToSet: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, count: { $size: `$set` } } })

    const [{ count }] = await this.queryBuilder
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return count
  }

  async min(column: string): Promise<number> {
    const pipeline = []
    this._pipeline = []

    if (!Is.Empty(this._where)) {
      pipeline.push(this.where)
    }

    pipeline.push({ $group: { _id: null, min: { $min: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, min: 1 } })

    const [{ min }] = await this.queryBuilder
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return min
  }

  async max(column: string): Promise<number> {
    const pipeline = []
    this._pipeline = []

    if (!Is.Empty(this._where)) {
      pipeline.push(this.where)
    }

    pipeline.push({ $group: { _id: null, max: { $max: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, max: 1 } })

    const [{ max }] = await this.queryBuilder
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return max
  }

  async sum(column: string): Promise<number> {
    const pipeline = []
    this._pipeline = []

    if (!Is.Empty(this._where)) {
      pipeline.push(this.where)
    }

    pipeline.push({ $group: { _id: null, sum: { $sum: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, sum: 1 } })

    const [{ sum }] = await this.queryBuilder
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return sum
  }

  async sumDistinct(column: string): Promise<number> {
    const pipeline = []
    this._pipeline = []

    if (!Is.Empty(this._where)) {
      pipeline.push(this.where)
    }

    pipeline.push({ $group: { _id: null, set: { $addToSet: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, sum: { $sum: '$set' } } })

    const [{ sum }] = await this.queryBuilder
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return sum
  }

  async avg(column: string): Promise<number> {
    const pipeline = []
    this._pipeline = []

    if (!Is.Empty(this._where)) {
      pipeline.push(this.where)
    }

    pipeline.push({ $group: { _id: null, avg: { $avg: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, avg: 1 } })

    const [{ avg }] = await this.queryBuilder
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return avg
  }

  async avgDistinct(column: string): Promise<number> {
    const pipeline = []
    this._pipeline = []

    if (!Is.Empty(this._where)) {
      pipeline.push(this.where)
    }

    pipeline.push({ $group: { _id: null, set: { $addToSet: `$${column}` } } })
    pipeline.push({ $project: { _id: 0, avg: { $avg: '$set' } } })

    const [{ avg }] = await this.queryBuilder
      .aggregate(pipeline, { session: this.session })
      .toArray()

    return avg
  }

  async increment(column: string, value: number): Promise<void> {
    this._pipeline = []

    await this.queryBuilder.updateMany(
      this.where,
      { $inc: { [column]: value } },
      { session: this.session, upsert: false },
    )
  }

  async decrement(column: string, value: number): Promise<void> {
    this._pipeline = []

    await this.queryBuilder.updateMany(
      this.where,
      { $inc: { [column]: -value } },
      { session: this.session, upsert: false },
    )
  }

  async pluck(column: string): Promise<any[]> {
    this._pipeline.push({ $project: { _id: 0, [column]: 1 } })

    const data = await this.findMany()

    return data.map(data => data[column])
  }

  async columnInfo(): Promise<any> {
    return {
      defaultValue: 'null',
      type: 'any',
      maxLength: '255',
      nullable: true,
    }
  }

  async close(): Promise<void> {
    if (!this.isConnected) return

    await this.client.close()

    this.client = null
    this._where = {}
    this._pipeline = []
    this.isConnected = false
    this.defaultTable = null

    await this.rollback()
  }

  buildTable(tableName: string | any): DriverContract {
    this.defaultTable = tableName
    this._queryBuilder = this.query()

    return this
  }

  buildSelect(...columns: string[]): DriverContract {
    const project = columns.reduce(
      (previous, column) => {
        previous.$project[column] = 1

        return previous
      },
      { $project: {} },
    )

    this._pipeline.push(project)

    return this
  }

  buildWhere(
    statement: string | Record<string, any>,
    value?: any,
  ): DriverContract {
    if (typeof statement === 'string') {
      if (isValidObjectId(value) && Is.String(value)) {
        value = new ObjectID(value)
      }

      this._where[statement] = value
      this._pipeline.push({ $match: this._where })

      return this
    }

    if (statement._id && Is.String(statement._id)) {
      statement._id = new ObjectID(statement._id)
    }

    this._where = {
      ...this._where,
      ...statement,
    }

    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereLike(
    statement: string | Record<string, any>,
    value?: any,
  ): DriverContract {
    if (typeof statement === 'string') {
      if (isValidObjectId(value) && Is.String(value)) {
        value = new ObjectID(value)
      }

      this._where[statement] = { $regex: value }
      this._pipeline.push({ $match: this._where })

      return this
    }

    if (statement._id && Is.String(statement._id)) {
      statement._id = new ObjectID(statement._id)
    }

    this._where = {
      ...this._where,
      ...statement,
    }

    return this
  }

  buildWhereILike(
    statement: string | Record<string, any>,
    value?: any,
  ): DriverContract {
    if (typeof statement === 'string') {
      if (isValidObjectId(value) && Is.String(value)) {
        value = new ObjectID(value)
      }

      this._where[statement] = { $regex: value, $options: 'i' }
      this._pipeline.push({ $match: this._where })

      return this
    }

    if (statement._id && Is.String(statement._id)) {
      statement._id = new ObjectID(statement._id)
    }

    this._where = {
      ...this._where,
      ...statement,
    }

    this._pipeline.push({ $match: this._where })

    return this
  }

  buildOrWhere(
    statement: string | Record<string, any>,
    value?: any,
  ): DriverContract {
    if (typeof statement === 'string') {
      if (isValidObjectId(value) && Is.String(value)) {
        value = new ObjectID(value)
      }

      this._where[statement] = { $or: value }
      this._pipeline.push({ $match: this._where })

      return this
    }

    if (statement._id && Is.String(statement._id)) {
      statement._id = new ObjectID(statement._id)
    }

    this._where = {
      ...this._where,
      ...statement,
    }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNot(
    statement: string | Record<string, any>,
    value?: any,
  ): DriverContract {
    if (typeof statement === 'string') {
      if (isValidObjectId(value) && Is.String(value)) {
        value = new ObjectID(value)
      }

      this._where[statement] = { $not: value }
      this._pipeline.push({ $match: this._where })

      return this
    }

    if (statement._id && Is.String(statement._id)) {
      statement._id = new ObjectID(statement._id)
    }

    this._where = {
      ...this._where,
      ...statement,
    }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereIn(columnName: string, values: any[]): DriverContract {
    if (columnName === '_id') {
      values = values.map(value => {
        if (Is.String(value)) {
          return new ObjectID(value)
        }

        return value
      })
    }

    this._where[columnName] = { $in: values }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): DriverContract {
    if (columnName === '_id') {
      values = values.map(value => {
        if (Is.String(value)) {
          return new ObjectID(value)
        }

        return value
      })
    }

    this._where[columnName] = { $nin: values }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNull(columnName: string): DriverContract {
    this._where[columnName] = null
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNotNull(columnName: string): DriverContract {
    this._where[columnName] = { $ne: null }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereExists(callback: any): DriverContract {
    this._where[callback] = { $exists: true }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNotExists(callback: any): DriverContract {
    this._where[callback] = { $exists: false }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereBetween(columnName: string, values: [any, any]): DriverContract {
    if (columnName === '_id') {
      if (Is.String(values[0])) {
        values[0] = new ObjectID(values[0])
      }

      if (Is.String(values[1])) {
        values[1] = new ObjectID(values[1])
      }
    }

    this._where[columnName] = { $gte: values[0], $lte: values[1] }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNotBetween(columnName: string, values: [any, any]): DriverContract {
    if (columnName === '_id') {
      if (Is.String(values[0])) {
        values[0] = new ObjectID(values[0])
      }

      if (Is.String(values[1])) {
        values[1] = new ObjectID(values[1])
      }
    }

    this._where[columnName] = { $not: { $gte: values[0], $lte: values[1] } }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereRaw(): DriverContract {
    throw new NotImplementedException(this.buildWhereRaw.name, MongoDriver.name)
  }

  buildJoin(
    tableName: string,
    column1: string,
    operator: string,
    column2: string,
  ): DriverContract {
    let foreignField = column2 || operator

    if (foreignField.includes('.')) {
      const [table, column] = foreignField.split('.')

      if (table !== tableName)
        throw new InternalServerException(
          `Property ${foreignField} should join in ${tableName}`,
        )

      foreignField = column
    }

    let localField = column1

    if (localField.includes('.')) {
      localField = localField.split('.')[1]
    }

    this._pipeline.push({
      $lookup: { from: tableName, localField, foreignField, as: tableName },
    })

    return this
  }

  buildJoinRaw(): DriverContract {
    throw new NotImplementedException(this.buildJoinRaw.name, MongoDriver.name)
  }

  buildDistinct(...columns: string[]): DriverContract {
    const project = columns.reduce(
      (previous, column) => {
        previous.$project[column] = -1

        return previous
      },
      { $project: {} },
    )

    this._pipeline.push(project)

    return this
  }

  buildGroupBy(...columns: string[]): DriverContract {
    const group = {
      $group: {
        _id: {},
      },
    }

    columns.forEach(column => {
      group.$group._id[column] = `$${column}`
    })

    this._pipeline.push(group)
    this._pipeline.push({ $replaceRoot: { newRoot: '$_id' } })

    return this
  }

  buildGroupByRaw(): DriverContract {
    throw new NotImplementedException(
      this.buildGroupByRaw.name,
      MongoDriver.name,
    )
  }

  buildOrderBy(column: string, direction?: 'asc' | 'desc'): DriverContract {
    this._pipeline.push({ $sort: { [column]: direction === 'asc' ? 1 : -1 } })

    return this
  }

  buildOrderByRaw(): DriverContract {
    throw new NotImplementedException(this.buildOrderBy.name, MongoDriver.name)
  }

  buildHaving(column: string, operator: string, value: any): DriverContract {
    if (column === '_id' && Is.String(value)) {
      value = new ObjectID(value)
    }

    const operatorDictionary = {
      '>=': { $gte: value },
      '<=': { $lte: value },
      '>': { $gt: value },
      '<': { $lt: value },
      '=': value,
    }

    this._where[column] = operatorDictionary[operator]
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildSkip(number: number): DriverContract {
    this._pipeline.push({ $skip: number })

    return this
  }

  buildLimit(number: number): DriverContract {
    this._pipeline.push({ $limit: number })

    return this
  }
}
