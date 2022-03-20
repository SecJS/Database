/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { InternalServerException } from '@secjs/exceptions'

export class NotImplementedException extends InternalServerException {
  public constructor(methodName: string, className: string) {
    const content = `Method ${methodName} has not been implemented in ${className}`

    super(content)
  }
}
