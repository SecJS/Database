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
import { Product } from './stubs/Models/Product'
import { ProductDetail } from './stubs/Models/ProductDetail'
import { DatabaseContract } from '../src/Contracts/DatabaseContract'
import { RelationsResolver } from '../src/Resolvers/RelationsResolver'

describe('\n Database PostgreSQL Class', () => {
  let database: DatabaseContract = null

  beforeEach(async () => {
    await new Config().load()

    database = new Database().changeDefaultConnection('postgresql')

    await database.connect()

    database.buildTable('products')

    await database.createTable('products', tableBuilder => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').notNullable()
    })

    await database.createTable('product_details', tableBuilder => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('detail').notNullable()
      tableBuilder.integer('productId').references('id').inTable('products')
    })
  })

  it('should insert new products to the database', async () => {
    const idOfProducts = await database.insert([
      { name: 'iPhone 10'},
      { name: 'iPhone 11'},
      { name: 'iPhone 12'}
    ])

    expect(idOfProducts.length).toBe(3)
  })

  it('should get the product from database', async () => {
    const [idIphone] = await database.insert({ name: 'iPhone 10'})

    const iphone = await database
      .buildWhere('id', idIphone)
      .find()

    expect(iphone.name).toBe('iPhone 10')
  })

  it('should get all the products from database', async () => {
    await database.insert([
      { name: 'iPhone 10' },
      { name: 'iPhone 11' },
      { name: 'iPhone 12' }
    ])

    const iphones = await database.findMany()

    expect(iphones.length).toBe(3)
  })

  it('should get all the products from database paginated', async () => {
    await database.insert([
      { name: 'iPhone 10' },
      { name: 'iPhone 11' },
      { name: 'iPhone 12' }
    ])

    const paginatedResponse = await database.paginate(0, 2, '/products')

    expect(paginatedResponse.data.length).toBe(2)
    expect(paginatedResponse.meta.itemCount).toBe(2)
    expect(paginatedResponse.meta.totalItems).toBe(3)
    expect(paginatedResponse.meta.totalPages).toBe(2)
    expect(paginatedResponse.meta.currentPage).toBe(0)
    expect(paginatedResponse.meta.itemsPerPage).toBe(2)
    expect(paginatedResponse.links.first).toBe('/products?limit=2')
    expect(paginatedResponse.links.previous).toBe('/products?page=0&limit=2')
    expect(paginatedResponse.links.next).toBe('/products?page=1&limit=2')
    expect(paginatedResponse.links.last).toBe('/products?page=2&limit=2')
  })

  it('should get all the products paginated but without paginated response', async () => {
    await database.insert([
      { name: 'iPhone 10' },
      { name: 'iPhone 11' },
      { name: 'iPhone 12' }
    ])

    const data = await database.forPage(0, 2)

    expect(data.length).toBe(2)
  })

  it('should update the product in database', async () => {
    const [iphone] = await database.insertAndGet({ name: 'iPhone 10'})

    const [iphoneUpdated] = await database
      .buildWhere('id', iphone.id)
      .updateAndGet('name', 'iPhone 11')

    expect(iphoneUpdated.name).toBe('iPhone 11')
  })

  it('should delete the product in database', async () => {
    const [iphone] = await database.insertAndGet({ name: 'iPhone 10'})

    await database
      .buildWhere('id', iphone.id)
      .delete()

    const deletedIphone = await database
      .buildWhere({ id: iphone.id })
      .find()

    expect(deletedIphone).toBeFalsy()
  })

  it('should be able to create and drop databases from different instances', async () => {
    await database.createDatabase('new-database')

    const newDb = new Database()
      .addConfig('database', 'new-database')
      .changeDefaultConnection('postgresql')

    await newDb.connect()

    newDb.buildTable('products')

    await newDb.createTable('products', tableBuilder => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').notNullable()
    })

    const [product] = await newDb.insertAndGet({ name: 'Product' })

    expect(product.name).toBe('Product')

    await newDb.close()
    await database.dropDatabase('new-database')
  })

  it('should be able to join on other related tables', async () => {
    const iphones = await database.insertAndGet([
      { name: 'iPhone 10' },
      { name: 'iPhone 11' },
      { name: 'iPhone 12' }
    ])

    await Promise.all(iphones.map(iphone => database.buildTable('product_details').insert({ detail: '64 GB', productId: iphone.id })))
    await Promise.all(iphones.map(iphone => database.buildTable('product_details').insert({ detail: 'CPU ARM Arch', productId: iphone.id })))

    const iphonesWithDetails = await database
      .buildTable('products')
      .buildJoin('product_details', 'products.id', 'product_details.id')
      .findMany()

    expect(iphonesWithDetails.length).toBe(3)
    expect(iphonesWithDetails[0].detail).toBe('64 GB')
  })

  it('should be able to join on other related tables and map the relations as objects', async () => {
    const iphones = await database.insertAndGet([
      { name: 'iPhone 10' },
      { name: 'iPhone 11' },
      { name: 'iPhone 12' }
    ])

    database.buildTable('product_details')

    await Promise.all(iphones.map(iphone => database.insert({ detail: '64 GB', productId: iphone.id })))
    await Promise.all(iphones.map(iphone => database.insert({ detail: '16 GB RAM', productId: iphone.id })))
    await Promise.all(iphones.map(iphone => database.insert({ detail: 'CPU ARM Arch', productId: iphone.id })))

    const flatData = await database
      .buildTable('products')
      .buildSelect(
        'products.id as id',
        'products.name as productsTable-name',
        'product_details.id as productDetailsTable-id',
        'product_details.detail as productDetailsTable-detail',
        'product_details.productId as productDetailsTable-productId'
      )
      .buildJoin(
        'product_details',
        'products.id',
        '=',
        'product_details.productId',
        'innerJoin'
      )
      .findMany()

    const iphonesWithDetails = RelationsResolver.oneToMany(flatData, Product, ProductDetail)

    expect(iphonesWithDetails.length).toBe(3)
    expect(iphonesWithDetails[0].id).toBe(1)
    expect(iphonesWithDetails[0].name).toBe('iPhone 10')
    expect(iphonesWithDetails[0].productDetails.length).toBe(3)
    expect(iphonesWithDetails[0].productDetails[0].productId).toBe(1)
  })

  afterEach(async () => {
    await database.dropDatabase('new-database')
    await database.dropTable('product_details')
    await database.dropTable('products')
    await database.close()
  })
})
