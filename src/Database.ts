/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { JoinType } from './Contracts/JoinType'
import { DriverFactory } from './Utils/DriverFactory'
import { DriverContract } from './Contracts/DriverContract'
import { Config, PaginatedResponse, Path } from '@secjs/utils'
import { DatabaseContract } from './Contracts/DatabaseContract'
import { TransactionContract } from './Contracts/TransactionContract'

export class Database implements DatabaseContract {
  private runtimeConfig: any
  private connectionName: string
  private driver: DriverContract

  constructor(runtimeConfig: any = {}) {
    new Config().safeLoad(Path.config('database'))

    this.runtimeConfig = runtimeConfig
    this.connectionName = 'default'
    this.driver = DriverFactory.fabricate('default', runtimeConfig)
  }

  static get drivers(): string[] {
    return DriverFactory.availableDrivers()
  }

  static build(
    name: string,
    driver: new (connection: string, configs?: any) => DriverContract,
  ) {
    DriverFactory.createDriver(name, driver)
  }

  static async closeDriver(...drivers: string[]): Promise<void> {
    const promises = drivers.map(driver =>
      DriverFactory.closeDriverConnection(driver),
    )

    await Promise.all(promises)
  }

  static async closeAllDrivers(): Promise<void> {
    return DriverFactory.closeAllDriversConnection()
  }

  // DriverContract Methods

  connection(connection: string, runtimeConfig: any = {}): DatabaseContract {
    this.runtimeConfig = runtimeConfig

    this.connectionName = connection
    this.driver = DriverFactory.fabricate(connection, runtimeConfig)

    return this
  }

  setQueryBuilder(query: any): void {
    this.driver.setQueryBuilder(query)
  }

  async connect(
    force?: boolean,
    saveOnDriver?: boolean,
  ): Promise<DatabaseContract> {
    await this.driver.connect(force, saveOnDriver)

    return this
  }

  on(event: string, callback: (...params: any) => void) {
    this.driver.on(event, callback)
  }

  cloneQuery<T = any>(): T {
    return this.driver.cloneQuery()
  }

  clone(connection?: string): DatabaseContract {
    const database: any = new Database().connection(
      connection || this.connectionName,
    )

    database.setQueryBuilder(this.cloneQuery())

    return database
  }

  async beginTransaction(): Promise<TransactionContract> {
    return this.driver.beginTransaction()
  }

  async transaction<T = any>(
    callback: (trx: T) => Promise<void>,
  ): Promise<void> {
    return this.driver.transaction(callback)
  }

  async createDatabase(databaseName: string): Promise<void> {
    await this.driver.createDatabase(databaseName)
  }

  async dropDatabase(databaseName: string): Promise<void> {
    await this.driver.dropDatabase(databaseName)
  }

  async createTable(
    tableName: string,
    callback: (tableBuilder: any) => void,
  ): Promise<void> {
    await this.driver.createTable(tableName, callback)
  }

  async dropTable(tableName: string): Promise<void> {
    await this.driver.dropTable(tableName)
  }

  async raw(raw: string, queryValues: string[]): Promise<any> {
    return this.driver.raw(raw, queryValues)
  }

  async find(): Promise<any> {
    return this.driver.find()
  }

  async findMany(): Promise<any[]> {
    return this.driver.findMany()
  }

  async insert(values: any | any[]): Promise<string[]> {
    return this.driver.insert(values)
  }

  async insertAndGet(values: any | any[]): Promise<any[]> {
    return this.driver.insertAndGet(values)
  }

  async update(key: any | string, value?: any): Promise<string[]> {
    return this.driver.update(key, value)
  }

  async updateAndGet(key: any | string, value?: any): Promise<any[]> {
    return this.driver.updateAndGet(key, value)
  }

  async delete(): Promise<number> {
    return this.driver.delete()
  }

  async truncate(tableName: string): Promise<void> {
    return this.driver.truncate(tableName)
  }

  async forPage(page: number, limit: number): Promise<any[]> {
    return this.driver.forPage(page, limit)
  }

  async paginate(
    page: number,
    limit: number,
    resourceUrl?: string,
  ): Promise<PaginatedResponse> {
    return this.driver.paginate(page, limit, resourceUrl)
  }

  async count(column?: string): Promise<number> {
    return this.driver.count(column)
  }

  async countDistinct(column: string): Promise<number> {
    return this.driver.countDistinct(column)
  }

  async min(column: string): Promise<number> {
    return this.driver.min(column)
  }

  async max(column: string): Promise<number> {
    return this.driver.max(column)
  }

  async sum(column: string): Promise<number> {
    return this.driver.sum(column)
  }

