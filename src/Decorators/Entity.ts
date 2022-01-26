/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export function Entity(options: any = {}): ClassDecorator {
  return target => {
    target.prototype.tableName = `${options.tableName}Table`

    return target
  }
}
