/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ClientSession, Connection } from 'mongoose'
import { paginate } from '@secjs/utils'
import { JoinType } from '../Contracts/JoinType'
import { PaginatedResponse } from '@secjs/contracts'
import { ClientContract } from '../Contracts/ClientContract'
import { ConnectionResolver } from '../Resolvers/ConnectionResolver'
import { InternalServerException } from '@secjs/exceptions'

// if(err) { return console.dir(err); }
//
// var collection = db.collection('kittens');
//
// collection.find().toArray(function(err, kittens) {
//   // here ...
// });

export class MongooseClient implements ClientContract {
  private select: string[]
  private join: Record<string, any>
  private defaultTable: string
  private where: Record<string, any>
  private skip: number
  private limit: number
  private groupBy: string[]
  private orderBy: Record<string, any>

  private client: Connection | ClientSession
  private isConnected: boolean

  private readonly configs: any
  private readonly connection: string

  constructor(client: any | string, configs: any = {}) {
    if (typeof client === 'string') {
      this.isConnected = false
      this.defaultTable = null

      this.configs = configs
      this.connection = client

      return this
    }

    this.client = client
    this.isConnected = true
  }

  async commit(value?: any): Promise<any | any[]> {
    if (this.client instanceof Connection) {
      throw new InternalServerException('Client is not a transaction to be committed')
    }

    return this.client.commitTransaction()
  }

  async rollback(error?: any): Promise<any | any[]> {
    if (this.client instanceof Connection) {
      throw new InternalServerException('Client is not a transaction to be rollback')
    }

    return this.client.abortTransaction()
  }

  async connect(client: string): Promise<void> {
    if (this.isConnected) return

    this.client = await ConnectionResolver.mongoose(this.connection, this.configs)

    this.isConnected = true
  }

  on(event: string, callback: (...params: any) => void): void {
    this.client.on(event, callback)
  }

  cloneQuery(): any {
    // return this.client.collection(this.defaultTable).find(this.where).skip(this.skip).limit(this.limit).sort(this.orderBy)
    return {}
  }

  async beginTransaction(): Promise<any> {
    if (!(this.client instanceof Connection)) {
      throw new InternalServerException('Client is not a transaction to be started')
    }

    const session = await this.client.startSession()

    await session.startTransaction()

    return session
  }

  async transaction(callback: (trx: any) => Promise<void>): Promise<void> {
    if (!(this.client instanceof Connection)) {
      throw new InternalServerException('Client is not a transaction to be started')
    }

    const trx = await this.client.startSession()

    await trx.withTransaction(callback)
  }

  async createDatabase(databaseName: string): Promise<void> {
    const client = await ConnectionResolver.mongoose(this.connection, {
      database: databaseName
    })

    await client.close()
  }

  async dropDatabase(databaseName: string): Promise<void> {
    const client = this.client as Connection

    await client.dropDatabase()
  }

  async createTable(tableName: string, callback: (tableBuilder: any) => void): Promise<void> {
    const client = this.client as Connection

    await client.createCollection(tableName, callback)
  }

  async dropTable(tableName: string): Promise<void> {
    const client = this.client as Connection

    await client.dropCollection(tableName)
  }

