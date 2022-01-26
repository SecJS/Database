/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Product } from './Product'
import { Entity } from '../../../src/Decorators/Entity'

@Entity({ tableName: 'productDetails' })
export class ProductDetail {
  id: number
  detail: string
  productId: string
  product: Product
}
