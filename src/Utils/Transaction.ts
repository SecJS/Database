/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { JoinType } from '../Contracts/JoinType'
import { PaginatedResponse } from '@secjs/contracts'
import { DriverContract } from '../Contracts/DriverContract'
import { TransactionContract } from '../Contracts/TransactionContract'

export class Transaction implements TransactionContract {
  private driver: DriverContract

  constructor(driver: DriverContract) {
    this.driver = driver
  }

  // Transaction Methods

  async commit(value?: any): Promise<any> {
    return this.driver.commit(value)
  }

  async rollback(error?: any): Promise<any> {
    return this.driver.rollback(error)
  }

  // Driver Methods

  async avg(column: string): Promise<number> {
    return this.driver.avg(column)
  }

  async avgDistinct(column: string): Promise<number> {
    return this.driver.avgDistinct(column)
  }

  async columnInfo(column: string): Promise<any> {
    return this.driver.columnInfo(column)
  }

  async count(column = '*'): Promise<number> {
    return this.driver.count(column)
  }

  async countDistinct(column: string): Promise<number> {
    return this.driver.countDistinct(column)
  }

  async decrement(column: string, value: number) {
    return this.driver.decrement(column, value)
  }

  async delete(): Promise<number> {
    return this.driver.delete()
  }

  async find(): Promise<any> {
    return this.driver.find()
  }

  async findMany(): Promise<any[]> {
    return this.driver.findMany()
  }

  async forPage(page: number, limit: number): Promise<any[]> {
    return this.driver.forPage(page, limit)
  }

  async insert(values: any | any[]): Promise<string[]> {
    return this.driver.insert(values)
  }

  async insertAndGet(values: any | any[]): Promise<any[]> {
    return this.driver.insertAndGet(values)
  }

  async max(column: string): Promise<number> {
    return this.driver.max(column)
  }

  async min(column: string): Promise<number> {
    return this.driver.min(column)
  }

  async paginate(
    page: number,
    limit: number,
    resourceUrl = '/api',
  ): Promise<PaginatedResponse<any>> {
    return this.driver.paginate(page, limit, resourceUrl)
  }

  async pluck(column: string): Promise<any[]> {
    return this.driver.pluck(column)
  }

  async raw(raw: string, queryValues?: any[]): Promise<any> {
    return this.driver.raw(raw, queryValues)
  }

  async sum(column: string): Promise<number> {
    return this.driver.sum(column)
  }

  async sumDistinct(column: string): Promise<number> {
    return this.driver.sumDistinct(column)
  }

  async truncate(tableName: string): Promise<void> {
    await this.driver.truncate(tableName)
  }

  async update(key: any, value?: any): Promise<string[]> {
    return this.driver.update(key, value)
  }

  async updateAndGet(key: any, value?: any): Promise<any[]> {
    return this.driver.updateAndGet(key, value)
  }

  async increment(column: string, value: number) {
    return this.driver.increment(column, value)
  }

  buildDistinct(...columns: string[]): TransactionContract {
    this.driver.buildDistinct(...columns)

    return this
  }

  buildGroupBy(...columns: string[]): TransactionContract {
    this.driver.buildGroupBy(...columns)

    return this
  }

  buildGroupByRaw(raw: string, queryValues?: any[]): TransactionContract {
    this.driver.buildGroupByRaw(raw, queryValues)

    return this
  }

  buildHaving(
    column: string,
    operator: string,
    value: any,
  ): TransactionContract {
    this.driver.buildHaving(column, operator, value)

    return this
  }

  buildJoin(
    tableName: string,
    column1: string,
    operator: string,
    column2?: string,
    joinType: JoinType = 'join',
  ): TransactionContract {
    this.driver.buildJoin(tableName, column1, operator, column2, joinType)

    return this
  }

  buildJoinRaw(raw: string, queryValues?: any[]): TransactionContract {
    this.driver.buildJoinRaw(raw, queryValues)

    return this
  }

  buildLimit(number: number): TransactionContract {
    this.driver.buildLimit(number)

    return this
  }

  buildSkip(number: number): TransactionContract {
    this.driver.buildSkip(number)

    return this
  }

  buildOrWhere(
    statement: string | Record<string, any>,
    value?: any,
  ): TransactionContract {
    this.driver.buildOrWhere(statement, value)

    return this
  }

  buildOrderBy(
    column: string,
    direction?: 'asc' | 'desc',
  ): TransactionContract {
    this.driver.buildOrderBy(column, direction)

    return this
  }

  buildOrderByRaw(raw: string, queryValues?: any[]): TransactionContract {
    this.driver.buildOrderByRaw(raw, queryValues)

    return this
  }

  buildSelect(...columns: string[]): TransactionContract {
    this.driver.buildSelect(...columns)

    return this
  }

  buildTable(tableName: string): TransactionContract {
    this.driver.buildTable(tableName)

    return this
  }

  buildWhere(
    statement: string | Record<string, any>,
    value?: any,
  ): TransactionContract {
    this.driver.buildWhere(statement, value)

    return this
  }

  buildWhereLike(
    statement: string | Record<string, any>,
    value?: any,
  ): TransactionContract {
    this.driver.buildWhereLike(statement, value)

    return this
  }

  buildWhereILike(
    statement: string | Record<string, any>,
    value?: any,
  ): TransactionContract {
    this.driver.buildWhereILike(statement, value)

    return this
  }

  buildWhereBetween(
    columnName: string,
    values: [any, any],
  ): TransactionContract {
    this.driver.buildWhereBetween(columnName, values)

    return this
  }

  buildWhereExists(callback: any): TransactionContract {
    this.driver.buildWhereExists(callback)

    return this
  }

  buildWhereIn(columnName: string, values: any[]): TransactionContract {
    this.driver.buildWhereIn(columnName, values)

    return this
  }

  buildWhereNot(
    statement: string | Record<string, any>,
    value?: any,
  ): TransactionContract {
    this.driver.buildWhereNot(statement, value)

    return this
  }

  buildWhereNotBetween(
    columnName: string,
    values: [any, any],
  ): TransactionContract {
    this.driver.buildWhereNotBetween(columnName, values)

    return this
  }

  buildWhereNotExists(callback: any): TransactionContract {
    this.driver.buildWhereNotExists(callback)

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): TransactionContract {
    this.driver.buildWhereNotIn(columnName, values)

    return this
  }

  buildWhereNull(columnName: string): TransactionContract {
    this.driver.buildWhereNull(columnName)

    return this
  }

  buildWhereNotNull(columnName: string): TransactionContract {
    this.driver.buildWhereNotNull(columnName)

    return this
  }

  buildWhereRaw(raw: string, queryValues?: any[]): TransactionContract {
    this.driver.buildWhereRaw(raw, queryValues)

    return this
  }
}
