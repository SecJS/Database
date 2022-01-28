/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import '@secjs/env/src/utils/global'

import { Config } from '@secjs/config'
import { Database } from '../src/Database'
import { DatabaseContract } from '../src/Contracts/DatabaseContract'

describe('\n Database Mongo Class', () => {
  let database: DatabaseContract = null

  beforeEach(async () => {
    database = new Database().connection('mongo')
  })

  afterEach(async () => {})
})
