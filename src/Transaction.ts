/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { JoinType } from './Contracts/JoinType'
import { PaginatedResponse } from '@secjs/contracts'
import { ClientContract } from './Contracts/ClientContract'
import { TransactionContract } from './Contracts/TransactionContract'

export class Transaction implements TransactionContract {
  private client: ClientContract

  constructor(client: ClientContract) {
    this.client = client
  }

  // Transaction Methods

  async commit(value?: any): Promise<any> {
    return this.client.commit(value)
  }

  async rollback(error?: any): Promise<any> {
    return this.client.rollback(error)
  }

  // KnexClient Methods

  async avg(column: string): Promise<number> {
    return this.client.avg(column)
  }

  async avgDistinct(column: string): Promise<number> {
    return this.client.avgDistinct(column)
  }

  async columnInfo(column: string): Promise<any> {
    return this.client.columnInfo(column)
  }

  async count(column = '*'): Promise<number> {
    return this.client.count(column)
  }

  async countDistinct(column: string): Promise<number> {
    return this.client.countDistinct(column)
  }

  async decrement(column: string, value: number) {
    return this.client.decrement(column, value)
  }

  async delete(): Promise<number> {
    return this.client.delete()
  }

  async find(): Promise<any> {
    return this.client.find()
  }

  async findMany(): Promise<any[]> {
    return this.client.findMany()
  }

  async forPage(page: number, limit: number): Promise<any[]> {
    return this.client.forPage(page, limit)
  }

  async insert(values: any | any[]): Promise<string[]> {
    return this.client.insert(values)
  }

  async insertAndGet(values: any | any[]): Promise<any[]> {
    return this.client.insertAndGet(values)
  }

  async max(column: string): Promise<number> {
    return this.client.max(column)
  }

  async min(column: string): Promise<number> {
    return this.client.min(column)
  }

  async paginate(page: number, limit: number, resourceUrl = '/api'): Promise<PaginatedResponse<any>> {
    return this.client.paginate(page, limit, resourceUrl)
  }

  async pluck(column: string): Promise<any[]> {
    return this.client.pluck(column)
  }

  async raw(raw: string, queryValues?: any[]): Promise<any> {
    return this.client.raw(raw, queryValues)
  }

  async sum(column: string): Promise<number> {
    return this.client.sum(column)
  }

  async sumDistinct(column: string): Promise<number> {
    return this.client.sumDistinct(column)
  }

  async truncate(tableName: string): Promise<void> {
    await this.client.truncate(tableName)
  }

  async update(key: any, value?: any): Promise<string[]> {
    return this.client.update(key, value)
  }

  async updateAndGet(key: any, value?: any): Promise<any[]> {
    return this.client.updateAndGet(key, value)
  }

  async increment(column: string, value: number) {
    return this.client.increment(column, value)
  }

  buildDistinct(...columns: string[]): TransactionContract {
    this.client.buildDistinct(...columns)

    return this
  }

  buildGroupBy(...columns: string[]): TransactionContract {
    this.client.buildGroupBy(...columns)

    return this
  }

  buildGroupByRaw(raw: string, queryValues?: any[]): TransactionContract {
    this.client.buildGroupByRaw(raw, queryValues)

    return this
  }

  buildHaving(column: string, operator: string, value: any): TransactionContract {
    this.client.buildHaving(column, operator, value)

    return this
  }

  buildJoin(
    tableName: string,
    column1: string,
    operator: string,
    column2?: string,
    joinType: JoinType = 'join',
  ): TransactionContract {
    this.client.buildJoin(tableName, column1, operator, column2, joinType)

    return this
  }

  buildJoinRaw(raw: string, queryValues?: any[]): TransactionContract {
    this.client.buildJoinRaw(raw, queryValues)

    return this
  }

  buildLimit(number: number): TransactionContract {
    this.client.buildLimit(number)

    return this
  }

  buildSkip(number: number): TransactionContract {
    this.client.buildSkip(number)

    return this
  }

  buildOrWhere(statement: string | Record<string, any>, value?: any): TransactionContract {
    this.client.buildOrWhere(statement, value)

    return this
  }

  buildOrderBy(column: string, direction?: "asc" | "desc"): TransactionContract {
    this.client.buildOrderBy(column, direction)

    return this
  }

  buildOrderByRaw(raw: string, queryValues?: any[]): TransactionContract {
    this.client.buildOrderByRaw(raw, queryValues)

    return this
  }

  buildSelect(...columns: string[]): TransactionContract {
    this.client.buildSelect(...columns)

    return this
  }

  buildTable(tableName: string): TransactionContract {
    this.client.buildTable(tableName)

    return this
  }

  buildWhere(statement: string | Record<string, any>, value?: any): TransactionContract {
    this.client.buildWhere(statement, value)

    return this
  }

  buildWhereLike(statement: string | Record<string, any>, value?: any): TransactionContract {
    this.client.buildWhereLike(statement, value)

    return this
  }

  buildWhereILike(statement: string | Record<string, any>, value?: any): TransactionContract {
    this.client.buildWhereILike(statement, value)

    return this
  }

  buildWhereBetween(columnName: string, values: [any, any]): TransactionContract {
    this.client.buildWhereBetween(columnName, values)

    return this
  }

  buildWhereExists(callback: any): TransactionContract {
    this.client.buildWhereExists(callback)

    return this
  }

  buildWhereIn(columnName: string, values: any[]): TransactionContract {
    this.client.buildWhereIn(columnName, values)

    return this
  }

  buildWhereNot(statement: string | Record<string, any>, value?: any): TransactionContract {
    this.client.buildWhereNot(statement, value)

    return this
  }

  buildWhereNotBetween(columnName: string, values: [any, any]): TransactionContract {
    this.client.buildWhereNotBetween(columnName, values)

    return this
  }

  buildWhereNotExists(callback: any): TransactionContract {
    this.client.buildWhereNotExists(callback)

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): TransactionContract {
    this.client.buildWhereNotIn(columnName, values)

    return this
  }

  buildWhereNull(columnName: string): TransactionContract {
    this.client.buildWhereNull(columnName)

    return this
  }

  buildWhereNotNull(columnName: string): TransactionContract {
    this.client.buildWhereNotNull(columnName)

    return this
  }

  buildWhereRaw(raw: string, queryValues?: any[]): TransactionContract {
    this.client.buildWhereRaw(raw, queryValues)

    return this
  }
}
