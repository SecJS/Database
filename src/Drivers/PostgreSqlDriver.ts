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
import { DriverResolver } from '../Resolvers/DriverResolver'
import { DriverContract } from '../Contracts/DriverContract'
import { TableColumnContract } from '../Contracts/TableColumnContract'

export class PostgreSqlDriver implements DriverContract {
  private knexClient: Knex
  private _defaultTable: string = null
  private queryBuilder: Knex.QueryBuilder

  private readonly configs: any
  private readonly connection: string

  constructor(connection: string, configs: any = {}) {
    this.configs = configs
    this.connection = connection
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

  on(event: string, callback: (...params: any) => void) {
    this.queryBuilder.on(event, callback)
  }

  async connect(): Promise<void> {
    this.knexClient = await DriverResolver.knex('pg', this.connection, this.configs)

    this.queryBuilder = this.query()
  }

  cloneQuery(): Knex.QueryBuilder {
    return this.queryBuilder.clone()
  }

  async beginTransaction(): Promise<Knex.Transaction> {
    return this.knexClient.transaction()
  }

  async transaction(callback: (trx: Knex.Transaction) => Promise<void>): Promise<void> {
    await this.knexClient.transaction(callback)
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
          if (column.references) builder.references(column.references.column).inTable(column.references.table)
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

  async close(connections?: string[]): Promise<void> {
    await this.knexClient.destroy()
  }

  async columnInfo(column: string): Promise<any> {
    return this.knexClient.withSchema(column).columnInfo()
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
    const data = await this
      .buildOffset(page)
      .buildLimit(limit)
      .findMany()

    const count = await this.count()

    return paginate(data, count, { page, limit, resourceUrl })
  }

  async pluck(column: string): Promise<any[]> {
    return this.queryBuilder.pluck(column)
  }

  async raw(...args): Promise<any> {
    return this.knexClient.raw(args)
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
    tableName: string | Knex.Raw,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    if (!column1) this.queryBuilder = this.queryBuilder.crossJoin(<Knex.Raw<any>>tableName)
    if (operator && !column2) this.queryBuilder = this.queryBuilder.crossJoin(tableName, column1, operator)
    if (tableName && column2) this.queryBuilder = this.queryBuilder.crossJoin(tableName, column1, operator, column2)

    return this
  }

  buildDistinct(...columns: string[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.distinct(...columns)

    return this
  }

  buildFullOuterJoin(
    tableName: string | Knex.Raw,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    if (!column1) this.queryBuilder = this.queryBuilder.fullOuterJoin(<Knex.Raw<any>>tableName)
    if (operator && !column2) this.queryBuilder = this.queryBuilder.fullOuterJoin(tableName, column1, operator)
    if (tableName && column2) this.queryBuilder = this.queryBuilder.fullOuterJoin(tableName, column1, operator, column2)

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

  buildJoin(
    tableName: string | Knex.Raw,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    if (!column1) this.queryBuilder = this.queryBuilder.join(<Knex.Raw<any>>tableName)
    if (operator && !column2) this.queryBuilder = this.queryBuilder.join(tableName, column1, operator)
    if (tableName && column2) this.queryBuilder = this.queryBuilder.join(tableName, column1, operator, column2)

    return this
  }

  buildInnerJoin(
    tableName: string | Knex.Raw,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    if (!column1) this.queryBuilder = this.queryBuilder.innerJoin(<Knex.Raw<any>>tableName)
    if (operator && !column2) this.queryBuilder = this.queryBuilder.innerJoin(tableName, column1, operator)
    if (tableName && column2) this.queryBuilder = this.queryBuilder.innerJoin(tableName, column1, operator, column2)

    return this
  }

  buildJoinRaw(raw: string, queryValues: string[]): PostgreSqlDriver {
    this.queryBuilder = this.queryBuilder.joinRaw(raw, queryValues)

    return this
  }

  buildLeftJoin(
    tableName: string | Knex.Raw,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    if (!column1) this.queryBuilder = this.queryBuilder.leftJoin(<Knex.Raw<any>>tableName)
    if (operator && !column2) this.queryBuilder = this.queryBuilder.leftJoin(tableName, column1, operator)
    if (tableName && column2) this.queryBuilder = this.queryBuilder.leftJoin(tableName, column1, operator, column2)

    return this
  }

  buildLeftOuterJoin(
    tableName: string | Knex.Raw,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    if (!column1) this.queryBuilder = this.queryBuilder.leftOuterJoin(<Knex.Raw<any>>tableName)
    if (operator && !column2) this.queryBuilder = this.queryBuilder.leftOuterJoin(tableName, column1, operator)
    if (tableName && column2) this.queryBuilder = this.queryBuilder.leftOuterJoin(tableName, column1, operator, column2)

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
    tableName: string | Knex.Raw,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    if (!column1) this.queryBuilder = this.queryBuilder.outerJoin(<Knex.Raw<any>>tableName)
    if (operator && !column2) this.queryBuilder = this.queryBuilder.outerJoin(tableName, column1, operator)
    if (tableName && column2) this.queryBuilder = this.queryBuilder.outerJoin(tableName, column1, operator, column2)

    return this
  }

  buildRightJoin(
    tableName: string | Knex.Raw,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    if (!column1) this.queryBuilder = this.queryBuilder.rightJoin(<Knex.Raw<any>>tableName)
    if (operator && !column2) this.queryBuilder = this.queryBuilder.rightJoin(tableName, column1, operator)
    if (tableName && column2) this.queryBuilder = this.queryBuilder.rightJoin(tableName, column1, operator, column2)

    return this
  }

  buildRightOuterJoin(
    tableName: string | Knex.Raw,
    column1?: string,
    operator?: string,
    column2?: string
  ): PostgreSqlDriver {
    if (!column1) this.queryBuilder = this.queryBuilder.rightOuterJoin(<Knex.Raw<any>>tableName)
    if (operator && !column2) this.queryBuilder = this.queryBuilder.rightOuterJoin(tableName, column1, operator)
    if (tableName && column2) this.queryBuilder = this.queryBuilder.rightOuterJoin(tableName, column1, operator, column2)

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
