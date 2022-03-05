/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Knex } from 'knex'
import { paginate } from '@secjs/utils'
import { Transaction } from '../Utils/Transaction'
import { PaginatedResponse } from '@secjs/contracts'
import { InternalServerException } from '@secjs/exceptions'
import { DriverContract } from '../Contracts/DriverContract'
import { ConnectionResolver } from '../Resolvers/ConnectionResolver'

export class SqlServerDriver implements DriverContract {
  private isConnected: boolean
  private defaultTable: string

  private client: Knex | Knex.Transaction
  private queryBuilder: Knex.QueryBuilder

  private readonly configs: any
  private readonly connection: string

  constructor(client?: Knex | Knex.Transaction | string, configs?: any) {
    if (typeof client === 'string') {
      this.isConnected = false
      this.defaultTable = null

      this.configs = configs
      this.connection = client

      return this
    }

    this.client = client
    this.isConnected = true
    this.queryBuilder = this.query()
  }

  setQueryBuilder(query: any) {
    this.queryBuilder = query.client
  }

  query() {
    const query = this.client.queryBuilder()

    if (this.defaultTable) query.table(this.defaultTable)

    const handler = {
      get: (target, propertyKey) => {
        const protectedMethods = [
          'pluck',
          'insert',
          'update',
          'delete',
          'first',
          'min',
          'max',
          'sum',
          'sumDistinct',
          'avg',
          'avgDistinct',
          'count',
          'countDistinct',
          'increment',
          'decrement',
          'truncate',
        ]

        if (protectedMethods.includes(propertyKey)) {
          this.queryBuilder = this.query()
        }

        return target[propertyKey]
      },
    }

    return new Proxy<Knex.QueryBuilder>(query, handler)
  }

  async commit(value?: any): Promise<any> {
    if (!this.client.isTransaction) {
      throw new InternalServerException(
        'Client is not a transaction to be committed',
      )
    }

    const client: any = this.client
    const committedTrx = await client.commit(value)

    this.client = null
    this.queryBuilder = null

    return committedTrx
  }

  async rollback(error?: any): Promise<any> {
    if (!this.client.isTransaction) {
      throw new InternalServerException(
        'Client is not a transaction to be rollback',
      )
    }

    const client: any = this.client
    const rolledBackTrx = await client.rollback(error)

    this.client = null
    this.queryBuilder = null

    return rolledBackTrx
  }

  on(event: string, callback: (...params: any) => void) {
    this.queryBuilder.on(event, callback)
  }

  async connect(): Promise<void> {
    if (this.isConnected) return

    this.client = await ConnectionResolver.knex(
      'mssql',
      this.connection,
      this.configs,
    )
    this.queryBuilder = this.query()

    this.isConnected = true
  }

  cloneQuery() {
    return {
      client: this.queryBuilder.clone(),
    }
  }

  async beginTransaction(): Promise<Transaction> {
    this.client = await this.client.transaction()

    return new Transaction(this)
  }

  async transaction(
    callback: (trx: Knex.Transaction) => Promise<void>,
  ): Promise<void> {
    await this.client.transaction(callback)
  }

  async createDatabase(databaseName: string): Promise<void> {
    await this.client.raw('CREATE DATABASE ??', databaseName)
  }

  async dropDatabase(databaseName: string): Promise<void> {
    await this.client.raw('DROP DATABASE IF EXISTS ??', databaseName)
  }

  async createTable(
    tableName: string,
    callback: (tableBuilder: Knex.TableBuilder) => void,
  ): Promise<void> {
    const existsTable = await this.client.schema.hasTable(tableName)

    if (!existsTable) await this.client.schema.createTable(tableName, callback)
  }

  async dropTable(tableName: string): Promise<void> {
    await this.client.schema.dropTableIfExists(tableName)
  }

  async avg(column: string): Promise<number> {
    const [{ avg }] = await this.queryBuilder.avg(column)

    return parseFloat(avg)
  }

  async avgDistinct(column: string): Promise<number> {
    const [{ avg }] = await this.queryBuilder.avgDistinct(column)

    return parseFloat(avg)
  }

  async close(): Promise<void> {
    if (!this.isConnected) return

    await this.client.destroy()

    this.client = null
    this.isConnected = false
    this.queryBuilder = null
    this.defaultTable = null
  }

  async columnInfo(column: string): Promise<any> {
    return this.queryBuilder.columnInfo(column)
  }

  async count(column = '*'): Promise<number> {
    const [count] = await this.queryBuilder.count(column)

    return parseFloat(count['count'])
  }

  async countDistinct(column: string): Promise<number> {
    const [countDistinct] = await this.queryBuilder.countDistinct(column)

    return parseFloat(countDistinct['count'])
  }

  async delete(): Promise<number> {
    return this.queryBuilder.delete()
  }

  async find(): Promise<any> {
    return this.queryBuilder.first()
  }

  async findMany(): Promise<any[]> {
    const data = await this.queryBuilder

    this.queryBuilder = this.query()

    return data
  }

  async forPage(page: number, limit: number): Promise<any[]> {
    return this.buildSkip(page).buildLimit(limit).findMany()
  }

  async insert(values: any | any[]): Promise<string[]> {
    const insert: any[] = await this.queryBuilder.insert(values, 'id')

    return insert.map(i => `${i.id}`)
  }

