/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import '@secjs/env/src/utils/global'
import '@secjs/config/src/utils/global'

import { Database } from '../src/Database'
import { DatabaseContract } from '../src/Contracts/DatabaseContract'
import { Schema } from 'mongoose'

describe('\n Database Mongo Class', () => {
  let database: DatabaseContract = null

  beforeEach(async () => {
    database = await new Database().connection('mongo').connect()

    database.buildTable('products')

    await database.createTable('products', () => ({
      name: { type: String, required: true }
    }))

    await database.createTable('product_details', () => ({
      detail: { type: String, required: true },
      productId: { type: String, required: true },
      product: { type: Schema.Types.ObjectId, required: true, ref: 'products' }
    }))
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
      .buildWhere('_id', idIphone)
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
      .buildWhere('_id', iphone._id)
      .updateAndGet('name', 'iPhone 11')

    expect(iphoneUpdated.name).toBe('iPhone 11')
  })

  it('should delete the product in database', async () => {
    const [iphone] = await database.insertAndGet({ name: 'iPhone 10'})

    await database
      .buildWhere('_id', iphone._id)
      .delete()

    const deletedIphone = await database
      .buildWhere({ _id: iphone._id })
      .find()

    expect(deletedIphone).toBeFalsy()
  })

  it('should be able to create and drop databases from different instances', async () => {
    await database.createDatabase('new-database')

    const newDb = await new Database()
      .connection('mongo', { database: 'new-database' })
      .connect()

    await newDb.createTable('products', () => ({
      name: { type: String, required: true }
    }))

    const [product] = await newDb
      .buildTable('products')
      .insertAndGet({ name: 'Product' })

    expect(product.name).toBe('Product')

    await newDb.close()
    await database.dropDatabase('new-database')
  }, 10000)

  it('should be able to join on other related tables', async () => {
    const iphones = await database.insertAndGet([
      { name: 'iPhone 10' },
      { name: 'iPhone 11' },
      { name: 'iPhone 12' }
    ])

    await Promise.all(iphones.map(iphone => database.buildTable('product_details').insert({ detail: '64 GB', product: iphone, productId: iphone._id })))
    await Promise.all(iphones.map(iphone => database.buildTable('product_details').insert({ detail: 'CPU ARM Arch', product: iphone, productId: iphone._id })))

    const iphonesWithDetails = await database
      .buildTable('products')
      .buildJoin('product_details', 'products._id', 'product_details.productId')
      .findMany()

    expect(iphonesWithDetails.length).toBe(3)
    expect(iphonesWithDetails[0].product_details[0].detail).toBe('64 GB')
  })

  it('should be able to change the database connection in runtime', async () => {
    await database.connection('sqlite').connect()

    await database.createTable('products', tableBuilder => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').notNullable()
    })

    const macbooks = await database.buildTable('products').insertAndGet([
      { name: 'Macbook 2019' },
      { name: 'Macbook 2020' },
      { name: 'Macbook 2021' },
    ])

    expect(macbooks.length).toBe(3)
    expect(macbooks[0].id).toBe(1)
    expect(macbooks[0].name).toBe('Macbook 2019')
  })

  it('should be able to clone the database with the exactly query chain', async () => {
    database.buildTable('products')

    const clonedDatabase = await database.clone()

    // This should insert in products table because of database.buildTable
    const arrayOfIds = await clonedDatabase.insert({ name: 'AirPods 2' })

    await clonedDatabase.close()

    expect(arrayOfIds.length).toBe(1)
  })

  it('should be able to create database transactions and commit then', async () => {
    const trx = await database.beginTransaction()

    trx.buildTable('products')
    const products = await trx.insertAndGet({ name: 'AirPods 3' })

    expect(products.length).toBe(1)

    await trx.commit()

    const product = await database.buildWhere('id', products[0].id).find()

    expect(product.id).toBe(products[0].id)
  })

  afterEach(async () => {
    await database.dropTable('product_details')
    await database.dropTable('products')
    await database.close()
  })
})
