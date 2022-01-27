/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { MySqlDriver } from './MySqlDriver'
import { MongoDriver } from './MongoDriver'
import { SqliteDriver } from './SqliteDriver'
import { PostgresDriver } from './PostgresDriver'
import { SqlServerDriver } from './SqlServerDriver'

export const Drivers = {
  mysql: MySqlDriver,
  mongo: MongoDriver,
  sqlite: SqliteDriver,
  mssql: SqlServerDriver,
  postgres: PostgresDriver,
}
