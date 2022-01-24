import '@secjs/env/src/utils/global'

import { Config } from '@secjs/config'
import { Database } from '../src/Database'
import { DatabaseContract } from '../src/Contracts/DatabaseContract'

describe('\n Database PostgreSQL Class', () => {
  let database: DatabaseContract = null

  beforeEach(async () => {
    await new Config().load()

    database = new Database()
      .changeDefaultConnection('postgresql')
      .buildTable('products')

    await database.createTable('products', [
      { name: 'id', type: 'increments', isPrimary: true },
      { name: 'name', type: 'string', isNullable: false }
    ])

    await database.createTable('product_details', [
      { name: 'id', type: 'increments', isPrimary: true },
      { name: 'detail', type: 'string', isNullable: false },
      { name: 'productId', type: 'integer', references: { column: 'id', table: 'products'} }
    ])
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
      .buildTable('products')

    await newDb.createTable('products', [
      { name: 'id', type: 'increments', isPrimary: true },
      { name: 'name', type: 'string', isNullable: false }
    ])

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

  afterEach(async () => {
    await database.dropTable('product_details')
    await database.dropTable('products')
    await database.close()
  })
})
