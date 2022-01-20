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
import { DriverContract } from './Contracts/DriverContract'
import { InternalServerException, NotImplementedException } from '@secjs/exceptions'
import { PaginatedResponse } from '@secjs/contracts'
import { TableColumnContract } from './Contracts/TableColumnContract'

export class Database {
  private configs: any = {}
  private _tempDriver: DriverContract | null = null
  private _defaultDriver: DriverContract | null = null

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
    this._defaultDriver = this.createDriverInstance()
  }

  resetConfigs(): Database {
    this.configs = {}

    this._defaultDriver = this.createDriverInstance()

    return this
  }

  removeConfig(key: string): Database {
    delete this.configs[key]

    this._defaultDriver = this.createDriverInstance()

    return this
  }

  addConfig(key: string, value: any): Database {
    this.configs[key] = value

    this._defaultDriver = this.createDriverInstance()

    return this
  }

  changeDefaultConnection(connection: string): Database {
    this._defaultDriver = this.createDriverInstance(connection)

    return this
  }

  connection(connection: string): Database {
    this._tempDriver = this.createDriverInstance(connection)

    return this
  }

  /**
   * BeginTransaction method
   *
   * Type this with your specific query builder
   *
   * @return The transaction started to make the queries
   *
   */
  async beginTransaction<T = any>(): Promise<T> {
    return this._driver.beginTransaction()
  }

  /**
   * Transaction method
   *
   * Type this with your specific query builder
   * Use to create the transaction in a single callback
   *
   * @return void
   *
   */
  async transaction<T = any>(callback: (trx: T) => Promise<void>): Promise<void> {
    return this._driver.transaction(callback)
  }

  /**
   * CreateDatabase method
   *
   * @param databaseName The database name to be created
   *
   */
  async createDatabase(databaseName: string): Promise<void> {
    await this._driver.createDatabase(databaseName)
  }

  /**
   * DropDatabase method
   *
   * @param databaseName The database name to be dropped
   *
   */
  async dropDatabase(databaseName: string): Promise<void> {
    await this._driver.dropDatabase(databaseName)
  }

  /**
   * CreateTable method
   *
   * @param tableName The table name to be created
   * @param columns The columns of the table
   *
   */
  async createTable(tableName: string, columns: TableColumnContract[]): Promise<void> {
    await this._driver.createTable(tableName, columns)
  }

  /**
   * DropTable method
   *
   * @param tableName The table name to be dropped
   *
   */
  async dropTable(tableName: string): Promise<void> {
    await this._driver.dropTable(tableName)
  }

  /**
   * Raw method
   *
   * @param raw The raw query that will be executed.
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  async raw(raw: string, queryValues: string[]): Promise<any> {
    const data = await this._driver.raw(raw, queryValues)

    this._tempDriver = null

    return data
  }

  /**
   * Query method
   *
   * @return A new instance of queryBuilder
   *
   */
  query(): any {
    return this._driver.query()
  }

  /**
   * Table method
   *
   * @param tableName Table selected to run the query.
   *
   */
  buildTable(tableName: string): Database {
    this._driver.buildTable(tableName)

    return this
  }

  /**
   * Select method
   *
   * @param columns All the columns that will be selected, use * to get all.
   *
   */
  buildSelect(...columns: string[]): Database {
    this._driver.buildSelect(...columns)

    return this
  }

  /**
   * Find method
   *
   * Use to get only one value or the first match
   *
   * @return Run the query adding a limit 1.
   */
  async find(): Promise<any> {
    return this._driver.find()
  }

  /**
   * FindMany method
   *
   * Use to get collections
   *
   * @return Run the query and return an array.
   */
  async findMany(): Promise<any[]> {
    return this._driver.findMany()
  }

  /**
   * Where method
   *
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   */
  buildWhere(statement: string | Record<string, any>, value?: any): Database {
    this._driver.buildWhere(statement, value)

    return this
  }

  /**
   * OrWhere method
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   *
   */
  buildOrWhere(statement: string | Record<string, any>, value?: any): Database {
    this._driver.buildOrWhere(statement, value)

    return this
  }

  /**
   * WhereNot method
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   *
   */
  buildWhereNot(statement: string | Record<string, any>, value?: any): Database {
    this._driver.buildWhereNot(statement, value)

    return this
  }

  /**
   * WhereIn method
   *
   * @param columnName The column to make the In.
   * @param values All the values to make the In.
   *
   */
  buildWhereIn(columnName: string, values: any[]): Database {
    this._driver.buildWhereIn(columnName, values)

    return this
  }

  /**
   * WhereNotIn method
   *
   * @param columnName The column to make the NotIn.
   * @param values All the values to make the NotIn.
   *
   */
  buildWhereNotIn(columnName: string, values: any[]): Database {
    this._driver.buildWhereNotIn(columnName, values)

    return this
  }

  /**
   * WhereNull method
   *
   * @param columnName The columnName for whereNull.
   *
   */
  buildWhereNull(columnName: string): Database {
    this._driver.buildWhereNull(columnName)

    return this
  }

  /**
   * WhereNotNull method
   *
   * @param columnName The columnName for whereNotNull.
   *
   */
  buildWhereNotNull(columnName: string): Database {
    this._driver.buildWhereNotNull(columnName)

    return this
  }

  /**
   * WhereExists method
   *
   * @param callback The callback to be executed in whereExists, could be a query builder too.
   *
   */
  buildWhereExists(callback: any): Database {
    this._driver.buildWhereExists(callback)

    return this
  }

  /**
   * WhereNotExists method
   *
   * @param callback The callback to be executed in whereNotExists, could be a query builder too.
   *
   */
  buildWhereNotExists(callback: any): Database {
    this._driver.buildWhereNotExists(callback)

    return this
  }

  /**
   * WhereBetween method
   *
   * @param columnName The column name to make the whereBetween.
   * @param values Two values to make the between range
   *
   */
  buildWhereBetween(columnName: string, values: [any, any]): Database {
    this._driver.buildWhereBetween(columnName, values)

    return this
  }

  /**
   * WhereNotBetween method
   *
   * @param columnName The column name to make the whereNotBetween.
   * @param values Two values to make the not between range
   *
   */
  buildWhereNotBetween(columnName: string, values: [any, any]): Database {
    this._driver.buildWhereNotBetween(columnName, values)

    return this
  }

  /**
   * WhereRaw method
   *
   * @param raw Convenience helper for .where(Database.raw(query).
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildWhereRaw(raw: string, queryValues: string[]): Database {
    this._driver.buildWhereRaw(raw, queryValues)

    return this
  }

  /**
   * InnerJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildInnerJoin(tableName: string, column1?: string, operator?: string, column2?: string): Database {
    this._driver.buildInnerJoin(tableName, column1, operator, column2)

    return this
  }

  /**
   * LeftJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildLeftJoin(tableName: string, column1?: string, operator?: string, column2?: string): Database {
    this._driver.buildLeftJoin(tableName, column1, operator, column2)

    return this
  }

  /**
   * LeftOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildLeftOuterJoin(tableName: string, column1?: string, operator?: string, column2?: string): Database {
    this._driver.buildLeftOuterJoin(tableName, column1, operator, column2)

    return this
  }

  /**
   * RightJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildRightJoin(tableName: string, column1?: string, operator?: string, column2?: string): Database {
    this._driver.buildRightJoin(tableName, column1, operator, column2)

    return this
  }

  /**
   * RightOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildRightOuterJoin(tableName: string, column1?: string, operator?: string, column2?: string): Database {
    this._driver.buildRightOuterJoin(tableName, column1, operator, column2)

    return this
  }

  /**
   * OuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildOuterJoin(tableName: string, column1?: string, operator?: string, column2?: string): Database {
    this._driver.buildOuterJoin(tableName, column1, operator, column2)

    return this
  }

  /**
   * fullOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildFullOuterJoin(tableName: string, column1?: string, operator?: string, column2?: string): Database {
    this._driver.buildFullOuterJoin(tableName, column1, operator, column2)

    return this
  }

  /**
   * CrossJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildCrossJoin(tableName: string, column1?: string, operator?: string, column2?: string): Database {
    this._driver.buildCrossJoin(tableName, column1, operator, column2)

    return this
  }

  /**
   * JoinRaw method
   *
   * @param raw The join as raw.
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildJoinRaw(raw: string, queryValues: string[]): Database {
    this._driver.buildJoinRaw(raw, queryValues)

    return this
  }

  /**
   * Distinct method
   *
   * @param columns All columns to select as distinct.
   *
   */
  buildDistinct(...columns: string[]): Database {
    this._driver.buildDistinct(...columns)

    return this
  }

  /**
   * GroupBy method
   *
   * @param columns All columns to groupBy.
   *
   */
  buildGroupBy(...columns: string[]): Database {
    this._driver.buildGroupBy(...columns)

    return this
  }

  /**
   * GroupByRaw method
   *
   * @param raw The groupBy as raw
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildGroupByRaw(raw: string, queryValues: string[]): Database {
    this._driver.buildGroupByRaw(raw, queryValues)

    return this
  }

  /**
   * OrderBy method
   *
   * @param column Order the query by direction of column.
   * @param direction The direction of the orderBy, could be only asc or desc
   *
   */
  buildOrderBy(column: string, direction?: 'asc' | 'desc'): Database {
    this._driver.buildOrderBy(column, direction)

    return this
  }

  /**
   * OrderByRaw method
   *
   * @param raw The orderBy as raw
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildOrderByRaw(raw: string, queryValues: string[]): Database {
    this._driver.buildOrderByRaw(raw, queryValues)

    return this
  }

  /**
   * Having method
   *
   * Must be called after groupBy()
   *
   * @param column The column
   * @param operator The operator
   * @param value The value
   *
   */
  buildHaving(column: string, operator: string, value: any): Database {
    this._driver.buildHaving(column, operator, value)

    return this
  }

  /**
   * Offset method
   *
   * @param number The offset number
   *
   */
  buildOffset(number: number): Database {
    this._driver.buildOffset(number)

    return this
  }

  /**
   * Limit method
   *
   * @param number The limit number
   *
   */
  buildLimit(number: number): Database {
    this._driver.buildLimit(number)

    return this
  }

  /**
   * Insert method
   *
   * In case of bulk inserts only the last inserted id will be returned.
   *
   * @param values The values that are going to be inserted.
   * @return The newly created id.
   *
   */
  async insert(values: any | any[]): Promise<string[]> {
    return this._driver.insert(values)
  }

  /**
   * InsertAndGet method
   *
   * Same as insert but return an array with the values inserted
   *
   * @param values The values that are going to be inserted.
   * @return The array with the values inserted.
   *
   */
  async insertAndGet(values: any | any[]): Promise<any[]> {
    return this._driver.insertAndGet(values)
  }

  /**
   * Update method
   *
   * For multiple columns, pass those columns/values as an object.
   *
   * @param key The key to be updated.
   * @param value The value of the key.
   * @return The number of affected rows.
   *
   */
  async update(key: any | string, value?: any): Promise<string[]> {
    return this._driver.update(key, value)
  }

  /**
   * UpdateAndGet method
   *
   * Same as update but return the payload updated.
   *
   * @param key The key to be updated.
   * @param value The value of the key.
   * @return The payload updated.
   *
   */
  async updateAndGet(key: any | string, value?: any): Promise<any[]> {
    return this._driver.updateAndGet(key, value)
  }

  /**
   * delete method
   *
   * @return The number of affected rows.
   *
   */
  async delete(): Promise<number> {
    return this._driver.delete()
  }

  /**
   * Truncate method
   *
   * Removes all table rows, resetting the table auto increment id to 0.
   *
   * @param tableName The table to be truncated
   *
   */
  async truncate(tableName: string): Promise<void> {
    return this._driver.truncate(tableName)
  }

  // /**
  //  * TruncateAll method
  //  *
  //  * Removes all tables rows, resetting the tables' auto increment id to 0.
  //  *
  //  */
  // truncateAll(): void

  /**
   * ForPage method
   *
   * Pagination without PaginatedResponse
   *
   * @param page The page
   * @param limit The limit = 20
   *
   */
  async forPage(page: number, limit: number): Promise<any[]> {
    return this._driver.forPage(page, limit)
  }

  /**
   * Paginate method
   *
   * Pagination
   *
   * @param page The page
   * @param limit The limit = 20
   * @param resourceUrl The resourceUrl from the request to make the links
   *
   */
  async paginate(page: number, limit: number, resourceUrl?: string): Promise<PaginatedResponse<any>> {
    return this._driver.paginate(page, limit, resourceUrl)
  }

  /**
   * Count method
   *
   * @param column The column name = '*'
   * @return total The total
   *
   */
  async count(column?: string): Promise<number> {
    return this._driver.count(column)
  }

  /**
   * CountDistinct method
   *
   * @param column The column name distinct
   * @return total The total
   *
   */
  async countDistinct(column: string): Promise<number> {
    return this._driver.countDistinct(column)
  }

  /**
   * Min method
   *
   * @param column The column name to make the min
   * @return total The total
   *
   */
  async min(column: string): Promise<number> {
    return this._driver.min(column)
  }

  /**
   * Max method
   *
   * @param column The column name to make the max
   * @return total The total
   *
   */
  async max(column: string): Promise<number> {
    return this._driver.max(column)
  }

  /**
   * Sum method
   *
   * @param column The column name to make the sum
   * @return total The total
   *
   */
  async sum(column: string): Promise<number> {
    return this._driver.sum(column)
  }

  /**
   * SumDistinct method
   *
   * @param column The column name to make the sumDistinct
   * @return total The total
   *
   */
  async sumDistinct(column: string): Promise<number> {
    return this._driver.sumDistinct(column)
  }

  /**
   * Avg method
   *
   * @param column The column name to make the avg
   * @return total The total
   *
   */
  async avg(column: string): Promise<number> {
    return this._driver.avg(column)
  }

  /**
   * AvgDistinct method
   *
   * @param column The column name to make the avgDistinct
   * @return total The total
   *
   */
  async avgDistinct(column: string): Promise<number> {
    return this._driver.avgDistinct(column)
  }

  /**
   * Increment method
   *
   * Increase the column value by one
   *
   * @param column The column name to make the increment
   * @param value The value
   *
   */
  async increment(column: string, value: number) {
    return this._driver.increment(column, value)
  }

  /**
   * Decrement method
   *
   * Decrease the column value by one
   *
   * @param column The column name to make the decrement
   * @param value The value
   *
   */
  async decrement(column: string, value: number) {
    return this._driver.decrement(column, value)
  }

  /**
   * Pluck method
   *
   * Return an array of values for the selected column, example: usersId [1, 2, 3...]
   *
   * @param column The column name to make the pluck
   * @return array Only the values of the selected column in the array
   *
   */
  async pluck(column: string): Promise<any[]> {
    return this._driver.pluck(column)
  }

  /**
   * Clone method
   *
   * Clone the current query chain for later usage
   *
   * @return driver Will return the actual query chain
   *
   */
  clone(): any {
    return this._driver.clone()
  }

  /**
   * ColumnInfo method
   *
   * @param column Column to retrieve info
   * @return Return information for a given column
   *
   */
  async columnInfo(column: string): Promise<any> {
    return this._driver.columnInfo(column)
  }

  /**
   * Close method
   *
   * Close the database connection
   *
   * @param connections If nothing is passed, will close all the connections.
   *
   */
  async close(connections?: string[]): Promise<void> {
    return this._driver.close(connections)
  }
}
