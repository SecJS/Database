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
  Schema,
} from 'mongoose'
import { ObjectID } from 'bson'
import { Is, paginate } from '@secjs/utils'
import { PaginatedResponse } from '@secjs/contracts'
import { TableBuilder } from '../Builders/TableBuilder'
import { InternalServerException } from '@secjs/exceptions'
import { ClientContract } from '../Contracts/ClientContract'
import { ConnectionResolver } from '../Resolvers/ConnectionResolver'

export class MongooseClient implements ClientContract {
  private defaultTable: string

  private client: Connection
  private session: ClientSession
  private queryBuilder: Collection
  private isConnected: boolean

  private readonly configs: any
  private readonly connection: string

  // This is important only for update and delete queries
  private _where = {}
  // This is important to be global in class to manipulate data before some operations
  private _pipeline = []

  private get where() {
    const where = { ...this._where }

    this._where = {}

    return where
  }

  private get pipeline() {
    const pipeline = [...this._pipeline]

    this._pipeline = []

    return pipeline
  }

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

  async connect(): Promise<void> {
    if (this.isConnected) return

    this.client = await ConnectionResolver.mongoose(
      this.connection,
      this.configs,
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

  async beginTransaction(): Promise<any> {
    const session = await this.client.startSession()

    session.startTransaction({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
    })

    return { client: this.client, configs: this.configs, session }
  }

  async transaction(callback: (trx: any) => Promise<void>): Promise<void> {
    const trx = await this.client.startSession()

    await trx.withTransaction(callback)
  }

  async createDatabase(databaseName: string): Promise<void> {
    const client = await ConnectionResolver.mongoose(this.connection, {
      database: databaseName,
    })

    await client.close()
  }

  async dropDatabase(databaseName: string): Promise<void> {
    const client = await ConnectionResolver.mongoose(this.connection, {
      database: databaseName,
    })

    await client.dropDatabase()
    await client.close()
  }

  async createTable(
    tableName: string,
    callback: (tableBuilder: TableBuilder) => any,
  ): Promise<void> {
    // Type dictionary for mongoose schema
    const typeDictionary = {
      string: String,
      integer: Number,
      date: Date,
      increments: Schema.Types.ObjectId,
      boolean: Boolean,
    }

    const tableBuilder = new TableBuilder()

    // Execute callback to generate columns
    callback(tableBuilder)

    const transpiledObject = {}

    tableBuilder.toJSON().forEach(column => {
      transpiledObject[column.columnName] = {
        type: typeDictionary[column.columnType],
        index: column.primary,
        unique: column.unique,
        default: column.defaultTo,
        required: !column.nullable,
      }

      if (column.type === 'enum') {
        transpiledObject[column.columnName].enum = column.enumValues
      } else {
        transpiledObject[column.columnName].maxLength = column.columnLength
      }

      if (column.references) {
        transpiledObject[column.columnName].type = typeDictionary.increments
        transpiledObject[
          column.columnName
        ].ref = `${column.references.inTable}.${column.references.columnName}`
      }
    })

    const schema = new Schema(transpiledObject)

    await this.client.model(tableName, schema).createCollection()
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

    if (this.defaultTable) this.queryBuilder = this.query()
  }

  query(): Collection {
    if (!this.defaultTable) {
      throw new InternalServerException(
        'Table is not set, use buildTable method to set mongo collection.',
      )
    }

    return this.client.collection(this.defaultTable, { session: this.session })
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
  ): Promise<PaginatedResponse<any>> {
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

  buildTable(tableName: string): ClientContract {
    this.defaultTable = tableName
    this.queryBuilder = this.query()

    return this
  }

  buildSelect(...columns: string[]): ClientContract {
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
  ): ClientContract {
    if (typeof statement === 'string') {
      if (isValidObjectId(value) && Is.String(value)) {
        value = new ObjectID(value)
      }

      this._where[statement] = value
      this._pipeline.push({ $match: this._where })

      return this
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
  ): ClientContract {
    if (typeof statement === 'string') {
      this._where[statement] = { $regex: value }
      this._pipeline.push({ $match: this._where })

      return this
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
  ): ClientContract {
    if (typeof statement === 'string') {
      this._where[statement] = { $regex: value, $options: 'i' }
      this._pipeline.push({ $match: this._where })

      return this
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
  ): ClientContract {
    if (typeof statement === 'string') {
      this._where[statement] = { $or: value }
      this._pipeline.push({ $match: this._where })

      return this
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
  ): ClientContract {
    if (typeof statement === 'string') {
      this._where[statement] = { $not: value }
      this._pipeline.push({ $match: this._where })

      return this
    }

    this._where = {
      ...this._where,
      ...statement,
    }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereIn(columnName: string, values: any[]): ClientContract {
    this._where[columnName] = { $in: values }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): ClientContract {
    this._where[columnName] = { $nin: values }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNull(columnName: string): ClientContract {
    this._where[columnName] = null
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNotNull(columnName: string): ClientContract {
    this._where[columnName] = { $ne: null }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereExists(callback: any): ClientContract {
    this._where[callback] = { $exists: true }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNotExists(callback: any): ClientContract {
    this._where[callback] = { $exists: false }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereBetween(columnName: string, values: [any, any]): ClientContract {
    this._where[columnName] = { $gte: values[0], $lte: values[1] }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereNotBetween(columnName: string, values: [any, any]): ClientContract {
    this._where[columnName] = { $not: { $gte: values[0], $lte: values[1] } }
    this._pipeline.push({ $match: this._where })

    return this
  }

  buildWhereRaw(): ClientContract {
    console.log(
      `Method ${this.buildWhereRaw.name} has not been implemented in ${MongooseClient.name}`,
    )

    return this
  }

  buildJoin(
    tableName: string,
    column1: string,
    operator: string,
    column2: string,
  ): ClientContract {
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

  buildJoinRaw(): ClientContract {
    console.log(
      `Method ${this.buildJoinRaw.name} has not been implemented in ${MongooseClient.name}`,
    )

    return this
  }

  buildDistinct(...columns: string[]): ClientContract {
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

  buildGroupBy(...columns: string[]): ClientContract {
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

  buildGroupByRaw(): ClientContract {
    console.log(
      `Method ${this.buildGroupByRaw.name} has not been implemented in ${MongooseClient.name}`,
    )

    return this
  }

  buildOrderBy(column: string, direction?: 'asc' | 'desc'): ClientContract {
    this._pipeline.push({ $sort: { [column]: direction === 'asc' ? 1 : -1 } })

    return this
  }

  buildOrderByRaw(): ClientContract {
    console.log(
      `Method ${this.buildOrderByRaw.name} has not been implemented in ${MongooseClient.name}`,
    )

    return this
  }

  buildHaving(column: string, operator: string, value: any): ClientContract {
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

  buildSkip(number: number): ClientContract {
    this._pipeline.push({ $skip: number })

    return this
  }

  buildLimit(number: number): ClientContract {
    this._pipeline.push({ $limit: number })

    return this
  }
}
