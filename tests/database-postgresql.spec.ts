import '@secjs/env/src/utils/global'

import { Config } from '@secjs/config'
import { Database } from '../src/Database'

describe('\n Database PostgreSQL Class', () => {
  let database: Database = null

  beforeEach(async () => {
    await new Config().load()

    database = new Database()
      .changeDefaultConnection('postgresql')
      .buildTable('products')

    await database.createTable('products', [
      { name: 'id', type: 'increments', isPrimary: true },
      { name: 'name', type: 'string', isNullable: false }
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

  afterEach(async () => {
    await database.dropTable('products')
    await database.close()
  })
})
