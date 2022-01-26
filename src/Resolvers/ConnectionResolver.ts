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

export class ConnectionResolver {
  static async knex(client: string, connection: string, configs: any = {}): Promise<Knex> {
    const databaseConfig = Config.get(`database.connections.${connection}`)

    const conConfig: any = {}

    if (!configs.url && !databaseConfig.url) {
      conConfig.host = configs.host || databaseConfig.host
      conConfig.port = configs.port || databaseConfig.port
      conConfig.user = configs.username || databaseConfig.username
      conConfig.password = configs.password || databaseConfig.password
      conConfig.database = configs.database || databaseConfig.database
    } else conConfig.uri = configs.url || databaseConfig.url

    return knex({
      client,
      connection: conConfig,
      migrations: {
        tableName: configs.migrations || databaseConfig.migrations
      },
      pool: {
        min: 2,
        max: 10
      }
    })
  }

  // static mongoose(connection: string, configs: any = {}) {}
}