  async sumDistinct(column: string): Promise<number> {
    return this.driver.sumDistinct(column)
  }

  async avg(column: string): Promise<number> {
    return this.driver.avg(column)
  }

  async avgDistinct(column: string): Promise<number> {
    return this.driver.avgDistinct(column)
  }

  async increment(column: string, value: number) {
    return this.driver.increment(column, value)
  }

  async decrement(column: string, value: number) {
    return this.driver.decrement(column, value)
  }

  async pluck(column: string): Promise<any[]> {
    return this.driver.pluck(column)
  }

  async columnInfo(column: string): Promise<any> {
    return this.driver.columnInfo(column)
  }

  async close(): Promise<void> {
    return this.driver.close()
  }

  buildTable(tableName: string): DatabaseContract {
    this.driver.buildTable(tableName)

    return this
  }

  buildSelect(...columns: string[]): DatabaseContract {
    this.driver.buildSelect(...columns)

    return this
  }

  buildWhere(
    statement: string | Record<string, any>,
    value?: any,
  ): DatabaseContract {
    this.driver.buildWhere(statement, value)

    return this
  }

  buildWhereLike(
    statement: string | Record<string, any>,
    value?: any,
  ): DatabaseContract {
    this.driver.buildWhereLike(statement, value)

    return this
  }

  buildWhereILike(
    statement: string | Record<string, any>,
    value?: any,
  ): DatabaseContract {
    this.driver.buildWhereILike(statement, value)

    return this
  }

  buildOrWhere(
    statement: string | Record<string, any>,
    value?: any,
  ): DatabaseContract {
    this.driver.buildOrWhere(statement, value)

    return this
  }

  buildWhereNot(
    statement: string | Record<string, any>,
    value?: any,
  ): DatabaseContract {
    this.driver.buildWhereNot(statement, value)

    return this
  }

  buildWhereIn(columnName: string, values: any[]): DatabaseContract {
    this.driver.buildWhereIn(columnName, values)

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): DatabaseContract {
    this.driver.buildWhereNotIn(columnName, values)

    return this
  }

  buildWhereNull(columnName: string): DatabaseContract {
    this.driver.buildWhereNull(columnName)

    return this
  }

  buildWhereNotNull(columnName: string): DatabaseContract {
    this.driver.buildWhereNotNull(columnName)

    return this
  }

  buildWhereExists(callback: any): DatabaseContract {
    this.driver.buildWhereExists(callback)

    return this
  }

  buildWhereNotExists(callback: any): DatabaseContract {
    this.driver.buildWhereNotExists(callback)

    return this
  }

  buildWhereBetween(columnName: string, values: [any, any]): DatabaseContract {
    this.driver.buildWhereBetween(columnName, values)

    return this
  }

  buildWhereNotBetween(
    columnName: string,
    values: [any, any],
  ): DatabaseContract {
    this.driver.buildWhereNotBetween(columnName, values)

    return this
  }

  buildWhereRaw(raw: string, queryValues: string[]): DatabaseContract {
    this.driver.buildWhereRaw(raw, queryValues)

    return this
  }

  buildJoin(
    tableName: string,
    column1: string,
    operator: string,
    column2?: string,
    joinType?: JoinType,
  ): DatabaseContract {
    this.driver.buildJoin(tableName, column1, operator, column2, joinType)

    return this
  }

  buildJoinRaw(raw: string, queryValues: string[]): DatabaseContract {
    this.driver.buildJoinRaw(raw, queryValues)

    return this
  }

  buildDistinct(...columns: string[]): DatabaseContract {
    this.driver.buildDistinct(...columns)

    return this
  }

  buildGroupBy(...columns: string[]): DatabaseContract {
    this.driver.buildGroupBy(...columns)

    return this
  }

  buildGroupByRaw(raw: string, queryValues: string[]): DatabaseContract {
    this.driver.buildGroupByRaw(raw, queryValues)

    return this
  }

  buildOrderBy(column: string, direction?: 'asc' | 'desc'): DatabaseContract {
    this.driver.buildOrderBy(column, direction)

    return this
  }

  buildOrderByRaw(raw: string, queryValues: string[]): DatabaseContract {
    this.driver.buildOrderByRaw(raw, queryValues)

    return this
  }

  buildHaving(column: string, operator: string, value: any): DatabaseContract {
    this.driver.buildHaving(column, operator, value)

    return this
  }

  buildSkip(number: number): DatabaseContract {
    this.driver.buildSkip(number)

    return this
  }

  buildLimit(number: number): DatabaseContract {
    this.driver.buildLimit(number)

    return this
  }
}
