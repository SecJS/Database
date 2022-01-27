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
import { PaginatedResponse } from '@secjs/contracts'
import { ConnectionResolver } from '../Resolvers/ConnectionResolver'
import { DriverContract } from '../Contracts/DriverContract'

export interface PostgresDriverConfigs {
  url?: string
  host?: string
  port?: number
  username?: string
  password?: string
  database?: string
  migrations?: string
}

export class PostgresDriver implements DriverContract {
  private isConnected: boolean
  private defaultTable: string

  private client: Knex
  private queryBuilder: Knex.QueryBuilder

  private readonly configs: any
  private readonly connection: string

  constructor(connection: string, configs: PostgresDriverConfigs = {}) {
    this.isConnected = false
    this.defaultTable = null

    this.configs = configs
    this.connection = connection
  }

  query(): Knex.QueryBuilder {
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
          'decrement'
        ]

        if (protectedMethods.includes(propertyKey)) {
          this.queryBuilder = this.query()
        }

        return target[propertyKey]
      }
    }

    return new Proxy<Knex.QueryBuilder>(query, handler)
  }

  on(event: string, callback: (...params: any) => void) {
    this.queryBuilder.on(event, callback)
  }

  async connect(): Promise<void> {
    if (this.isConnected) return

    this.client = await ConnectionResolver.knex('pg', this.connection, this.configs)
    this.queryBuilder = this.query()

    this.isConnected = true
  }

  cloneQuery(): Knex.QueryBuilder {
    return this.queryBuilder.clone()
  }

  async beginTransaction(): Promise<Knex.Transaction> {
    return this.client.transaction()
  }

  async transaction(callback: (trx: Knex.Transaction) => Promise<void>): Promise<void> {
    await this.client.transaction(callback)
  }

  async createDatabase(databaseName: string): Promise<void> {
    await this.client.raw('CREATE DATABASE ??', databaseName)
  }

  async dropDatabase(databaseName: string): Promise<void> {
    await this.client.raw('DROP DATABASE IF EXISTS ??', databaseName)
  }

  async createTable(tableName: string, callback: (tableBuilder: any) => void): Promise<void> {
    const existsTable = await this.client.schema.hasTable(tableName)

    if (!existsTable) await this.client.schema.createTable(tableName, callback)
  }

  async dropTable(tableName: string): Promise<void> {
    await this.client.schema.dropTableIfExists(tableName)
  }

  async avg(column: string): Promise<number> {
    return this.queryBuilder.avg(column)
  }

  async avgDistinct(column: string): Promise<number> {
    return this.queryBuilder.avgDistinct(column)
  }

  async close(connections?: string[]): Promise<void> {
    if (!this.isConnected) return

    await this.client.destroy()

    this.client = null
    this.isConnected = false
    this.queryBuilder = null
    this.defaultTable = null
  }

  async columnInfo(column: string): Promise<any> {
    return this.client.withSchema(column).columnInfo()
  }

  async count(column = '*'): Promise<number> {
    const [count] = await this.queryBuilder.count(column)

    return parseInt(count['count'])
  }

  async countDistinct(column: string): Promise<number> {
    const [countDistinct] = await this.queryBuilder.countDistinct(column)

    return parseInt(countDistinct['count'])
  }

  async decrement(column: string, value: number) {
    return this.queryBuilder.decrement(column, value)
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
    return this.queryBuilder.max(column)
  }

  async min(column: string): Promise<number> {
    return this.queryBuilder.min(column)
  }

  async paginate(page: number, limit: number, resourceUrl = '/api'): Promise<PaginatedResponse<any>> {
    const data = await this
      .buildSkip(page)
      .buildLimit(limit)
      .findMany()

    const count = await this.count()

    return paginate(data, count, { page, limit, resourceUrl })
  }

  async pluck(column: string): Promise<any[]> {
    return this.queryBuilder.pluck(column)
  }

  async raw(...args): Promise<any> {
    return this.client.raw(args)
  }

  async sum(column: string): Promise<number> {
    return this.queryBuilder.sum(column)
  }

  async sumDistinct(column: string): Promise<number> {
    return this.queryBuilder.sumDistinct(column)
  }

  async truncate(tableName: string): Promise<void> {
    await this.client.table(tableName).truncate()
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

  async increment(column: string, value: number) {
    return this.client.increment(column, value)
  }

  buildDistinct(...columns: string[]): DriverContract {
    this.queryBuilder = this.queryBuilder.distinct(...columns)

    return this
  }

  buildGroupBy(...columns: string[]): DriverContract {
    this.queryBuilder = this.queryBuilder.groupBy(...columns)

    return this
  }

  buildGroupByRaw(raw: string, queryValues: string[]): DriverContract {
    this.queryBuilder = this.queryBuilder.groupByRaw(raw, queryValues)

    return this
  }

  buildHaving(column: string, operator: string, value: any): DriverContract {
    this.queryBuilder = this.queryBuilder.having(column, operator, value)

    return this
  }

  buildJoin(
    tableName: string,
    column1: string,
    operator: string,
    column2?: string,
    joinType = 'join',
  ): DriverContract {
    if (operator && !column2) this.queryBuilder = this.queryBuilder[joinType](tableName, column1, operator)
    if (tableName && column2) this.queryBuilder = this.queryBuilder[joinType](tableName, column1, operator, column2)

    return this
  }

  buildJoinRaw(raw: string, queryValues: string[]): DriverContract {
    this.queryBuilder = this.queryBuilder.joinRaw(raw, queryValues)

    return this
  }

  buildLimit(number: number): DriverContract {
    this.queryBuilder = this.queryBuilder.limit(number)

    return this
  }

  buildSkip(number: number): DriverContract {
    this.queryBuilder = this.queryBuilder.offset(number)

    return this
  }

  buildOrWhere(statement: string | Record<string, any>, value?: any): DriverContract {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.where(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.where(statement, value)

    return this
  }

  buildOrderBy(column: string, direction?: "asc" | "desc"): DriverContract {
    this.queryBuilder = this.queryBuilder.orderBy(column, direction)

    return this
  }

  buildOrderByRaw(raw: string, queryValues: string[]): DriverContract {
    this.queryBuilder = this.queryBuilder.orderByRaw(raw, queryValues)

    return this
  }

  buildSelect(...columns: string[]): DriverContract {
    this.queryBuilder = this.queryBuilder.select(...columns)

    return this
  }

  buildTable(tableName: string): DriverContract {
    this.queryBuilder = this.queryBuilder.table(tableName)

    this.defaultTable = tableName

    return this
  }

  buildWhere(statement: string | Record<string, any>, value?: any): DriverContract {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.where(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.where(statement, value)

    return this
  }

  buildWhereLike(statement: string | Record<string, any>, value?: any): DriverContract {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.whereLike(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.whereLike(statement, value)

    return this
  }

  buildWhereILike(statement: string | Record<string, any>, value?: any): DriverContract {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.whereIlike(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.whereIlike(statement, value)

    return this
  }

  buildWhereBetween(columnName: string, values: [any, any]): DriverContract {
    this.queryBuilder = this.queryBuilder.whereBetween(columnName, values)

    return this
  }

  buildWhereExists(callback: any): DriverContract {
    this.queryBuilder = this.queryBuilder.whereExists(callback)

    return this
  }

  buildWhereIn(columnName: string, values: any[]): DriverContract {
    this.queryBuilder = this.queryBuilder.whereIn(columnName, values)

    return this
  }

  buildWhereNot(statement: string | Record<string, any>, value?: any): DriverContract {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.whereNot(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.whereNot(statement, value)

    return this
  }

  buildWhereNotBetween(columnName: string, values: [any, any]): DriverContract {
    this.queryBuilder = this.queryBuilder.whereNotBetween(columnName, values)

    return this
  }

  buildWhereNotExists(callback: any): DriverContract {
    this.queryBuilder = this.queryBuilder.whereNotExists(callback)

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): DriverContract {
    this.queryBuilder = this.queryBuilder.whereNotIn(columnName, values)

    return this
  }

  buildWhereNull(columnName: string): DriverContract {
    this.queryBuilder = this.queryBuilder.whereNull(columnName)

    return this
  }

  buildWhereNotNull(columnName: string): DriverContract {
    this.queryBuilder = this.queryBuilder.whereNotNull(columnName)

    return this
  }

  buildWhereRaw(raw: string, queryValues: string[]): DriverContract {
    this.queryBuilder = this.queryBuilder.whereRaw(raw, queryValues)

    return this
  }
}
