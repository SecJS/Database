/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Config } from '@secjs/config'
import { Drivers } from './Drivers/Drivers'
import { JoinType } from './Contracts/JoinType'
import { PaginatedResponse } from '@secjs/contracts'
import { DriverContract } from './Contracts/DriverContract'
import { DatabaseContract } from './Contracts/DatabaseContract'
import { InternalServerException, NotImplementedException } from '@secjs/exceptions'

export class Database implements DatabaseContract {
  private configs: any = {}

  private _tempDriver: DriverContract
  private _defaultDriver: DriverContract

  static build(
    name: string,
    driver: new (connection: string, configs?: any) => DriverContract,
  ) {
    if (Drivers[name])
      throw new InternalServerException(`Driver ${name} already exists`)

    Drivers[name] = driver
  }

  static get drivers(): string[] {
    return Object.keys(Drivers)
  }

  private get _driver(): DriverContract {
    if (this._tempDriver) return this._tempDriver

    return this._defaultDriver

    // let targetType = 'defaultDriver'
    // let target = this._defaultDriver
    //
    // if (this._tempDriver) {
    //   targetType = 'tempDriver'
    //   target = this._tempDriver
    // }
    //
    // const handler = {
    //   get: (target, property) => {
    //     const get = target[property]
    //
    //     if (targetType === 'tempDriver') {
    //       this._tempDriver = null
    //     }
    //
    //     return get
    //   }
    // }
    //
    // return new Proxy(target, handler)
  }

  private createDriverInstance(connectionName?: string) {
    connectionName = connectionName ? connectionName : Config.get('database.default')

    const connectionConfig = Config.get(`database.connections.${connectionName}`)

    if (!connectionConfig) {
      throw new NotImplementedException(
        `Connection ${connectionName} is not configured inside database.connections object from config/database file`,
      )
    }

    if (!Drivers[connectionConfig.driver]) {
      throw new NotImplementedException(
        `Driver ${connectionConfig.driver} does not exist, use Database.build method to create a new driver`,
      )
    }

    return new Drivers[connectionConfig.driver](connectionName, this.configs)
  }

  constructor() {
    this._tempDriver = null
    this._defaultDriver = this.createDriverInstance()
  }

  resetConfigs(): DatabaseContract {
    this.configs = {}

    this._defaultDriver.close()
    this._defaultDriver = this.createDriverInstance()

    return this
  }

  removeConfig(key: string): DatabaseContract {
    delete this.configs[key]

    this._defaultDriver.close()
    this._defaultDriver = this.createDriverInstance()

    return this
  }

  addConfig(key: string, value: any): DatabaseContract {
    this.configs[key] = value

    this._defaultDriver.close()
    this._defaultDriver = this.createDriverInstance()

    return this
  }

  changeDefaultConnection(connection: string): DatabaseContract {
    this._defaultDriver.close()
    this._defaultDriver = this.createDriverInstance(connection)

    return this
  }

  connection(connection: string): DatabaseContract {
    this._tempDriver.close()
    this._tempDriver = this.createDriverInstance(connection)

    return this
  }

  // DriverContract Methods

  async connect(): Promise<void> {
    await this._driver.connect()
  }

  on(event: string, callback: (...params: any) => void) {
    this._driver.on(event, callback)
  }

  cloneQuery<T = any>(): T {
    return this._driver.cloneQuery()
  }

  async beginTransaction<T = any>(): Promise<T> {
    return this._driver.beginTransaction()
  }

  async transaction<T = any>(callback: (trx: T) => Promise<void>): Promise<void> {
    return this._driver.transaction(callback)
  }

  async createDatabase(databaseName: string): Promise<void> {
    await this._driver.createDatabase(databaseName)
  }

  async dropDatabase(databaseName: string): Promise<void> {
    await this._driver.dropDatabase(databaseName)
  }

  async createTable(tableName: string, callback: (tableBuilder: any) => void): Promise<void> {
    await this._driver.createTable(tableName, callback)
  }

  async dropTable(tableName: string): Promise<void> {
    await this._driver.dropTable(tableName)
  }

  async raw(raw: string, queryValues: string[]): Promise<any> {
    return this._driver.raw(raw, queryValues)
  }

  async find(): Promise<any> {
    return this._driver.find()
  }

  async findMany(): Promise<any[]> {
    return this._driver.findMany()
  }

  async insert(values: any | any[]): Promise<string[]> {
    return this._driver.insert(values)
  }

  async insertAndGet(values: any | any[]): Promise<any[]> {
    return this._driver.insertAndGet(values)
  }

  async update(key: any | string, value?: any): Promise<string[]> {
    return this._driver.update(key, value)
  }

  async updateAndGet(key: any | string, value?: any): Promise<any[]> {
    return this._driver.updateAndGet(key, value)
  }

  async delete(): Promise<number> {
    return this._driver.delete()
  }

  async truncate(tableName: string): Promise<void> {
    return this._driver.truncate(tableName)
  }

  async forPage(page: number, limit: number): Promise<any[]> {
    return this._driver.forPage(page, limit)
  }

