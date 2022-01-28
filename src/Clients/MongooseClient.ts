/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { paginate } from '@secjs/utils'
import { JoinType } from '../Contracts/JoinType'
import { PaginatedResponse } from '@secjs/contracts'
import { ClientContract } from '../Contracts/ClientContract'

export class MongooseClient implements ClientContract {
  constructor(client: any | string, configs: any = {}) {
  }

  /**
   * Commit the transaction
   *
   * @param value
   */
  async commit(value?: any): Promise<any | any[]> {
    console.log(`Method ${this.commit.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve({}))
  }


  /**
   * Rollback the transaction
   *
   * @param error
   */
  async rollback(error?: any): Promise<any | any[]> {
    console.log(`Method ${this.rollback.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve({}))
  }

  /**
   * Connect method
   *
   * The most important method from drivers. Creates the connection with database
   *
   */
  async connect(client: string): Promise<void> {
    console.log(`Method ${this.connect.name} has not been implemented in ${MongooseClient.name}`)
  }

  /**
   * On method
   *
   * @param event The event name
   * @param callback The callback that will execute when the event fire
   *
   */
  on(event: string, callback: (...params: any) => void): void {
    console.log(`Method ${this.on.name} has not been implemented in ${MongooseClient.name}`)
  }

  /**
   * CloneQuery method
   *
   * Clone the current query chain for later usage
   *
   * @return Return the actual query chain
   *
   */
  cloneQuery(): any {
    console.log(`Method ${this.cloneQuery.name} has not been implemented in ${MongooseClient.name}`)

    return {}
  }

  /**
   * BeginTransaction method
   *
   * @return The transaction started to make the queries
   *
   */
  async beginTransaction(): Promise<any> {
    console.log(`Method ${this.beginTransaction.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve({}))
  }


  /**
   * Transaction method
   *
   * Use to create the transaction in a single callback
   *
   * @return void
   *
   */
  async transaction(callback: (trx: any) => Promise<void>): Promise<void> {
    console.log(`Method ${this.transaction.name} has not been implemented in ${MongooseClient.name}`)
  }

  /**
   * CreateDatabase method
   *
   * @param databaseName The database name to be created
   *
   */
  async createDatabase(databaseName: string): Promise<void> {
    console.log(`Method ${this.createDatabase.name} has not been implemented in ${MongooseClient.name}`)
  }

  /**
   * DropDatabase method
   *
   * @param databaseName The database name to be dropped
   *
   */
  async dropDatabase(databaseName: string): Promise<void> {
    console.log(`Method ${this.dropDatabase.name} has not been implemented in ${MongooseClient.name}`)
  }

  /**
   * CreateTable method
   *
   * @param tableName The table name to be created
   * @param callback The callback function with tableBuilder inside
   *
   */
  async createTable(tableName: string, callback: (tableBuilder: any) => void): Promise<void> {
    console.log(`Method ${this.createTable.name} has not been implemented in ${MongooseClient.name}`)
  }

  /**
   * DropTable method
   *
   * @param tableName The table name to be dropped
   *
   */
  async dropTable(tableName: string): Promise<void> {
    console.log(`Method ${this.dropTable.name} has not been implemented in ${MongooseClient.name}`)
  }

  /**
   * Raw method
   *
   * @param raw The raw query that will be executed.
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  async raw(raw: string, queryValues?: any[]): Promise<any> {
    console.log(`Method ${this.raw.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve({}))
  }

  setQueryBuilder(query: any): void {
    console.log(`Method ${this.setQueryBuilder.name} has not been implemented in ${MongooseClient.name}`)
  }

  /**
   * Query method
   *
   * @return A new instance of queryBuilder
   *
   */
  query(): any {
    console.log(`Method ${this.query.name} has not been implemented in ${MongooseClient.name}`)
  }

  /**
   * Find method
   *
   * Use to get only one value or the first match
   *
   * @return Run the query adding a limit 1.
   */
  async find(): Promise<any> {
    console.log(`Method ${this.find.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve({}))
  }

  /**
   * FindMany method
   *
   * Use to get collections
   *
   * @return Run the query and return an array.
   */
  async findMany(): Promise<any[]> {
    console.log(`Method ${this.findMany.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
  }

  /**
   * Insert method
   *
   * In case of bulk inserts only the last inserted id will be returned.
   *
   * @param values The values that are going to be inserted.
   * @return The newly created id or ids inside array.
   *
   */
  async insert(values: any | any[]): Promise<string[]> {
    console.log(`Method ${this.insert.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
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
    console.log(`Method ${this.insertAndGet.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
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
    console.log(`Method ${this.update.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
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
    console.log(`Method ${this.updateAndGet.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
  }

  /**
   * delete method
   *
   * @return The number of affected rows.
   *
   */
  async delete(): Promise<number> {
    console.log(`Method ${this.delete.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
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
    console.log(`Method ${this.truncate.name} has not been implemented in ${MongooseClient.name}`)
  }

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
    console.log(`Method ${this.forPage.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
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
    console.log(`Method ${this.paginate.name} has not been implemented in ${MongooseClient.name}`)

    return paginate([], 0, { page, limit, resourceUrl })
  }

  /**
   * Count method
   *
   * @param column The column name = '*'
   * @return total The total
   *
   */
  async count(column?: string): Promise<number> {
    console.log(`Method ${this.count.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  /**
   * CountDistinct method
   *
   * @param column The column name distinct
   * @return total The total
   *
   */
  async countDistinct(column: string): Promise<number> {
    console.log(`Method ${this.countDistinct.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  /**
   * Min method
   *
   * @param column The column name to make the min
   * @return total The total
   *
   */
  async min(column: string): Promise<number> {
    console.log(`Method ${this.min.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  /**
   * Max method
   *
   * @param column The column name to make the max
   * @return total The total
   *
   */
  async max(column: string): Promise<number> {
    console.log(`Method ${this.max.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  /**
   * Sum method
   *
   * @param column The column name to make the sum
   * @return total The total
   *
   */
  async sum(column: string): Promise<number> {
    console.log(`Method ${this.sum.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  /**
   * SumDistinct method
   *
   * @param column The column name to make the sumDistinct
   * @return total The total
   *
   */
  async sumDistinct(column: string): Promise<number> {
    console.log(`Method ${this.sumDistinct.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  /**
   * Avg method
   *
   * @param column The column name to make the avg
   * @return total The total
   *
   */
  async avg(column: string): Promise<number> {
    console.log(`Method ${this.avg.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
  }

  /**
   * AvgDistinct method
   *
   * @param column The column name to make the avgDistinct
   * @return total The total
   *
   */
  async avgDistinct(column: string): Promise<number> {
    console.log(`Method ${this.avgDistinct.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
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
    console.log(`Method ${this.increment.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
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
    console.log(`Method ${this.decrement.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve(0))
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
    console.log(`Method ${this.pluck.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve([]))
  }

  /**
   * ColumnInfo method
   *
   * @param column Column to retrieve info
   * @return Return information for a given column
   *
   */
  async columnInfo(column: string): Promise<any> {
    console.log(`Method ${this.columnInfo.name} has not been implemented in ${MongooseClient.name}`)

    return new Promise(resolve => resolve({}))
  }

  /**
   * Close method
   *
   * Close the database connection
   *
   */
  async close(): Promise<void> {
    console.log(`Method ${this.close.name} has not been implemented in ${MongooseClient.name}`)
  }

  /**
   * BuildTable method
   *
   * @param tableName Table selected to run the query.
   *
   */
  buildTable(tableName: string): ClientContract {
    console.log(`Method ${this.buildTable.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildSelect method
   *
   * @param columns All the columns that will be selected, use * to get all.
   *
   */
  buildSelect(...columns: string[]): ClientContract {
    console.log(`Method ${this.buildSelect.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhere method
   *
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   */
  buildWhere(statement: string | Record<string, any>, value?: any): ClientContract {
    console.log(`Method ${this.buildWhere.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereLike method
   *
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   */
  buildWhereLike(statement: string | Record<string, any>, value?: any): ClientContract {
    console.log(`Method ${this.buildWhereLike.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereILike method
   *
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   */
  buildWhereILike(statement: string | Record<string, any>, value?: any): ClientContract {
    console.log(`Method ${this.buildWhereILike.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildOrWhere method
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   *
   */
  buildOrWhere(statement: string | Record<string, any>, value?: any): ClientContract {
    console.log(`Method ${this.buildOrWhere.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereNot method
   *
   * @param statement Key or an object to make the where
   * @param value The value, should be null when statement is an object
   *
   */
  buildWhereNot(statement: string | Record<string, any>, value?: any): ClientContract {
    console.log(`Method ${this.buildWhereNot.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereIn method
   *
   * @param columnName The column to make the In.
   * @param values All the values to make the In.
   *
   */
  buildWhereIn(columnName: string, values: any[]): ClientContract {
    console.log(`Method ${this.buildWhereIn.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereNotIn method
   *
   * @param columnName The column to make the NotIn.
   * @param values All the values to make the NotIn.
   *
   */
  buildWhereNotIn(columnName: string, values: any[]): ClientContract {
    console.log(`Method ${this.buildWhereNotIn.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereNull method
   *
   * @param columnName The columnName for whereNull.
   *
   */
  buildWhereNull(columnName: string): ClientContract {
    console.log(`Method ${this.buildWhereNull.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereNotNull method
   *
   * @param columnName The columnName for whereNotNull.
   *
   */
  buildWhereNotNull(columnName: string): ClientContract {
    console.log(`Method ${this.buildWhereNotNull.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereExists method
   *
   * @param callback The callback to be executed in whereExists, could be a query builder too.
   *
   */
  buildWhereExists(callback: any): ClientContract {
    console.log(`Method ${this.buildWhereExists.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereNotExists method
   *
   * @param callback The callback to be executed in whereNotExists, could be a query builder too.
   *
   */
  buildWhereNotExists(callback: any): ClientContract {
    console.log(`Method ${this.buildWhereNotExists.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereBetween method
   *
   * @param columnName The column name to make the whereBetween.
   * @param values Two values to make the between range
   *
   */
  buildWhereBetween(columnName: string, values: [any, any]): ClientContract {
    console.log(`Method ${this.buildWhereBetween.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereNotBetween method
   *
   * @param columnName The column name to make the whereNotBetween.
   * @param values Two values to make the not between range
   *
   */
  buildWhereNotBetween(columnName: string, values: [any, any]): ClientContract {
    console.log(`Method ${this.buildWhereNotBetween.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildWhereRaw method
   *
   * @param raw Convenience helper for .where(Database.raw(query).
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildWhereRaw(raw: string, queryValues?: any[]): ClientContract {
    console.log(`Method ${this.buildWhereRaw.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildJoin method
   *
   *
   * @param tableName Table name to make the join
   * @param column1 Column to make the verification
   * @param operator Operation to make in verification such and >=, <, = etc
   * @param column2 Second column of the verification
   * @param joinType The join type, default is innerJoin
   */
  buildJoin(tableName: string, column1: string, operator: string, column2: string, joinType?: JoinType): ClientContract {
    console.log(`Method ${this.buildJoin.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildJoinRaw method
   *
   * @param raw The join as raw.
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildJoinRaw(raw: string, queryValues?: any[]): ClientContract {
    console.log(`Method ${this.buildJoinRaw.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildDistinct method
   *
   * @param columns All columns to select as distinct.
   *
   */
  buildDistinct(...columns: string[]): ClientContract {
    console.log(`Method ${this.buildDistinct.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildGroupBy method
   *
   * @param columns All columns to groupBy.
   *
   */
  buildGroupBy(...columns: string[]): ClientContract {
    console.log(`Method ${this.buildGroupBy.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildGroupByRaw method
   *
   * @param raw The groupBy as raw
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildGroupByRaw(raw: string, queryValues?: any[]): ClientContract {
    console.log(`Method ${this.buildGroupByRaw.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildOrderBy method
   *
   * @param column Order the query by direction of column.
   * @param direction The direction of the orderBy, could be only asc or desc
   *
   */
  buildOrderBy(column: string, direction?: 'asc' | 'desc'): ClientContract {
    console.log(`Method ${this.buildOrderBy.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildOrderByRaw method
   *
   * @param raw The orderBy as raw
   * @param queryValues The values to be replaced by ? inside query in order.
   *
   */
  buildOrderByRaw(raw: string, queryValues?: any[]): ClientContract {
    console.log(`Method ${this.buildOrderByRaw.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

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
  buildHaving(column: string, operator: string, value: any): ClientContract {
    console.log(`Method ${this.buildHaving.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildSkip method
   *
   * @param number The offset number
   *
   */
  buildSkip(number: number): ClientContract {
    console.log(`Method ${this.buildSkip.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }

  /**
   * BuildLimit method
   *
   * @param number The limit number
   *
   */
  buildLimit(number: number): ClientContract {
    console.log(`Method ${this.buildLimit.name} has not been implemented in ${MongooseClient.name}`)

    return this
  }
}
