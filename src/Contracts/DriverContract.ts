/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { PaginatedResponse } from '@secjs/contracts'
import { TableColumnContract } from './TableColumnContract'

export interface DriverContract {
  /**
   * CloneQuery method
   *
   * Clone the current query chain for later usage
   *
   * @return Return the actual query chain
   *
   */
  cloneQuery(): any

  /**
   * BeginTransaction method
   *
   * @return The transaction started to make the queries
   *
   */
  beginTransaction(): Promise<any>

  /**
   * Transaction method
   *
   * Use to create the transaction in a single callback
   *
   * @return void
   *
   */
  transaction(callback: (trx: any) => Promise<void>): Promise<void>

  /**
   * CreateDatabase method
   *
   * @param databaseName The database name to be created
   *
   */
  createDatabase(databaseName: string): Promise<void>

  /**
   * DropDatabase method
   *
   * @param databaseName The database name to be dropped
   *
   */
  dropDatabase(databaseName: string): Promise<void>

  /**
   * CreateTable method
   *
   * @param tableName The table name to be created
   * @param columns The columns of the table
   *
   */
  createTable(tableName: string, columns: TableColumnContract[]): Promise<void>

  /**
   * DropTable method
   *
   * @param tableName The table name to be dropped
   *
   */
  dropTable(tableName: string): Promise<void>

  /**
   * Raw method
   *
   * @param raw The raw query that will be executed.
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  raw(raw: string, queryValues: string[]): Promise<any>

  /**
   * Query method
   *
   * @return A new instance of queryBuilder
   *
   */
  query(): any

  /**
   * BuildTable method
   *
   * @param tableName Table selected to run the query.
   *
   */
  buildTable(tableName: string): DriverContract

  /**
   * BuildSelect method
   *
   * @param columns All the columns that will be selected, use * to get all.
   *
   */
  buildSelect(...columns: string[]): DriverContract

  /**
   * Find method
   *
   * Use to get only one value or the first match
   *
   * @return Run the query adding a limit 1.
   */
  find(): Promise<any>

  /**
   * FindMany method
   *
   * Use to get collections
   *
   * @return Run the query and return an array.
   */
  findMany(): Promise<any[]>

  /**
   * BuildWhere method
   *
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   */
  buildWhere(statement: string | Record<string, any>, value?: any): DriverContract

  /**
   * BuildOrWhere method
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   *
   */
  buildOrWhere(statement: string | Record<string, any>, value?: any): DriverContract

  /**
   * BuildWhereNot method
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   *
   */
  buildWhereNot(statement: string | Record<string, any>, value?: any): DriverContract

  /**
   * BuildWhereIn method
   *
   * @param columnName The column to make the In.
   * @param values All the values to make the In.
   *
   */
  buildWhereIn(columnName: string, values: any[]): DriverContract

  /**
   * BuildWhereNotIn method
   *
   * @param columnName The column to make the NotIn.
   * @param values All the values to make the NotIn.
   *
   */
  buildWhereNotIn(columnName: string, values: any[]): DriverContract

  /**
   * BuildWhereNull method
   *
   * @param columnName The columnName for whereNull.
   *
   */
  buildWhereNull(columnName: string): DriverContract

  /**
   * BuildWhereNotNull method
   *
   * @param columnName The columnName for whereNotNull.
   *
   */
  buildWhereNotNull(columnName: string): DriverContract

  /**
   * BuildWhereExists method
   *
   * @param callback The callback to be executed in whereExists, could be a query builder too.
   *
   */
  buildWhereExists(callback: any): DriverContract

  /**
   * BuildWhereNotExists method
   *
   * @param callback The callback to be executed in whereNotExists, could be a query builder too.
   *
   */
  buildWhereNotExists(callback: any): DriverContract

  /**
   * BuildWhereBetween method
   *
   * @param columnName The column name to make the whereBetween.
   * @param values Two values to make the between range
   *
   */
  buildWhereBetween(columnName: string, values: [any, any]): DriverContract

  /**
   * BuildWhereNotBetween method
   *
   * @param columnName The column name to make the whereNotBetween.
   * @param values Two values to make the not between range
   *
   */
  buildWhereNotBetween(columnName: string, values: [any, any]): DriverContract

