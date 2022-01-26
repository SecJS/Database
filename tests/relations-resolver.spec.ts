/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { products } from './stubs/data'
import { Product } from './stubs/Models/Product'
import { ProductDetail } from './stubs/Models/ProductDetail'
import { RelationsResolver } from '../src/Resolvers/RelationsResolver'

describe('\n Relations Resolver Class', () => {
  beforeEach(async () => {})

  it('should resolve oneToOne relations', async () => {
    const iphonesWithDetails = RelationsResolver.oneToMany(products, Product, ProductDetail)

    expect(iphonesWithDetails.length).toBe(3)
    expect(iphonesWithDetails[0].id).toBe(1)
    expect(iphonesWithDetails[0].name).toBe('iPhone 10')
    expect(iphonesWithDetails[0].productDetails.length).toBe(3)
    expect(iphonesWithDetails[0].productDetails[0].productId).toBe(1)
  })

  it('should resolve oneToMany relations', async () => {})
  it('should resolve manyToOne relations', async () => {})
  it('should resolve manyToOne relations', async () => {})

  afterEach(async () => {})
})