  async raw(raw: string, queryValues?: any[]): Promise<any> {
    console.log(`Method ${this.raw.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve({}))
  }

  setQueryBuilder(query: any): void {
    console.log(`Method ${this.setQueryBuilder.name} has not been implemented in ${MongooseClient.name}`)
  }

  query(): any {
    console.log(`Method ${this.query.name} has not been implemented in ${MongooseClient.name}`)
  }

  async find(): Promise<any> {
    const client = this.client as Connection
    const model = client.model(this.defaultTable)

    if (this.where) model.where(this.where).sort(this.orderBy)
    if (this.join) Object.keys(this.join).forEach(key => model.populate(key, key))

    return model.findOne()
  }

  async findMany(): Promise<any[]> {
    const client = this.client as Connection
    const model = client.model(this.defaultTable)

    if (this.where) model.where(this.where).sort(this.orderBy)
    if (this.join) Object.keys(this.join).forEach(key => model.populate(key, key))

    return model.find()
  }

  async insert(values: any | any[]): Promise<string[]> {
    console.log(`Method ${this.insert.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
  }

  async insertAndGet(values: any | any[]): Promise<any[]> {
    console.log(`Method ${this.insertAndGet.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
  }

  async update(key: any | string, value?: any): Promise<string[]> {
    console.log(`Method ${this.update.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
  }

  async updateAndGet(key: any | string, value?: any): Promise<any[]> {
    console.log(`Method ${this.updateAndGet.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
  }

  async delete(): Promise<number> {
    console.log(`Method ${this.delete.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async truncate(tableName: string): Promise<void> {
    console.log(`Method ${this.truncate.name} has not been implemented in ${MongooseClient.name}`)
  }

  async forPage(page: number, limit: number): Promise<any[]> {
    console.log(`Method ${this.forPage.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
  }

  async paginate(page: number, limit: number, resourceUrl?: string): Promise<PaginatedResponse<any>> {
    console.log(`Method ${this.paginate.name} has not been implemented in ${MongooseClient.name}`)

    return paginate([], 0, { page, limit, resourceUrl })
  }

  async count(column?: string): Promise<number> {
    console.log(`Method ${this.count.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async countDistinct(column: string): Promise<number> {
    console.log(`Method ${this.countDistinct.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async min(column: string): Promise<number> {
    console.log(`Method ${this.min.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async max(column: string): Promise<number> {
    console.log(`Method ${this.max.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async sum(column: string): Promise<number> {
    console.log(`Method ${this.sum.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async sumDistinct(column: string): Promise<number> {
    console.log(`Method ${this.sumDistinct.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async avg(column: string): Promise<number> {
    console.log(`Method ${this.avg.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async avgDistinct(column: string): Promise<number> {
    console.log(`Method ${this.avgDistinct.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async increment(column: string, value: number) {
    console.log(`Method ${this.increment.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async decrement(column: string, value: number) {
    console.log(`Method ${this.decrement.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  async pluck(column: string): Promise<any[]> {
    console.log(`Method ${this.pluck.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
  }

  async columnInfo(column: string): Promise<any> {
    console.log(`Method ${this.columnInfo.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve({}))
  }

  async close(): Promise<void> {
    const client = this.client as Connection

    if (!this.isConnected) return

    await client.close()

    this.client = null
    this.isConnected = false
    this.defaultTable = null
  }

  buildTable(tableName: string): ClientContract {
    this.defaultTable = tableName

    return this
  }

  buildSelect(...columns: string[]): ClientContract {
    this.select = columns

    return this
  }

  buildWhere(statement: string | Record<string, any>, value?: any): ClientContract {
    if (typeof statement === 'string') {
      this.where[statement] = value

      return this
    }

    this.where = {
      ...this.where,
      ...statement,
    }

    return this
  }

  buildWhereLike(statement: string | Record<string, any>, value?: any): ClientContract {
    if (typeof statement === 'string') {
      this.where[statement] = { $regex: value }

      return this
    }

    this.where = {
      ...this.where,
      ...statement,
    }

    return this
  }

  buildWhereILike(statement: string | Record<string, any>, value?: any): ClientContract {
    if (typeof statement === 'string') {
      this.where[statement] = { $regex: value, $options: 'i' }

      return this
    }

    this.where = {
      ...this.where,
      ...statement,
    }

    return this
  }

  buildOrWhere(statement: string | Record<string, any>, value?: any): ClientContract {
    if (typeof statement === 'string') {
      this.where[statement] = { $or: value }

      return this
    }

    this.where = {
      ...this.where,
      ...statement,
    }

    return this
  }

  buildWhereNot(statement: string | Record<string, any>, value?: any): ClientContract {
    if (typeof statement === 'string') {
      this.where[statement] = { $not: value }

      return this
    }

    this.where = {
      ...this.where,
      ...statement,
    }

    return this
  }

  buildWhereIn(columnName: string, values: any[]): ClientContract {
    this.where[columnName] = { $in: values }

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): ClientContract {
    this.where[columnName] = { $nin: values }

    return this
  }

  buildWhereNull(columnName: string): ClientContract {
    this.where[columnName] = null

    return this
  }

  buildWhereNotNull(columnName: string): ClientContract {
    this.where[columnName] = { $ne: null }

    return this
  }

  buildWhereExists(callback: any): ClientContract {
    this.where[callback] = { $exists: true }

    return this
  }

  buildWhereNotExists(callback: any): ClientContract {
    this.where[callback] = { $exists: false }

    return this
  }

  buildWhereBetween(columnName: string, values: [any, any]): ClientContract {
    this.where[columnName] = { $gte: values[0], $lte: values[1] }

    return this
  }

  buildWhereNotBetween(columnName: string, values: [any, any]): ClientContract {
    this.where[columnName] = { $not: { $gte: values[0], $lte: values[1] } }

    return this
  }

  buildWhereRaw(raw: string, queryValues?: any[]): ClientContract {
    console.log(`Method ${this.buildWhereRaw.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  buildJoin(tableName: string, column1: string, operator: string, column2: string, joinType?: JoinType): ClientContract {
    this.join[tableName] = {
      column1,
      operator,
      column2,
    }

    return this
  }

  buildJoinRaw(raw: string, queryValues?: any[]): ClientContract {
    console.log(`Method ${this.buildJoinRaw.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  buildDistinct(...columns: string[]): ClientContract {
    console.log(`Method ${this.buildDistinct.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  buildGroupBy(...columns: string[]): ClientContract {
    this.groupBy.push(...columns)

    return this
  }

  buildGroupByRaw(raw: string, queryValues?: any[]): ClientContract {
    console.log(`Method ${this.buildGroupByRaw.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  buildOrderBy(column: string, direction?: 'asc' | 'desc'): ClientContract {
    this.orderBy[column] = direction.toUpperCase()

    return this
  }

  buildOrderByRaw(raw: string, queryValues?: any[]): ClientContract {
    console.log(`Method ${this.buildOrderByRaw.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  buildHaving(column: string, operator: string, value: any): ClientContract {
    console.log(`Method ${this.buildHaving.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  buildSkip(number: number): ClientContract {
    this.skip = number

    return this
  }

  buildLimit(number: number): ClientContract {
    this.limit = number

    return this
  }
}