  /**
   * BuildWhereRaw method
   *
   * @param raw Convenience helper for .where(Database.raw(query).
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildWhereRaw(raw: string, queryValues: string[]): DriverContract

  /**
   * BuildInnerJoin method
   *
   *
   * @param raw Raw query to make the join
   */
  buildInnerJoin(raw: string): DriverContract

  /**
   * BuildInnerJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param column2 Second column of the verification
   */
  buildInnerJoin(tableName: string, column1: string, column2: string): DriverContract

  /**
   * BuildInnerJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildInnerJoin(tableName: string, column1: string, operator: string, column2: string): DriverContract

  /**
   * BuildLeftJoin method
   *
   *
   * @param raw Raw query to make the join
   */
  buildLeftJoin(raw: string): DriverContract

  /**
   * BuildLeftJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param column2 Second column of the verification
   */
  buildLeftJoin(tableName: string, column1: string, column2: string): DriverContract

  /**
   * BuildLeftJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildLeftJoin(tableName: string, column1: string, operator: string, column2: string): DriverContract

  /**
   * BuildLeftOuterJoin method
   *
   *
   * @param raw Raw query to make the join
   */
  buildLeftOuterJoin(raw: string): DriverContract

  /**
   * BuildLeftOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param column2 Second column of the verification
   */
  buildLeftOuterJoin(tableName: string, column1: string, column2: string): DriverContract

  /**
   * BuildLeftOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildLeftOuterJoin(tableName: string, column1: string, operator: string, column2: string): DriverContract

  /**
   * BuildRightJoin method
   *
   *
   * @param raw Raw query to make the join
   */
  buildRightJoin(raw: string): DriverContract

  /**
   * BuildRightJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param column2 Second column of the verification
   */
  buildRightJoin(tableName: string, column1: string, column2: string): DriverContract

  /**
   * BuildRightJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildRightJoin(tableName: string, column1: string, operator: string, column2: string): DriverContract

  /**
   * BuildRightOuterJoin method
   *
   *
   * @param raw Raw query to make the join
   */
  buildRightOuterJoin(raw: string): DriverContract

  /**
   * BuildRightOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param column2 Second column of the verification
   */
  buildRightOuterJoin(tableName: string, column1: string, column2: string): DriverContract

  /**
   * BuildRightOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildRightOuterJoin(tableName: string, column1: string, operator: string, column2: string): DriverContract

  /**
   * BuildOuterJoin method
   *
   *
   * @param raw Raw query to make the join
   */
  buildOuterJoin(raw: string): DriverContract

  /**
   * BuildOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param column2 Second column of the verification
   */
  buildOuterJoin(tableName: string, column1: string, column2: string): DriverContract

  /**
   * BuildOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildOuterJoin(tableName: string, column1: string, operator: string, column2: string): DriverContract

  /**
   * BuildFullOuterJoin method
   *
   *
   * @param raw Raw query to make the join
   */
  buildFullOuterJoin(raw: string): DriverContract

  /**
   * BuildFullOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param column2 Second column of the verification
   */
  buildFullOuterJoin(tableName: string, column1: string, column2: string): DriverContract

  /**
   * BuildFullOuterJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildFullOuterJoin(tableName: string, column1: string, operator: string, column2: string): DriverContract

  /**
   * BuildCrossJoin method
   *
   *
   * @param raw Raw query to make the join
   */
  buildCrossJoin(raw: string): DriverContract

  /**
   * BuildCrossJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param column2 Second column of the verification
   */
  buildCrossJoin(tableName: string, column1: string, column2: string): DriverContract

  /**
   * BuildCrossJoin method
   *
   *
   * @param tableName Table name or a raw query to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   */
  buildCrossJoin(tableName: string, column1?: string, operator?: string, column2?: string): DriverContract

  /**
   * BuildJoinRaw method
   *
   * @param raw The join as raw.
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildJoinRaw(raw: string, queryValues: string[]): DriverContract

  /**
   * BuildDistinct method
   *
   * @param columns All columns to select as distinct.
   *
   */
  buildDistinct(...columns: string[]): DriverContract

  /**
   * BuildGroupBy method
   *
   * @param columns All columns to groupBy.
   *
   */
  buildGroupBy(...columns: string[]): DriverContract

