/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import knex, { Knex } from 'knex'
import { Config } from '@secjs/config'
import { Parser } from '@secjs/utils'
import { createConnection } from 'mongoose'
import { InternalServerException } from '@secjs/exceptions'

export class ConnectionResolver {
  private static createUrl(defaultConfig: any, runtimeConfig: any): string {
    let url = runtimeConfig.url || defaultConfig.url

    if (url) {
      const connectionObject = Parser.dbUrlToConnectionObj(url)

      if (runtimeConfig.host) connectionObject.host = runtimeConfig.host
      if (runtimeConfig.port) connectionObject.port = runtimeConfig.port
      if (runtimeConfig.user) connectionObject.user = runtimeConfig.user
      if (runtimeConfig.protocol) connectionObject.protocol = runtimeConfig.protocol
      if (runtimeConfig.password) connectionObject.password = runtimeConfig.password
      if (runtimeConfig.database) connectionObject.database = runtimeConfig.database

      return Parser.connectionObjToDbUrl(connectionObject)
    }

    const host = runtimeConfig.host || defaultConfig.host
    const port = runtimeConfig.port || defaultConfig.port
    const user = runtimeConfig.user || defaultConfig.user
    const protocol = runtimeConfig.protocol || defaultConfig.protocol
    const password = runtimeConfig.password || defaultConfig.password
    const database = runtimeConfig.database || defaultConfig.database

    let options = '?'

    if (runtimeConfig.options || defaultConfig.options) {
      const parsedOptions = Parser.jsonToFormData(runtimeConfig.options || defaultConfig.options)

      options += parsedOptions
    }

    return `${protocol}://${user}:${password}@${host}:${port}/${database}${options ? options : ''}`
  }

  private static transpileKnexConConfig(runtimeConfig: any, defaultConfig: any) {
    const configurations: any = {}

    if (runtimeConfig.url || defaultConfig.url) {
      configurations.url = runtimeConfig.url || defaultConfig.url

      return configurations
    }

    if (runtimeConfig.filename || defaultConfig.filename) {
      configurations.filename = runtimeConfig.filename || defaultConfig.filename

      return configurations
    }

    Object.keys(runtimeConfig).forEach(key => {
      if (key === 'driver') return

      const requiredKeys = [
        'host',
        'username',
        'password',
        'database'
      ]

      configurations[key] = runtimeConfig[key] || defaultConfig[key]

      if (requiredKeys.includes(key)) {
        if (!configurations[key]) {
          throw new InternalServerException(
            `Required key ${key} not found in configurations. Use Database.setConfig to set in runtime or in config/database file.`
          )
        }
      }
    })

    return configurations
  }

  static async knex(client: string, connection: string, runtimeConfig: any = {}): Promise<Knex> {
    const defaultConfig = Config.get(`database.connections.${connection}`)

    return knex({
      client,
      connection: this.transpileKnexConConfig(defaultConfig, runtimeConfig),
      migrations: {
        tableName: Config.get('database.migrations')
      },
      pool: defaultConfig.pool || {
        min: 2,
        max: 20,
        acquireTimeoutMillis: 60 * 1000
      },
      debug: defaultConfig.debug || false,
      useNullAsDefault: defaultConfig.useNullAsDefault || false
    })
  }

  static async mongoose(connection: string, runtimeConfig: any = {}) {
    const defaultConfig = Config.get(`database.connections.${connection}`)

    const connectionUrl = this.createUrl(defaultConfig, runtimeConfig)

    return createConnection(connectionUrl, defaultConfig.options)
  }
}