  async insertAndGet(values: any | any[]): Promise<any[]> {
    const arrayOfId = await this.insert(values)

    return this.query().whereIn('id', arrayOfId)
  }

  async max(column: string): Promise<number> {
    const [{ max }] = await this.queryBuilder.max(column)

    return max
  }

  async min(column: string): Promise<number> {
    const [{ min }] = await this.queryBuilder.min(column)

    return min
  }

  async paginate(
    page: number,
    limit: number,
    resourceUrl = '/api',
  ): Promise<PaginatedResponse<any>> {
    const data = await this.buildSkip(page).buildLimit(limit).findMany()

    const count = await this.count()

    return paginate(data, count, { page, limit, resourceUrl })
  }

  async pluck(column: string): Promise<any[]> {
    return this.queryBuilder.pluck(column)
  }

  async raw(raw: string, queryValues?: any[]): Promise<any> {
    return this.client.raw(raw, queryValues)
  }

  async sum(column: string): Promise<number> {
    const [{ sum }] = await this.queryBuilder.sum(column)

    return parseFloat(sum)
  }

  async sumDistinct(column: string): Promise<number> {
    const [{ sum }] = await this.queryBuilder.sumDistinct(column)

    return parseFloat(sum)
  }

  async truncate(tableName: string): Promise<void> {
    await this.queryBuilder.table(tableName).truncate()
  }

  async update(key: any, value?: any): Promise<string[]> {
    if (typeof key === 'object') {
      const data: any[] = await this.queryBuilder.update(key)

      return data.map(i => `${i.id}`)
    }

    const data: any[] = await this.queryBuilder.update(key, value, 'id')

    return data.map(i => `${i.id}`)
  }

  async updateAndGet(key: any, value?: any): Promise<any[]> {
    const arrayOfId = await this.update(key, value)

    return this.query().whereIn('id', arrayOfId)
  }

  async increment(column: string, value: number): Promise<void> {
    await this.queryBuilder.increment(column, value)
  }

  async decrement(column: string, value: number): Promise<void> {
    await this.queryBuilder.decrement(column, value)
  }

  buildDistinct(...columns: string[]): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.distinct(...columns)

    return this
  }

  buildGroupBy(...columns: string[]): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.groupBy(...columns)

    return this
  }

  buildGroupByRaw(raw: string, queryValues?: any[]): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.groupByRaw(raw, queryValues)

    return this
  }

  buildHaving(column: string, operator: string, value: any): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.having(column, operator, value)

    return this
  }

  buildJoin(
    tableName: string,
    column1: string,
    operator: string,
    column2?: string,
    joinType = 'join',
  ): SqlServerDriver {
    if (operator && !column2)
      this.queryBuilder = this.queryBuilder[joinType](
        tableName,
        column1,
        operator,
      )
    if (tableName && column2)
      this.queryBuilder = this.queryBuilder[joinType](
        tableName,
        column1,
        operator,
        column2,
      )

    return this
  }

  buildJoinRaw(raw: string, queryValues?: any[]): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.joinRaw(raw, queryValues)

    return this
  }

  buildLimit(number: number): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.limit(number)

    return this
  }

  buildSkip(number: number): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.offset(number)

    return this
  }

  buildOrWhere(
    statement: string | Record<string, any>,
    value?: any,
  ): SqlServerDriver {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.where(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.where(statement, value)

    return this
  }

  buildOrderBy(column: string, direction?: 'asc' | 'desc'): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.orderBy(column, direction)

    return this
  }

  buildOrderByRaw(raw: string, queryValues?: any[]): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.orderByRaw(raw, queryValues)

    return this
  }

  buildSelect(...columns: string[]): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.select(...columns)

    return this
  }

  buildTable(tableName: string): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.table(tableName)

    this.defaultTable = tableName

    return this
  }

  buildWhere(
    statement: string | Record<string, any>,
    value?: any,
  ): SqlServerDriver {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.where(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.where(statement, value)

    return this
  }

  buildWhereLike(
    statement: string | Record<string, any>,
    value?: any,
  ): SqlServerDriver {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.whereLike(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.whereLike(statement, value)

    return this
  }

  buildWhereILike(
    statement: string | Record<string, any>,
    value?: any,
  ): SqlServerDriver {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.whereIlike(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.whereIlike(statement, value)

    return this
  }

  buildWhereBetween(columnName: string, values: [any, any]): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.whereBetween(columnName, values)

    return this
  }

  buildWhereExists(callback: any): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.whereExists(callback)

    return this
  }

  buildWhereIn(columnName: string, values: any[]): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.whereIn(columnName, values)

    return this
  }

  buildWhereNot(
    statement: string | Record<string, any>,
    value?: any,
  ): SqlServerDriver {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.whereNot(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.whereNot(statement, value)

    return this
  }

  buildWhereNotBetween(
    columnName: string,
    values: [any, any],
  ): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.whereNotBetween(columnName, values)

    return this
  }

  buildWhereNotExists(callback: any): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.whereNotExists(callback)

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.whereNotIn(columnName, values)

    return this
  }

  buildWhereNull(columnName: string): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.whereNull(columnName)

    return this
  }

  buildWhereNotNull(columnName: string): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.whereNotNull(columnName)

    return this
  }

  buildWhereRaw(raw: string, queryValues?: any[]): SqlServerDriver {
    this.queryBuilder = this.queryBuilder.whereRaw(raw, queryValues)

    return this
  }
}