  async paginate(page: number, limit: number, resourceUrl?: string): Promise<PaginatedResponse<any>> {
    return this._driver.paginate(page, limit, resourceUrl)
  }

  async count(column?: string): Promise<number> {
    return this._driver.count(column)
  }

  async countDistinct(column: string): Promise<number> {
    return this._driver.countDistinct(column)
  }

  async min(column: string): Promise<number> {
    return this._driver.min(column)
  }

  async max(column: string): Promise<number> {
    return this._driver.max(column)
  }

  async sum(column: string): Promise<number> {
    return this._driver.sum(column)
  }

  async sumDistinct(column: string): Promise<number> {
    return this._driver.sumDistinct(column)
  }

  async avg(column: string): Promise<number> {
    return this._driver.avg(column)
  }

  async avgDistinct(column: string): Promise<number> {
    return this._driver.avgDistinct(column)
  }

  async increment(column: string, value: number) {
    return this._driver.increment(column, value)
  }

  async decrement(column: string, value: number) {
    return this._driver.decrement(column, value)
  }

  async pluck(column: string): Promise<any[]> {
    return this._driver.pluck(column)
  }

  async columnInfo(column: string): Promise<any> {
    return this._driver.columnInfo(column)
  }

  async close(connections?: string[]): Promise<void> {
    return this._driver.close(connections)
  }

  query(): any {
    return this._driver.query()
  }

  buildTable(tableName: string): DatabaseContract {
    this._driver.buildTable(tableName)

    return this
  }

  buildSelect(...columns: string[]): DatabaseContract {
    this._driver.buildSelect(...columns)

    return this
  }

  buildWhere(statement: string | Record<string, any>, value?: any): DatabaseContract {
    this._driver.buildWhere(statement, value)

    return this
  }

  buildWhereLike(statement: string | Record<string, any>, value?: any): DatabaseContract {
    this._driver.buildWhereLike(statement, value)

    return this
  }

  buildWhereILike(statement: string | Record<string, any>, value?: any): DatabaseContract {
    this._driver.buildWhereILike(statement, value)

    return this
  }

  buildOrWhere(statement: string | Record<string, any>, value?: any): DatabaseContract {
    this._driver.buildOrWhere(statement, value)

    return this
  }

  buildWhereNot(statement: string | Record<string, any>, value?: any): DatabaseContract {
    this._driver.buildWhereNot(statement, value)

    return this
  }

  buildWhereIn(columnName: string, values: any[]): DatabaseContract {
    this._driver.buildWhereIn(columnName, values)

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): DatabaseContract {
    this._driver.buildWhereNotIn(columnName, values)

    return this
  }

  buildWhereNull(columnName: string): DatabaseContract {
    this._driver.buildWhereNull(columnName)

    return this
  }

  buildWhereNotNull(columnName: string): DatabaseContract {
    this._driver.buildWhereNotNull(columnName)

    return this
  }

  buildWhereExists(callback: any): DatabaseContract {
    this._driver.buildWhereExists(callback)

    return this
  }

  buildWhereNotExists(callback: any): DatabaseContract {
    this._driver.buildWhereNotExists(callback)

    return this
  }

  buildWhereBetween(columnName: string, values: [any, any]): DatabaseContract {
    this._driver.buildWhereBetween(columnName, values)

    return this
  }

  buildWhereNotBetween(columnName: string, values: [any, any]): DatabaseContract {
    this._driver.buildWhereNotBetween(columnName, values)

    return this
  }

  buildWhereRaw(raw: string, queryValues: string[]): DatabaseContract {
    this._driver.buildWhereRaw(raw, queryValues)

    return this
  }

  buildJoin(tableName: string, column1: string, operator: string, column2?: string, joinType?: JoinType): DatabaseContract {
    this._driver.buildJoin(tableName, column1, operator, column2, joinType)

    return this
  }

  buildJoinRaw(raw: string, queryValues: string[]): DatabaseContract {
    this._driver.buildJoinRaw(raw, queryValues)

    return this
  }

  buildDistinct(...columns: string[]): DatabaseContract {
    this._driver.buildDistinct(...columns)

    return this
  }

  buildGroupBy(...columns: string[]): DatabaseContract {
    this._driver.buildGroupBy(...columns)

    return this
  }

  buildGroupByRaw(raw: string, queryValues: string[]): DatabaseContract {
    this._driver.buildGroupByRaw(raw, queryValues)

    return this
  }

  buildOrderBy(column: string, direction?: 'asc' | 'desc'): DatabaseContract {
    this._driver.buildOrderBy(column, direction)

    return this
  }

  buildOrderByRaw(raw: string, queryValues: string[]): DatabaseContract {
    this._driver.buildOrderByRaw(raw, queryValues)

    return this
  }

  buildHaving(column: string, operator: string, value: any): DatabaseContract {
    this._driver.buildHaving(column, operator, value)

    return this
  }

  buildSkip(number: number): DatabaseContract {
    this._driver.buildSkip(number)

    return this
  }

  buildLimit(number: number): DatabaseContract {
    this._driver.buildLimit(number)

    return this
  }
}
