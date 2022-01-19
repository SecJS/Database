/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export interface TableColumnContract {
  name: string
  type: string
  isUnique?: boolean
  isPrimary?: boolean
  isNullable?: boolean
  autoIncrement?: boolean
}
