/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ProductDetail } from './ProductDetail'
import { Model } from '../../../src/Decorators/Model'

@Model({ tableName: 'products' })
export class Product {
  id: number
  name: string
  productDetails: ProductDetail[]
}
