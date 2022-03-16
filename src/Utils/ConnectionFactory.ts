/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import knex from 'knex'

import { createConnection } from 'mongoose'
import { Config, Parser } from '@secjs/utils'

export class ConnectionFactory {
  static async mongo(conName: string, configs: any) {
    return this.mongoose(conName, configs)
  }

  static async mysql(conName: string, configs: any) {
    return this.knex('mysql', conName, configs)
  }

  static async postgres(conName: string, configs: any) {
    return this.knex('pg', conName, configs)
  }

  static async sqlite(conName: string, configs: any) {
    return this.knex('better-sqlite3', conName, configs)
  }

  static async sqlserver(conName: string, configs: any) {
    return this.knex('sqlserver', conName, configs)
  }

  private static transpileConConfig(defaultConfig: any, runtimeConfig: any) {
    const configurations: any = {}

    if (runtimeConfig.url || defaultConfig.url) {
      configurations.url = runtimeConfig.url || defaultConfig.url

      return configurations
    }

    if (runtimeConfig.filename || defaultConfig.filename) {
      configurations.filename = runtimeConfig.filename || defaultConfig.filename

      return configurations
    }

    Object.keys(defaultConfig).forEach(key => {
      if (key === 'driver') return

      configurations[key] = runtimeConfig[key] || defaultConfig[key]
    })

    return configurations
  }

  private static createConUrl(defaultConfig: any, runtimeConfig: any): string {
    const url = runtimeConfig.url || defaultConfig.url

    if (url) {
      const connectionObject = Parser.dbUrlToConnectionObj(url)

      if (runtimeConfig.host) connectionObject.host = runtimeConfig.host
      if (runtimeConfig.port) connectionObject.port = runtimeConfig.port
      if (runtimeConfig.user) connectionObject.user = runtimeConfig.user
      if (runtimeConfig.protocol)
        connectionObject.protocol = runtimeConfig.protocol
      if (runtimeConfig.password)
        connectionObject.password = runtimeConfig.password
      if (runtimeConfig.database)
        connectionObject.database = runtimeConfig.database

      return Parser.connectionObjToDbUrl(connectionObject)
    }

    return Parser.connectionObjToDbUrl({
      host: runtimeConfig.host || defaultConfig.host,
      port: runtimeConfig.port || defaultConfig.port,
      user: runtimeConfig.user || defaultConfig.user,
      protocol: runtimeConfig.protocol || defaultConfig.protocol,
      password: runtimeConfig.password || defaultConfig.password,
      database: runtimeConfig.database || defaultConfig.database,
      options: runtimeConfig.options || defaultConfig.options,
    })
  }

  private static async knex(
    client: string,
    conName: string,
    configs: any = {},
  ) {
    const defaultConfig = Config.get(`database.connections.${conName}`)

    return knex({
      client,
      connection: this.transpileConConfig(defaultConfig, configs),
      migrations: {
        tableName: Config.get('database.migrations'),
      },
      pool: configs.pool ||
        defaultConfig.pool || {
          min: 2,
          max: 20,
          acquireTimeoutMillis: 60 * 1000,
        },
      debug: configs.debug || defaultConfig.debug || false,
      useNullAsDefault:
        configs.useNullAsDefault || defaultConfig.useNullAsDefault || false,
    })
  }

  private static async mongoose(conName: string, configs: any = {}) {
    const defaultConfig = Config.get(`database.connections.${conName}`)

    const connectionUrl = this.createConUrl(defaultConfig, configs)

    return createConnection(connectionUrl, defaultConfig.options)
  }
}
