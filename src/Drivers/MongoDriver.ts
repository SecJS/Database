/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Clients } from '../Clients/Clients'
import { JoinType } from '../Contracts/JoinType'
import { Transaction } from '../Utils/Transaction'
import { PaginatedResponse } from '@secjs/contracts'
import { PostgresDriverConfigs } from './PostgresDriver'
import { DriverContract } from '../Contracts/DriverContract'
import { ClientContract } from '../Contracts/ClientContract'
import { TransactionContract } from '../Contracts/TransactionContract'

export class MongoDriver implements DriverContract {
  private client: ClientContract

  constructor(connection: string, configs: PostgresDriverConfigs = {}) {
    this.client = new Clients.mongoose(connection, configs)
  }

  setQueryBuilder(query: any) {
    this.client.setQueryBuilder(query)
  }

  on(event: string, callback: (...params: any) => void) {
    this.client.on(event, callback)
  }

  async connect(): Promise<void> {
    await this.client.connect('pg')
  }

  cloneQuery(): any {
    return this.client.cloneQuery()
  }

  async beginTransaction(): Promise<TransactionContract> {
    const trx = await this.client.beginTransaction()

    return new Transaction(new Clients.knex(trx))
  }

  async transaction(callback: (trx: any) => Promise<void>): Promise<void> {
    await this.client.transaction(callback)
  }

  async createDatabase(databaseName: string): Promise<void> {
    await this.client.createDatabase(databaseName)
  }

  async dropDatabase(databaseName: string): Promise<void> {
    await this.client.dropDatabase(databaseName)
  }

  async createTable(tableName: string, callback: (tableBuilder: any) => void): Promise<void> {
    await this.client.createTable(tableName, callback)
  }

  async dropTable(tableName: string): Promise<void> {
    await this.client.dropTable(tableName)
  }

  async avg(column: string): Promise<number> {
    return this.client.avg(column)
  }

  async avgDistinct(column: string): Promise<number> {
    return this.client.avgDistinct(column)
  }

  async close(): Promise<void> {
    await this.client.close()
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

  buildDistinct(...columns: string[]): DriverContract {
    this.client.buildDistinct(...columns)

    return this
  }

  buildGroupBy(...columns: string[]): DriverContract {
    this.client.buildGroupBy(...columns)

    return this
  }

  buildGroupByRaw(raw: string, queryValues?: any[]): DriverContract {
    this.client.buildGroupByRaw(raw, queryValues)

    return this
  }

  buildHaving(column: string, operator: string, value: any): DriverContract {
    this.client.buildHaving(column, operator, value)

    return this
  }

  buildJoin(
    tableName: string,
    column1: string,
    operator: string,
    column2?: string,
    joinType: JoinType = 'join',
  ): DriverContract {
    this.client.buildJoin(tableName, column1, operator, column2, joinType)

    return this
  }

  buildJoinRaw(raw: string, queryValues?: any[]): DriverContract {
    this.client.buildJoinRaw(raw, queryValues)

    return this
  }

  buildLimit(number: number): DriverContract {
    this.client.buildLimit(number)

    return this
  }

  buildSkip(number: number): DriverContract {
    this.client.buildSkip(number)

    return this
  }

  buildOrWhere(statement: string | Record<string, any>, value?: any): DriverContract {
    this.client.buildOrWhere(statement, value)

    return this
  }

  buildOrderBy(column: string, direction?: "asc" | "desc"): DriverContract {
    this.client.buildOrderBy(column, direction)

    return this
  }

  buildOrderByRaw(raw: string, queryValues?: any[]): DriverContract {
    this.client.buildOrderByRaw(raw, queryValues)

    return this
  }

  buildSelect(...columns: string[]): DriverContract {
    this.client.buildSelect(...columns)

    return this
  }

  buildTable(tableName: string): DriverContract {
    this.client.buildTable(tableName)

    return this
  }

  buildWhere(statement: string | Record<string, any>, value?: any): DriverContract {
    this.client.buildWhere(statement, value)

    return this
  }

  buildWhereLike(statement: string | Record<string, any>, value?: any): DriverContract {
    this.client.buildWhereLike(statement, value)

    return this
  }

  buildWhereILike(statement: string | Record<string, any>, value?: any): DriverContract {
    this.client.buildWhereILike(statement, value)

    return this
  }

  buildWhereBetween(columnName: string, values: [any, any]): DriverContract {
    this.client.buildWhereBetween(columnName, values)

    return this
  }

  buildWhereExists(callback: any): DriverContract {
    this.client.buildWhereExists(callback)

    return this
  }

  buildWhereIn(columnName: string, values: any[]): DriverContract {
    this.client.buildWhereIn(columnName, values)

    return this
  }

  buildWhereNot(statement: string | Record<string, any>, value?: any): DriverContract {
    this.client.buildWhereNot(statement, value)

    return this
  }

  buildWhereNotBetween(columnName: string, values: [any, any]): DriverContract {
    this.client.buildWhereNotBetween(columnName, values)

    return this
  }

  buildWhereNotExists(callback: any): DriverContract {
    this.client.buildWhereNotExists(callback)

    return this
  }

  buildWhereNotIn(columnName: string, values: any[]): DriverContract {
    this.client.buildWhereNotIn(columnName, values)

    return this
  }

  buildWhereNull(columnName: string): DriverContract {
    this.client.buildWhereNull(columnName)

    return this
  }

  buildWhereNotNull(columnName: string): DriverContract {
    this.client.buildWhereNotNull(columnName)

    return this
  }

  buildWhereRaw(raw: string, queryValues?: any[]): DriverContract {
    this.client.buildWhereRaw(raw, queryValues)

    return this
  }
}
