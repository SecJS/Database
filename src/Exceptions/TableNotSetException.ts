/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { InternalServerException } from '@secjs/exceptions'

export class TableNotSetException extends InternalServerException {
  public constructor(className: string) {
    const content = `Table is not set in ${className}, use buildTable method to set your table`

    super(content)
  }
}
