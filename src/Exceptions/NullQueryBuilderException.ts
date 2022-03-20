/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { InternalServerException } from '@secjs/exceptions'

export class NullQueryBuilderException extends InternalServerException {
  public constructor(className: string) {
    const content = `Query builder doesn't exist in ${className}, this usually happens when you didn't call connect method to create the connection with database`

    super(content)
  }
}