  /**
   * BuildGroupByRaw method
   *
   * @param raw The groupBy as raw
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildGroupByRaw(raw: string, queryValues: string[]): DriverContract

  /**
   * BuildOrderBy method
   *
   * @param column Order the query by direction of column.
   * @param direction The direction of the orderBy, could be only asc or desc
   *
   */
  buildOrderBy(column: string, direction?: 'asc' | 'desc'): DriverContract

  /**
   * BuildOrderByRaw method
   *
   * @param raw The orderBy as raw
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildOrderByRaw(raw: string, queryValues: string[]): DriverContract

  /**
   * BuildHaving method
   *
   * Must be called after groupBy()
   *
   * @param column The column
   * @param operator The operator
   * @param value The value
   *
   */
  buildHaving(column: string, operator: string, value: any): DriverContract

  /**
   * BuildOffset method
   *
   * @param number The offset number
   *
   */
  buildOffset(number: number): DriverContract

  /**
   * BuildLimit method
   *
   * @param number The limit number
   *
   */
  buildLimit(number: number): DriverContract

  /**
   * Insert method
   *
   * In case of bulk inserts only the last inserted id will be returned.
   *
   * @param values The values that are going to be inserted.
   * @return The newly created id or ids inside array.
   *
   */
  insert(values: any | any[]): Promise<string[]>

  /**
   * InsertAndGet method
   *
   * Same as insert but return an array with the values inserted
   *
   * @param values The values that are going to be inserted.
   * @return The array with the values inserted.
   *
   */
  insertAndGet(values: any | any[]): Promise<any[]>

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
  update(key: any | string, value?: any): Promise<string[]>

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
  updateAndGet(key: any | string, value?: any): Promise<any[]>

  /**
   * delete method
   *
   * @return The number of affected rows.
   *
   */
  delete(): Promise<number>

  /**
   * Truncate method
   *
   * Removes all table rows, resetting the table auto increment id to 0.
   *
   * @param tableName The table to be truncated
   *
   */
  truncate(tableName: string): Promise<void>

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
  forPage(page: number, limit: number): Promise<any[]>

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
  paginate(page: number, limit: number, resourceUrl?: string): Promise<PaginatedResponse<any>>

  /**
   * Count method
   *
   * @param column The column name = '*'
   * @return total The total
   *
   */
  count(column?: string): Promise<number>

  /**
   * CountDistinct method
   *
   * @param column The column name distinct
   * @return total The total
   *
   */
  countDistinct(column: string): Promise<number>

  /**
   * Min method
   *
   * @param column The column name to make the min
   * @return total The total
   *
   */
  min(column: string): Promise<number>

  /**
   * Max method
   *
   * @param column The column name to make the max
   * @return total The total
   *
   */
  max(column: string): Promise<number>

  /**
   * Sum method
   *
   * @param column The column name to make the sum
   * @return total The total
   *
   */
  sum(column: string): Promise<number>

  /**
   * SumDistinct method
   *
   * @param column The column name to make the sumDistinct
   * @return total The total
   *
   */
  sumDistinct(column: string): Promise<number>

  /**
   * Avg method
   *
   * @param column The column name to make the avg
   * @return total The total
   *
   */
  avg(column: string): Promise<number>

  /**
   * AvgDistinct method
   *
   * @param column The column name to make the avgDistinct
   * @return total The total
   *
   */
  avgDistinct(column: string): Promise<number>

  /**
   * Increment method
   *
   * Increase the column value by one
   *
   * @param column The column name to make the increment
   * @param value The value
   *
   */
  increment(column: string, value: number)

  /**
   * Decrement method
   *
   * Decrease the column value by one
   *
   * @param column The column name to make the decrement
   * @param value The value
   *
   */
  decrement(column: string, value: number)

  /**
   * Pluck method
   *
   * Return an array of values for the selected column, example: usersId [1, 2, 3...]
   *
   * @param column The column name to make the pluck
   * @return array Only the values of the selected column in the array
   *
   */
  pluck(column: string): Promise<any[]>

  /**
   * ColumnInfo method
   *
   * @param column Column to retrieve info
   * @return Return information for a given column
   *
   */
  columnInfo(column: string): Promise<any>

  /**
   * Close method
   *
   * Close the database connection
   *
   * @param connections If nothing is passed, will close all the connections.
   *
   */
  close(connections?: string[]): Promise<void>
}
