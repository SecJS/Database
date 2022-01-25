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

export class DriverResolver {
  static async knex(client: string, connection: string, configs: any = {}): Promise<Knex> {
    const databaseConfig = Config.get(`database.connections.${connection}`)

    return knex({
      client,
      connection: {
        host: configs.host || databaseConfig.host,
        port: configs.port || databaseConfig.port,
        user: configs.username || databaseConfig.username,
        password: configs.password || databaseConfig.password,
        database: configs.database || databaseConfig.database,
      },
      migrations: {
        tableName: configs.migrations || databaseConfig.migrations
      }
    })
  }

  // static mongoose(connection: string, configs: any = {}) {}
}
