/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { PaginationContract } from './PaginationContract'

export interface DriverContract {
  /**
   * Raw method
   *
   * @param raw The raw query that will be executed.
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  raw(raw: string, queryValues: string[]): Promise<any>

  /**
   * Table method
   *
   * @param tableName Table selected to run the query.
   *
   */
  table(tableName: string): DriverContract

  /**
   * Select method
   *
   * @param columns All the columns that will be selected, use * to get all.
   *
   */
  select(...columns: string[]): DriverContract

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
   * Where method
   *
   * @param statements All the statements for where clause.
   *
   */
  where(...statements: any[]): DriverContract

  /**
   * OrWhere method
   *
   * @param statements All the statements for more where clauses.
   *
   */
  orWhere(...statements: any[]): DriverContract

  /**
   * WhereNot method
   *
   * @param statements All the statements for whereNot.
   *
   */
  whereNot(...statements: any[]): DriverContract

  /**
   * WhereIn method
   *
   * @param statements All the statements for whereIn.
   *
   */
  whereIn(...statements: any[]): DriverContract

  /**
   * WhereNotIn method
   *
   * @param statements All the statements for whereNotIn.
   *
   */
  whereNotIn(...statements: any[]): DriverContract

  /**
   * WhereNotNull method
   *
   * @param statements All the statements for whereNotNull.
   *
   */
  whereNotNull(...statements: any[]): DriverContract

  /**
   * WhereExists method
   *
   * @param statements All the statements for whereExists.
   *
   */
  whereExists(...statements: any[]): DriverContract

  /**
   * WhereNotExists method
   *
   * @param statements All the statements for whereNotExists.
   *
   */
  whereNotExists(...statements: any[]): DriverContract

  /**
   * WhereBetween method
   *
   * @param statements All the statements for whereBetween.
   *
   */
  whereBetween(...statements: any[]): DriverContract

  /**
   * WhereNotBetween method
   *
   * @param statements All the statements for whereNotBetween.
   *
   */
  whereNotBetween(...statements: any[]): DriverContract

  /**
   * WhereRaw method
   *
   * @param raw Convenience helper for .where(Database.raw(query).
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  whereRaw(raw: string, queryValues: string[]): DriverContract

  /**
   * InnerJoin method
   *
   * @param joins All joins that will be done in the query.
   *
   */
  innerJoin(...joins: any[]): DriverContract

  /**
   * LeftJoin method
   *
   * @param joins All joins that will be done in the query.
   *
   */
  leftJoin(...joins: any[]): DriverContract

  /**
   * LeftOuterJoin method
   *
   * @param joins All joins that will be done in the query.
   *
   */
  leftOuterJoin(...joins: any[]): DriverContract

  /**
   * RightJoin method
   *
   * @param joins All joins that will be done in the query.
   *
   */
  rightJoin(...joins: any[]): DriverContract

  /**
   * RightOuterJoin method
   *
   * @param joins All joins that will be done in the query.
   *
   */
  rightOuterJoin(...joins: any[]): DriverContract

  /**
   * OuterJoin method
   *
   * @param joins All joins that will be done in the query.
   *
   */
  outerJoin(...joins: any[]): DriverContract

  /**
   * FullOuterJoin method
   *
   * @param joins All joins that will be done in the query.
   *
   */
  fullOuterJoin(...joins: any[]): DriverContract

  /**
   * CrossJoin method
   *
   * @param joins All joins that will be done in the query.
   *
   */
  crossJoin(...joins: any[]): DriverContract

  /**
   * JoinRaw method
   *
   * @param raw The join as raw.
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  joinRaw(raw: string, queryValues: string[]): DriverContract

  /**
   * Distinct method
   *
   * @param columns All columns to select as distinct.
   *
   */
  distinct(...columns: string[]): DriverContract

  /**
   * GroupBy method
   *
   * @param columns All columns to groupBy.
   *
   */
  groupBy(...columns: string[]): DriverContract

