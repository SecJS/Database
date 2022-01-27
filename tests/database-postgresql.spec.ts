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
import { DatabaseContract } from '../src/Contracts/DatabaseContract'
import { Knex } from 'knex'

describe('\n Database PostgreSQL Class', () => {
  let database: DatabaseContract = null

  beforeEach(async () => {
    await new Config().load()

    database = await new Database().connection('postgres').connect()

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

    const newDb = await new Database()
      .connection('postgres', { database: 'new-database' })
      .connect()

    await newDb.createTable('products', tableBuilder => {
      tableBuilder.increments('id').primary()
      tableBuilder.string('name').notNullable()
    })

    const [product] = await newDb
      .buildTable('products')
      .insertAndGet({ name: 'Product' })

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

    expect(arrayOfIds.length).toBe(1)
  })

  it('should be able to clone the query builder with the exactly query chain', async () => {
    database.buildTable('products')

    const clonedQuery = database.cloneQuery<Knex.QueryBuilder>()

    // This should insert in products table because of database.buildTable
    const arrayOfIds = await clonedQuery.insert({ name: 'AirPods 2' }, 'id')

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

  it('should be able to create database transactions and rollback then', async () => {
    const trx = await database.beginTransaction()

    trx.buildTable('products')
    const products = await trx.insertAndGet({ name: 'AirPods 3' })

    expect(products.length).toBe(1)

    await trx.rollback()

    const product = await database.buildWhere('id', products[0].id).find()

    expect(product).toBeFalsy()
  })

  it('should be able to use pluck method, that returns the values of specific table column', async () => {
    await database
      .buildTable('products')
      .insert([
        { name: 'Apple Watch Series 2' },
        { name: 'Apple Watch Series 3' },
      ])

    const productsName = await database.pluck('name')

    expect(productsName.length).toBe(2)
    expect(productsName[0]).toBe('Apple Watch Series 2')
    expect(productsName[1]).toBe('Apple Watch Series 3')
  })

  it('should be able to use raw method to make raw queries to database', async () => {
    await database
      .buildTable('products')
      .insert([
        { name: 'Apple Watch Series 2' },
        { name: 'Apple Watch Series 3' },
      ])

    const products = await database.raw('SELECT * FROM ??;', ['products'])

    // Only for Knex
    expect(products.command).toBe('SELECT')
    expect(products.rowCount).toBe(2)
    expect(products.rowCount).toBe(2)
    expect(products.rows.length).toBe(2)
    expect(products.rows[0].id).toBe(1)
    expect(products.rows[0].name).toBe('Apple Watch Series 2')
  })

  // TODO Test on

  afterEach(async () => {
    await database.connection('postgres').connect()

    await database.dropDatabase('new-database')
    await database.dropTable('product_details')
    await database.dropTable('products')
    await database.close()
  })
})
