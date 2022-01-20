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
import { DriverResolver } from './DriverResolver'
import { PaginatedResponse } from '@secjs/contracts'
import { DriverContract } from '../Contracts/DriverContract'
import { TableColumnContract } from '../Contracts/TableColumnContract'

export class PostgreSqlDriver implements DriverContract {
  private readonly knexClient: Knex
  private _defaultTable: string = null
  private queryBuilder: Knex.QueryBuilder

  constructor(connection: string, configs: any = {}) {
    this.knexClient = DriverResolver.knex('pg', connection, configs)

    this.queryBuilder = this.query()
  }

  async createDatabase(databaseName: string): Promise<void> {
    await this.knexClient.raw('CREATE DATABASE ??', databaseName)
  }

  async dropDatabase(databaseName: string): Promise<void> {
    await this.knexClient.raw('DROP DATABASE IF EXISTS ??', databaseName)
  }

  async createTable(tableName: string, columns: TableColumnContract[]): Promise<void> {
    const existsTable = await this.knexClient.schema.hasTable(tableName)

    if (!existsTable) {
      await this.knexClient.schema.createTable(tableName, (table) => {
        columns.forEach(column => {
          column = Object.assign({}, {
            isUnique: false,
            isPrimary: false,
            isNullable: true,
            autoIncrement: false,
          }, column)

          const builder = table[column.type](column.name)

          if (column.isUnique) builder.unique()
          if (column.isPrimary) builder.primary()
          if (!column.isNullable) builder.notNullable()
          if (column.autoIncrement) builder.increments()
        })
      })
    }
  }

  async dropTable(tableName: string): Promise<void> {
    await this.knexClient.schema.dropTableIfExists(tableName)
  }

  async avg(column: string): Promise<number> {
    return this.queryBuilder.avg(column)
  }

  async avgDistinct(column: string): Promise<number> {
    return this.queryBuilder.avgDistinct(column)
  }

  clone(): PostgreSqlDriver {
    return this
  }

  async close(connections?: string[]): Promise<void> {
    await this.knexClient.destroy()
  }

  async columnInfo(column: string): Promise<any> {
    return this.knexClient.withSchema(column).columnInfo()
  }

  async count(column = '*'): Promise<number> {
    return this.queryBuilder.count(column)
  }