  /**
   * GroupByRaw method
   *
   * @param raw The groupBy as raw
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  groupByRaw(raw: string, queryValues: string[]): DriverContract

  /**
   * OrderBy method
   *
   * @param column Order the query by direction of column.
   * @param direction The direction of the orderBy, could be only asc or desc
   *
   */
  orderBy(column: string, direction?: 'asc' | 'desc'): DriverContract

  /**
   * OrderByRaw method
   *
   * @param raw The orderBy as raw
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  orderByRaw(raw: string, queryValues: string[]): DriverContract

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
  having(column: string, operator: string, value: any): DriverContract

  /**
   * Offset method
   *
   * @param number The offset number
   *
   */
  offset(number: number): DriverContract

  /**
   * Limit method
   *
   * @param number The limit number
   *
   */
  limit(number: number): DriverContract

  /**
   * Insert method
   *
   * In case of bulk inserts only the last inserted id will be returned.
   *
   * @param values The values that are going to be inserted.
   * @return The newly created id.
   *
   */
  insert(values: any | any[]): Promise<number>

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
  update(key: any | string, value?: any): Promise<number>

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
  truncate(tableName: string): void

  /**
   * TruncateAll method
   *
   * Removes all tables rows, resetting the tables' auto increment id to 0.
   *
   */
  truncateAll(): void

  /**
   * ForPage method
   *
   * Pagination
   *
   * @param page The page
   * @param limit The limit = 20
   *
   */
  forPage(page: number, limit: number): Promise<PaginationContract>

  /**
   * Paginate method
   *
   * Pagination
   *
   * @param page The page
   * @param limit The limit = 20
   *
   */
  paginate(page: number, limit: number): Promise<PaginationContract>

  /**
   * Count method
   *
   * @param column The column name = '*'
   * @return total The total
   *
   */
  count(column?: string): number

  /**
   * CountDistinct method
   *
   * @param column The column name distinct
   * @return total The total
   *
   */
  countDistinct(column: string): number

  /**
   * Min method
   *
   * @param column The column name to make the min
   * @return total The total
   *
   */
  min(column: string): number

  /**
   * Max method
   *
   * @param column The column name to make the max
   * @return total The total
   *
   */
  max(column: string): number

  /**
   * Sum method
   *
   * @param column The column name to make the sum
   * @return total The total
   *
   */
  sum(column: string): number

  /**
   * SumDistinct method
   *
   * @param column The column name to make the sumDistinct
   * @return total The total
   *
   */
  sumDistinct(column: string): number

  /**
   * Avg method
   *
   * @param column The column name to make the avg
   * @return total The total
   *
   */
  avg(column: string): number

  /**
   * AvgDistinct method
   *
   * @param column The column name to make the avgDistinct
   * @return total The total
   *
   */
  avgDistinct(column: string): number

  /**
   * Increment method
   *
   * Increase the column value by one
   *
   * @param column The column name to make the increment
   * @param value The value
   *
   */
  increment(column: string, value: any)

  /**
   * Decrement method
   *
   * Decrease the column value by one
   *
   * @param column The column name to make the decrement
   * @param value The value
   *
   */
  decrement(column: string, value: any)

  /**
   * Pluck method
   *
   * Return an array of values for the selected column, example: usersId [1, 2, 3...]
   *
   * @param column The column name to make the pluck
   * @return array Only the values of the selected column in the array
   *
   */
  pluck(column: string): any[]

  /**
   * Clone method
   *
   * Clone the current query chain for later usage
   *
   * @return driver Will return the actual query chain
   *
   */
  clone(): DriverContract

  /**
   * ColumnInfo method
   *
   * @param column Column to retrieve info
   * @return Return information for a given column
   *
   */
  columnInfo(column: string): DriverContract

  /**
   * Close method
   *
   * Close the database connection
   *
   * @param connections If nothing is passed, will close all the connections.
   *
   */
  close(connections?: string[]): void
}
