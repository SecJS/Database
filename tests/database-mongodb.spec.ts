/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import '@secjs/env/src/utils/global'

import { Config, Path } from '@secjs/utils'
import { Database } from '../src/Database'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import { TableBuilder } from '../src/Builders/TableBuilder'
import { DatabaseContract } from '../src/Contracts/DatabaseContract'

describe('\n Database Mongo Class', () => {
  let replset: MongoMemoryReplSet
  let database: DatabaseContract = null

  beforeAll(async () => {
    replset = await MongoMemoryReplSet.create({
      instanceOpts: [
        {
          port: 27017,
        },
        {
          port: 27018,
        },
        {
          port: 27019,
        },
      ],
      replSet: { name: 'rs', count: 3 },
    })

    process.env.DB_HOST = 'localhost:27017,localhost:27018,localhost:27019'
    process.env.DB_DATABASE = 'secjs-database-testing'
    process.env.DB_USERNAME = ''
    process.env.DB_PASSWORD = ''
    process.env.DB_FILENAME = ':memory:'

    await new Config().load(Path.config('database.ts'))
  })

  beforeEach(async () => {
    database = await new Database().connection('mongo').connect()

    database.buildTable('products')

    await database.createTable('products', (tableBuilder: TableBuilder) => {
      tableBuilder.string('name').notNullable()
      tableBuilder.integer('quantity').nullable().defaultTo(0)
    })

    await database.createTable('product_details', (tableBuilder: TableBuilder) => {
      tableBuilder.string('detail').notNullable()
      tableBuilder.string('productId').notNullable()
      tableBuilder.string('product').notNullable().references('_id').inTable('products')
    })
  })

  it('should insert new products to the database', async () => {
    const idOfProducts = await database.insert([{ name: 'iPhone 10' }, { name: 'iPhone 11' }, { name: 'iPhone 12' }])

    expect(idOfProducts.length).toBe(3)
  })

  it('should get the product from database', async () => {
    const [idIphone] = await database.insert({ name: 'iPhone 10' })

    const iphone = await database.buildWhere('_id', idIphone).find()

    expect(iphone.name).toBe('iPhone 10')
  })

  it('should get all the products from database', async () => {
    await database.insert([{ name: 'iPhone 10' }, { name: 'iPhone 11' }, { name: 'iPhone 12' }])

    const iphones = await database.findMany()

    expect(iphones.length).toBe(3)
  })

  it('should get all the products from database paginated', async () => {
    await database.insert([{ name: 'iPhone 10' }, { name: 'iPhone 11' }, { name: 'iPhone 12' }])

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
    await database.insert([{ name: 'iPhone 10' }, { name: 'iPhone 11' }, { name: 'iPhone 12' }])

    const data = await database.forPage(0, 2)

    expect(data.length).toBe(2)
  })

  it('should update the product in database', async () => {
    const [iphone] = await database.insertAndGet({ name: 'iPhone 10' })

    const [iphoneUpdated] = await database.buildWhere('_id', iphone._id).updateAndGet('name', 'iPhone 11')

    expect(iphoneUpdated.name).toBe('iPhone 11')
  })

  it('should delete the product in database', async () => {
    const [iphone] = await database.insertAndGet({ name: 'iPhone 10' })

    await database.buildWhere('_id', iphone._id).delete()

    const deletedIphone = await database.buildWhere({ _id: iphone._id }).find()

    expect(deletedIphone).toBeFalsy()
  })

  it('should be able to create and drop databases from different instances', async () => {
    await database.createDatabase('new-database')

    const newDb = await new Database().connection('mongo', { database: 'new-database' }).connect()

    await newDb.createTable('products', () => ({
      name: { type: String, required: true },
    }))

    const [product] = await newDb.buildTable('products').insertAndGet({ name: 'Product' })

    expect(product.name).toBe('Product')

    await newDb.close()
    await database.dropDatabase('new-database')
  }, 10000)

  it('should be able to join on other related tables', async () => {
    const iphones = await database.insertAndGet([{ name: 'iPhone 10' }, { name: 'iPhone 11' }, { name: 'iPhone 12' }])

    await Promise.all(
      iphones.map(iphone =>
        database.buildTable('product_details').insert({ detail: '64 GB', product: iphone, productId: iphone._id }),
      ),
    )
    await Promise.all(
      iphones.map(iphone =>
        database
          .buildTable('product_details')
          .insert({ detail: 'CPU ARM Arch', product: iphone, productId: iphone._id }),
      ),
    )

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

    const macbooks = await database
      .buildTable('products')
      .insertAndGet([{ name: 'Macbook 2019' }, { name: 'Macbook 2020' }, { name: 'Macbook 2021' }])

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

  it('should be able to create database transactions and rollback then', async () => {
    const trx = await database.beginTransaction()

    const products = await trx.buildTable('products').insertAndGet({ name: 'AirPods 3' })

    expect(products.length).toBe(1)

    await trx.rollback()

    const product = await database.buildTable('products').buildWhere('_id', products[0]._id).find()

    expect(product).toBeFalsy()
    // db.adminCommand( { setParameter: 1, maxTransactionLockRequestTimeoutMillis: 5000 })
    // db.createUser({ user: 'root', pwd: 'root', roles: [{ role: 'userAdminAnyDatabase', db: 'admin' }] })
  })

  it('should be able to use pluck method, that returns the values of specific table column', async () => {
    await database.buildTable('products').insert([{ name: 'Apple Watch Series 2' }, { name: 'Apple Watch Series 3' }])

    const productsName = await database.pluck('name')

    expect(productsName.length).toBe(2)
    expect(productsName[0]).toBe('Apple Watch Series 2')
    expect(productsName[1]).toBe('Apple Watch Series 3')
  })

  it('should be able to use raw method to make raw queries to database', async () => {
    await database.buildTable('products').insert([{ name: 'Apple Watch Series 2' }, { name: 'Apple Watch Series 3' }])

    const products = await database.raw('db.collection(??).find().toArray()', ['products'])

    // Only for Mongoose
    expect(products.command).toBe('find()')
    expect(products.rowCount).toBe(2)
    expect(products.rows.length).toBe(2)
    expect(products.rows[0].name).toBe('Apple Watch Series 2')
  })

  it('should be able to count and count distinct the database data', async () => {
    await database
      .buildTable('products')
      .insert([
        { name: null },
        { name: 'Apple Watch Series 2' },
        { name: 'Apple Watch Series 2' },
        { name: 'Apple Watch Series 3' },
      ])

    const countAll = await database.count('*')
    const countName = await database.count('name')
    const countDistinct = await database.countDistinct('name')

    expect(countAll).toBe(4)
    expect(countName).toBe(3)
    expect(countDistinct).toBe(2)
  })

  it('should be able to get the min and max values from some column', async () => {
    await database.buildTable('products').insert([
      { name: 'iPhone 1', quantity: -40 },
      { name: 'iPhone 2', quantity: 10 },
      { name: 'iPhone 3', quantity: 20 },
      { name: 'iPhone 4', quantity: 30 },
      { name: 'iPhone 5', quantity: 40 },
    ])

    const max = await database.max('quantity')
    const min = await database.min('quantity')

    expect(max).toBe(40)
    expect(min).toBe(-40)
  })

  it('should be able to sum and sum distinct the database data', async () => {
    await database.buildTable('products').insert([
      { name: 'iPhone 1', quantity: -40 },
      { name: 'iPhone 2', quantity: 10 },
      { name: 'iPhone 3', quantity: 20 },
      { name: 'iPhone 4', quantity: 30 },
      { name: 'iPhone 5', quantity: 40 },
      { name: 'iPhone 6', quantity: 40 },
    ])

    const qtyTotal = await database.sum('quantity')
    const qtyTotalDistinct = await database.sumDistinct('quantity')

    expect(qtyTotal).toBe(100)
    expect(qtyTotalDistinct).toBe(60)
  })

  it('should be able to get the avg and avg distinct from the database data', async () => {
    await database.buildTable('products').insert([
      { name: 'iPhone 1', quantity: -40 },
      { name: 'iPhone 2', quantity: 10 },
      { name: 'iPhone 3', quantity: 20 },
      { name: 'iPhone 4', quantity: 30 },
      { name: 'iPhone 5', quantity: 40 },
      { name: 'iPhone 6', quantity: 40 },
    ])

    const qtyAvg = await database.avg('quantity')
    const qtyAvgDistinct = await database.avgDistinct('quantity')

    expect(qtyAvg).toBe(16.666666666666668)
    expect(qtyAvgDistinct).toBe(12)
  })

  it('should be able to increment and decrement values from database', async () => {
    const ids = await database.buildTable('products').insert([
      { name: 'iPhone 1', quantity: -40 },
      { name: 'iPhone 2', quantity: 10 },
      { name: 'iPhone 3', quantity: 20 },
      { name: 'iPhone 4', quantity: 30 },
      { name: 'iPhone 5', quantity: 40 },
      { name: 'iPhone 6', quantity: 40 },
    ])

    await database.buildWhere('_id', ids[1]).increment('quantity', 20)
    await database.buildWhere('_id', ids[2]).decrement('quantity', 20)

    const increment = await database.buildWhere('_id', ids[1]).find()
    const decrement = await database.buildWhere('_id', ids[2]).find()

    expect(increment.quantity).toBe(30)
    expect(decrement.quantity).toBe(0)
  })

  it('should be able to get infos from some database column', async () => {
    // WARN
    // Mongo columnInfo just return default value for all columns because mongo collection is just a document

    const columnInfo = await database.buildTable('products').columnInfo('name')

    expect(columnInfo.defaultValue).toBe('null')
    expect(columnInfo.type).toBe('any')
    expect(columnInfo.maxLength).toBe('255')
    expect(columnInfo.nullable).toBe(true)
  })

  it('should be able to get data ordered, grouped, with only specific fields selected and using having method', async () => {
    await database.buildTable('products').insert([
      { name: 'iPhone 1', quantity: -40 },
      { name: 'iPhone 2', quantity: -30 },
      { name: 'iPhone 3', quantity: 10 },
      { name: 'iPhone 4', quantity: 20 },
      { name: 'iPhone 5', quantity: 30 },
      { name: 'iPhone 6', quantity: 40 },
      { name: 'iPhone 6', quantity: 40 },
      { name: 'iPhone 7', quantity: 50 },
      { name: 'iPhone 8', quantity: 60 },
    ])

    const iphones = await database
      .buildTable('products')
      .buildSelect('name', 'quantity')
      .buildGroupBy('name', 'quantity')
      .buildOrderBy('quantity', 'desc')
      .buildHaving('quantity', '<=', 40)
      .findMany()

    expect(iphones.length).toBe(6)

    expect(iphones[0].name).toBe('iPhone 6')
    expect(iphones[0].quantity).toBe(40)

    expect(iphones[5].name).toBe('iPhone 1')
    expect(iphones[5].quantity).toBe(-40)
  })

  afterAll(async () => {
    await replset.stop()
  })

  afterEach(async () => {
    await database.dropTable('product_details')
    await database.dropTable('products')
    await database.close()
  })
})