  async countDistinct(column: string): Promise<number> {
    return this.queryBuilder.countDistinct(column)
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
f
  async forPage(page: number, limit: number): Promise<any[]> {
    return this.buildOffset(page).buildLimit(limit).findMany()
  }

  async insert(values: any | any[]): Promise<string[]> {
    const insert: any[] = await this.queryBuilder.insert(values, 'id')

    return insert.map(i => `${i.id}`)
  }

  async insertAndGet(values: any | any[]): Promise<any[]> {
    const promises = []

    const arrayOfId = await this.insert(values)

    arrayOfId.forEach(id => {
      const query = this.query()

      promises.push(query.where('id', id).first())
    })

    return Promise.all(promises)
  }

  async max(column: string): Promise<number> {
    return this.queryBuilder.max(column)
  }

  async min(column: string): Promise<number> {
    return this.queryBuilder.min(column)
  }

  async paginate(page: number, limit: number, resourceUrl = '/api'): Promise<PaginatedResponse<any>> {
    const clonedQuery = this.cloneQuery()

    const data = await this.findMany()
    const count = await clonedQuery.count()

    return paginate(data, count, { page, limit, resourceUrl })
  }

  async pluck(column: string): Promise<any[]> {
    return this.queryBuilder.pluck(column)
  }

  async raw(...args): Promise<any> {
    return this.knexClient.raw(args)
  }

  cloneQuery(): Knex.QueryBuilder {
    return this.queryBuilder.clone()
  }

  query(): Knex.QueryBuilder {
    const query = this.knexClient.queryBuilder()

    if (this._defaultTable) query.table(this._defaultTable)

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

  async sum(column: string): Promise<number> {
    return this.queryBuilder.sum(column)
  }

  async sumDistinct(column: string): Promise<number> {
    return this.queryBuilder.sumDistinct(column)
  }

  async truncate(tableName: string): Promise<void> {
    await this.knexClient.table(tableName).truncate()
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
    const promises = []

    const arrayOfId = await this.update(key, value)

    arrayOfId.forEach(id => {
      const query = this.query()

      promises.push(query.where('id', id).first())
    })

    return Promise.all(promises)
  }

  async increment(column: string, value: number) {
    return this.knexClient.increment(column, value)
  }

  buildCrossJoin(
    tableName: string,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.crossJoin(tableName, column1, operator, column2)

    return this
  }

  buildDistinct(...columns: string[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.distinct(...columns)

    return this
  }

  buildFullOuterJoin(
    tableName: string,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.fullOuterJoin(tableName, column1, operator, column2)

    return this
  }

  buildGroupBy(...columns: string[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.groupBy(...columns)

    return this
  }

  buildGroupByRaw(raw: string, queryValues: string[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.groupByRaw(raw, queryValues)

    return this
  }

  buildHaving(column: string, operator: string, value: any): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.having(column, operator, value)

    return this
  }

  buildInnerJoin(
    tableName: string,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.innerJoin(tableName, column1, operator, column2)

    return this
  }

  buildJoinRaw(raw: string, queryValues: string[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.joinRaw(raw, queryValues)

    return this
  }

  buildLeftJoin(
    tableName: string,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.leftJoin(tableName, column1, operator, column2)

    return this
  }

  buildLeftOuterJoin(
    tableName: string,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.leftOuterJoin(tableName, column1, operator, column2)

    return this
  }

  buildLimit(number: number): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.limit(number)

    return this
  }

  buildOffset(number: number): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.offset(number)

    return this
  }

  buildOrWhere(statement: string | Record<string, any>, value?: any): PostgreSqlDriver {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.where(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.where(statement, value)

    return this
  }

  buildOrderBy(column: string, direction?: "asc" | "desc"): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.orderBy(column, direction)

    return this
  }

  buildOrderByRaw(raw: string, queryValues: string[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.orderByRaw(raw, queryValues)

    return this
  }

  buildOuterJoin(
    tableName: string,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.outerJoin(tableName, column1, operator, column2)

    return this
  }

  buildRightJoin(
    tableName: string,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.rightJoin(tableName, column1, operator, column2)

    return this
  }

  buildRightOuterJoin(
    tableName: string,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.rightOuterJoin(tableName, column1, operator, column2)

    return this
  }

  buildSelect(...columns: string[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.select(...columns)

    return this
  }

  buildTable(tableName: string): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.table(tableName)

    this._defaultTable = tableName

    return this
  }

  buildWhere(statement: string | Record<string, any>, value?: any): PostgreSqlDriver {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.where(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.where(statement, value)

    return this
  }

  buildWhereBetween(columnName: string, values: [any, any]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.whereBetween(columnName, values)

    return this
  }

  buildWhereExists(callback: any): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.whereExists(callback)

    return this
  }

  buildWhereIn(columnName: string, values: any[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.whereIn(columnName, values)

    return this
  }

  buildWhereNot(statement: string | Record<string, any>, value?: any): PostgreSqlDriver {
    if (typeof statement === 'object') {
      this.queryBuilder = this.queryBuilder.whereNot(statement)

      return this
    }

    this.queryBuilder = this.queryBuilder.whereNot(statement, value)

    return this
  }

  buildWhereNotBetween(columnName: string, values: [any, any]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.whereNotBetween(columnName, values)

    return this
  }

  buildWhereNotExists(callback: any): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.whereNotExists(callback)

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.whereNotIn(columnName, values)

    return this
  }

  buildWhereNull(columnName: string): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.whereNull(columnName)

    return this
  }

  buildWhereNotNull(columnName: string): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.whereNotNull(columnName)

    return this
  }

  buildWhereRaw(raw: string, queryValues: string[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.whereRaw(raw, queryValues)

    return this
  }
}
