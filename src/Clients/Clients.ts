/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { KnexClient } from './KnexClient'
import { MongooseClient } from './MongooseClient'

// TODO Move clients code to Drivers again.
//      Clients are very useful to not repeat code,
//      but if we have compatibility problem with some database
//      all the code is in clients, changing client code would break
//      all the other drivers (high coupling).
//      Is better to "repeat code" inside Drivers than to have a coupling problem later on.
//      This refactor could come as an issue later, because for now Clients are useful
//      because we only have PostgresDriver, SqliteDriver and MongoDriver.
export const Clients = {
  knex: KnexClient,
  mongoose: MongooseClient,
}
