# Database 🛢️

> Handle your application database with factories, seeders and query builder in Node.js

[![GitHub followers](https://img.shields.io/github/followers/jlenon7.svg?style=social&label=Follow&maxAge=2592000)](https://github.com/jlenon7?tab=followers)
[![GitHub stars](https://img.shields.io/github/stars/secjs/storage.svg?style=social&label=Star&maxAge=2592000)](https://github.com/secjs/database/stargazers/)

<p>
    <a href="https://www.buymeacoffee.com/secjs" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
</p>

<p>
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/secjs/database?style=for-the-badge&logo=appveyor">

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/secjs/database?style=for-the-badge&logo=appveyor">

  <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen?style=for-the-badge&logo=appveyor">

  <img alt="Commitizen" src="https://img.shields.io/badge/commitizen-friendly-brightgreen?style=for-the-badge&logo=appveyor">
</p>

The intention behind this repository is to always maintain a `Database` class to manipulate data using any database
driver (SQL and NoSQL).

<img src=".github/database.png" width="200px" align="right" hspace="30px" vspace="100px">

## Installation

> To use the high potential from this package you need to install first this other packages from SecJS,
> it keeps as dev dependency because one day `@secjs/core` will install everything once.

```bash
npm install @secjs/env @secjs/utils @secjs/exceptions
```

> Then you can install the package using:

```bash
npm install @secjs/database
```

## Usage

### Config database template

> First you need to create the configuration file database in the config folder on project root path. Is extremely important to use export default in these configurations.

```ts
import { Env } from '@secjs/env'
import { Path } from '@secjs/utils'

export default {
  /*
  |--------------------------------------------------------------------------
  | Default Database Connection Name
  |--------------------------------------------------------------------------
  |
  | Here you may specify which of the database connections below you wish
  | to use as your default connection for all database work. Of course
  | you may use many connections at once using the Database library.
  |
  */
  default: Env('DB_CONNECTION', 'postgres'),

  /*
  |--------------------------------------------------------------------------
  | Database Connections
  |--------------------------------------------------------------------------
  |
  | Here are each of the database connections setup for your application.
  | Of course, examples of configuring each database platform that is
  | supported by SecJS is shown below to make development simple.
  |
  */

  connections: {
    sqlite: {
      driver: 'sqlite',
      filename: Env('DB_FILENAME', Path.database('sqlite')),
    },

    mysql: {
      driver: 'mysql',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 3306),
      database: Env('DB_DATABASE', 'mysql'),
      user: Env('DB_USERNAME', 'root'),
      password: Env('DB_PASSWORD', ''),
    },

    postgres: {
      driver: 'postgres',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 5432),
      database: Env('DB_DATABASE', 'postgres'),
      user: Env('DB_USERNAME', 'root'),
      password: Env('DB_PASSWORD', ''),
    },

    sqlserver: {
      driver: 'sqlserver',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 1433),
      database: Env('DB_DATABASE', 'sqlserver'),
      user: Env('DB_USERNAME', 'root'),
      password: Env('DB_PASSWORD', ''),
    },

    mongo: {
      driver: 'mongo',
      protocol: 'mongodb',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 27017),
      database: Env('DB_DATABASE', 'mongodb'),
      user: Env('DB_USERNAME', ''),
      password: Env('DB_PASSWORD', ''),
      options: {
        w: 'majority',
        replicaSet: 'rs',
        retryWrites: true,
        authSource: 'admin',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Migration Repository Table
  |--------------------------------------------------------------------------
  |
  | This table keeps track of all the migrations that have already run for
  | your application. Using this information, we can determine which of
  | the migrations on disk haven't actually been run in the database.
  |
  */

  migrations: 'migrations',
}
```

### Database

> With the config/database file created you can use Database class to start handling operations in your database.

#### Connecting to database

```ts
import { Database } from '@secjs/database'

// Database class will always use the default value set in config/database 
// to handle operations, in this case, postgres.

// If true will force the creation of the connection for that driver 
// even if that driver is already connected to database
const force = false // default is false

// If true will save the connection inside DriverFactory and this connection
// will be shared in all Database/Driver instances that use this connection
const saveOnDriver = true // default is true

// You can create the connection for postgres calling connect method
const database = await new Database()
  .connection('postgres')
  .connect(force, saveOnDriver)

// Now every time that you need postgres connection, you don't need to call connect again
const newDb = new Database().connection('postgres')
// Database/Driver always share the same database connection for each instance!

// We recommend using the static method createConnections in the application startup.
// It will create the connections according to config/database file
await Database.createConnections('postgres', 'mongo')

// Now you don't need to call connect method when changing your connection
database.connection('mongo') // will use mongo driver
```

#### Disconnecting from database

```ts
// There are three ways to disconect from database

// WARN - Becarefull with close if you are using a shared connection, 
// it will close the connection for all Database/Driver instances 

// 1 - Calling close in the database instance
await database.close()

// 2 - Calling the static closeConnections method
await Database.closeConnections('postgres', 'mongo')

// 3 - Calling the static closeAllDrivers method
await Database.closeAllDrivers() // Close all Drivers connections inside DriverFactory
```

#### Creating a specific connection with database subscribing configs in runtime

```ts
// As you can see above, each Driver class share the same database connection.
// But maybe you need to create a specific connection with runtime configurations,
// without implicating in other Driver connections.

const force = true
const saveOnDriver = false
const runtimeConfigs = { database: 'testing' }

const runtimeDb = new Database()
  .connection('postgres', runtimeConfigs)
  // You need to set force as true and saveOnDriver as false, 
  // this way you will force creating a new connection for postgres but
  // it will not implicate in other Database/Driver instances connections. 
  // We can use connect method this way to create a specific connection
  // to work on.
  .connect(force, saveOnDriver)

// This connection won't be available in static method Database.closeConnections.
// If calling this method it will close the main PostgresDriver connection
await Database.closeConnections('postgres')

// So always remember closing this connection!
await runtimeDb.close()
```

#### Create/drop tables and databases

```ts
import { Knex } from 'knex'
import { Database, TableBuilder } from '@secjs/database'
import database from './database'

// All SQL Drivers from Database are using Knex as query builder and for Mongo NoSQL, mongoose.
await database.createTable('products', (tableBuilder: Knex.TableBuilder) => {
  tableBuilder.increments('id').primary()
  tableBuilder.string('name').nullable()
  tableBuilder.integer('quantity').nullable().defaultTo(0)
})

// Creating the product details table
await database.createTable('product_details', (tableBuilder: Knex.TableBuilder) => {
  tableBuilder.increments('id').primary()
  tableBuilder.string('detail').nullable()
  // One product has many product details
  tableBuilder.integer('productId').references('id').inTable('products')
})

// Mongoose driver has a TableBuilder to create collections, 
// but it does not have all the methods from Knex table builder.

// Changing the connection to mongo database
database.connection('mongo')

// With mongo connection we can't create the table. But we can set our schema
// in buildTable method
const productSchema = new Schema({
  name: String,
  quantity: Number,
})

database.buildTable({
  name: 'Product',
  collection: 'products',
  schema: productSchema
})

// Drop table products from database
await database.dropTable('products')

// You can also create databases
await database.createDatabase('testing-database')

// Then you can create a new database instance to connect to this new database
const runtimeConfigurations = { database: 'testing-database' }

const testingDatabase = await new Database(runtimeConfigurations)
  .connection('mongo')
  // Force connection and don't save the connection 
  .connect(true, false)

// Do operations using testingDatabase....

// Close the connection with testing database
await testingDatabase.close()

// You can drop databases too
await database.dropDatabase('testing-database')
```

#### Insert products

```ts
// Insert and return an array of ID
const productIds = await database
  .buildTable('products')
  .insert([{ name: 'iPhone 10' }, { name: 'iPhone 11' }, { name: 'iPhone 12' }])

// WARN - ONLY FOR SQL
{
  // When Database insert the data he will always return an array of ID. 
  // But you can change this behavior setting the returnKey value
  const returnKey = 'name'
  const productNames = await database
    .buildTable('products')
    .insert([{ name: 'iPhone 13' }], returnKey)

  // The returnKey can be defined only in SQL Drivers because Mongo always returns the _id by default
}

const returnKeyId = 'id'
// Insert and return an array of products objects
const products = await database
  .buildTable('products')
  // You can set returnKey here too, this way it will insert the product 
  // and then find the products by the returnKey value, in this case, the id
  // WARN - Remember, this is a SQL feature only and will not take effect in MongoDriver
  .insertAndGet({ name: 'iPhone 13' }, returnKeyId)

// WARN - buildTable method needs to be called only one time before the connection is stabilished.
// when you call buildTable it saves in the Driver instance the table that you are working on.

// So, all the operations that I call now will use 'products' table to operate. Example:
const data = await database
  // .buildTable('products') I do not need this anymore
  .findMany() // Will find all the data inside products table
```

#### Get products

```ts
// Build a where query and handle it with find, find return only one value
// If using mongodb change from id to _id
const product = await database.buildWhere('id', idIphone).find()

// Find many return an array of values
const products = await database.findMany()

const page = 0
const limit = 10

// Find many products paginated and return meta and links
const { data, meta, links } = await database.paginate(page, limit, '/products')

// Find many products paginated and return only the data
const productsPaginated = await database.forPage(page, limit)
```

#### Update products

```ts
const productIds = await database.insert([{ name: 'iPhone 10' }, { name: 'iPhone 11' }])

// WARN - ONLY FOR SQL
{
  // When Database update the data he will always return an array of ID.
  // But you can change this behavior setting the returnKey value
  const returnKey = 'name'
  const productNames = await database
    .buildTable('products')
    .update([{ name: 'iPhone 13' }], returnKey)

  // The returnKey can be defined only in SQL Drivers because Mongo always returns the _id by default
}

const returnKeyId = 'id'
// WARN - Be carefull with update, remember to always use where
const productsUpdated = await database
  .buildWhereIn('id', productIds)
  // You can set returnKey here too, this way it will update the product 
  // and then find the products by the returnKey value, in this case, the id
  // WARN - Remember, this is a SQL feature only and will not take effect in MongoDriver
  .updateAndGet({ name: 'iPhone X' }, returnKeyId) // or updateAngGet('name', 'iPhone X', returnKeyId)

console.log(productsUpdated) // [{ id: 1, name: 'iPhone X', quantity: 0 }, { id: 2, name: 'iPhone X', quantity: 0 }]
```

#### Delete products

```ts
const productIds = await database.insert([{ name: 'iPhone 10' }, { name: 'iPhone 11' }])

// Be carefull with delete, remember to always use where
await database
  .buildWhereIn('id', productIds)
  .delete()
```

#### Join relations

```ts
const productIds = await database.insert([{ name: 'iPhone 10' }, { name: 'iPhone 11' }])

// Creating a new detail for each product created
const promisesPending = productIds.map(productId => (database.buildTable('product_details').insert({
  detail: '64 GB',
  productId
})))

// Resolving the array of promises
await Promise.all(promisesPending)

const productsWithDetails = await database
  .buildTable('products')
  .buildJoin('product_details', 'products.id', 'product_details.id', 'leftJoin')
  .findMany()

// If using SQL driver, the detail will come inside the main product object.
//Knex does not map the relations, is just a query builder.
console.log(productsWithDetails) // [{ id: 1, name: 'iPhone 10', quantity: 0, detail: '64 GB', productId: 1 }, ...]

// But if using MongoDriver, mongoose will map the "relation" and bring product details inside an object
console.log(productsWithDetails) // [{ id: 1, name: 'iPhone 10', quantity: 0, product_details: [{ id: 1, detail: '64 GB', productId: 1 }] }, ...]
```

#### Order By

```ts
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

// Order the products by quantity value in desc mode
const products = await database
  .buildTable('products')
  .buildSelect('name', 'quantity')
  .buildOrderBy('quantity', 'desc')
  .findMany()

console.log(products[0].name) // 'iPhone 8'
```

#### Group By and Having

```ts
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


const products = await database
  .buildTable('products')
  .buildSelect('name', 'quantity')
  // Group the products by name and quantity
  .buildGroupBy('name', 'quantity')
  // Then regroup then only where quantity is under 40
  .buildHaving('quantity', '<=', 40)
  .findMany()

console.log(products[0].name) // 'iPhone 3'
```

#### Database Transactions

```ts
import { Transaction } from '@secjs/database'

// Start the transaction
const trx: Transaction = await database.beginTransaction()

await trx
  .buildTable('products')
  .insert({ name: 'AirPods 3' })

try {
  // Do some process that could fail...

  // Commit the transaction if process does not fail
  await trx.commit()
} catch (error) {
  // Handle the error...

  // Rollback the transaction and all the operations done in the database
  await trx.rollback()
}
```

#### Pluck column values

```ts
await database
  .buildTable('products')
  .insert([{ name: 'Apple Watch Series 2' }, { name: 'Apple Watch Series 3' }])

// Pluck get the value of only one column
const productsName = await database.pluck('name')

console.log(productsName) // ['Apple Watch Series 2', 'Apple Watch Series 3']
```

#### Min & Max

```ts
await database.buildTable('products').insert([
  { name: 'iPhone 1', quantity: -40 },
  { name: 'iPhone 2', quantity: 10 },
  { name: 'iPhone 3', quantity: 20 },
  { name: 'iPhone 4', quantity: 30 },
  { name: 'iPhone 5', quantity: 40 },
])

// Get the max value from column quantity in products table
console.log(await database.max('quantity')) // 40
// Get the min value from column quantity in products table
console.log(await database.min('quantity')) // -40
```

#### Increment & Decrement

```ts
const ids = await database.buildTable('products').insert([
  { name: 'iPhone 1', quantity: -40 },
  { name: 'iPhone 2', quantity: 10 },
  { name: 'iPhone 3', quantity: 20 },
  { name: 'iPhone 4', quantity: 30 },
  { name: 'iPhone 5', quantity: 40 },
  { name: 'iPhone 6', quantity: 40 },
])

// Incrementing product quantity
await database.buildWhere('_id', ids[1]).increment('quantity', 20)
// Decrementing product quantity
await database.buildWhere('_id', ids[2]).decrement('quantity', 20)

// 10 + 20 = 30
console.log(await database.buildWhere('_id', ids[1]).find()) // { name: 'iPhone 2', quantity: 30 }

// 20 - 20 = 40
console.log(await database.buildWhere('_id', ids[2]).find()) // { name: 'iPhone 3', quantity: 0 }
```

#### Count & Count Distinct

```ts
await database
  .buildTable('products')
  .insert([
    { name: null },
    { name: 'Apple Watch Series 2' },
    { name: 'Apple Watch Series 2' },
    { name: 'Apple Watch Series 3' },
  ])

// Count all table rows
console.log(await database.count('*')) // 4

// Count only where name column exists in table products
console.log(await database.count('name')) // 3

// Count only where name column exists in table products and the values from name are distinct
console.log(await database.countDistinct('name')) // 2
```

#### Sum & Sum Distinct

```ts
await database.buildTable('products').insert([
  { name: 'iPhone 1', quantity: -40 },
  { name: 'iPhone 2', quantity: 10 },
  { name: 'iPhone 3', quantity: 20 },
  { name: 'iPhone 4', quantity: 30 },
  { name: 'iPhone 5', quantity: 40 },
  { name: 'iPhone 6', quantity: 40 },
])

// Sum all the values from the column quantity in products table
console.log(await database.sum('quantity')) // 100

// Sum all the values from the column quantity in products table only where quantity values are distinct
console.log(database.sumDistinct('quantity')) // 60
```

#### Avg & Avg Distinct

```ts
await database.buildTable('products').insert([
  { name: 'iPhone 1', quantity: -40 },
  { name: 'iPhone 2', quantity: 10 },
  { name: 'iPhone 3', quantity: 20 },
  { name: 'iPhone 4', quantity: 30 },
  { name: 'iPhone 5', quantity: 40 },
  { name: 'iPhone 6', quantity: 40 },
])

// Get the average of all the values from column quantity in table products
console.log(await database.avg('quantity')) // 16.666666666666668

// Get the average of all the values from column quantity in table products where quantity values are distinct
console.log(await database.avgDistinct('quantity')) // 12
```

#### Raw queries

```ts
await database
  .buildTable('products')
  .insert({ name: 'iPhone X' })

// Using Knex
const knexRaw = await database.raw('SELECT * FROM ??;', ['products'])

console.log(knexRaw) // { command: 'SELECT', rowCount: 1, rows: [{ id: 1, name: 'iPhone X' }] }

// Using Mongoose
await database.connection('mongo').connect()

const mongooseRaw = await database.raw('db.collection(??).find().toArray()', ['products'])

console.log(mongooseRaw)  // { command: 'find()', rowCount: 1, rows: [{ id: 1, name: 'iPhone X' }] }
```

#### Get information from columns

```ts
const columnInfo = await database.buildTable('products').columnInfo('name')

console.log(columnInfo) // { defaultValue: null, type: 'character varying', maxLength: 255, nullable: true }

// WARN Under MongoDriver
// columnInfo method in mongo just return a fake object
```

#### Clone Database Query Chain

```ts
// Set the table products
database.buildTable('products')

// Clone the database query chain, this will create a new instance of the Database class
// but with the exactly same query chain.
const clonedDatabase = database.clone()

console.log(database === clonedDatabase) // false

// This insert will be done in products table because of database.buildTable
const arrayOfIds = await clonedDatabase.insert({ name: 'AirPods 2' })
```

#### Clone client instance (Knex, Mongoose, etc)

```ts
import { Knex } from 'knex'

// This method will give you an instance of the client 
// depending the driver that you are using
const { client } = await database.cloneQuery<Knex.QueryBuilder>()

const arrayOfIds = await client.insert({ name: 'AirPods 2' }, 'id')

{
  // For mongoose you can set the Schema as type
  database.connection('mongo')

  const { client, session } = await database.cloneQuery<UserSchema>()

  // If using session...
  const product = await client.insertOne({ name: 'AirPods 2' }, { session })
}
```

### Extending connections and drivers

> Nowadays, @secjs/database has only MongoDriver, MySqlDriver, PostgresDriver, SqliteDriver and SqlServerDriver support, but you can extend the drivers for Database class if you implement DriverContract interface

```ts
import { DriverContract } from '@secjs/database'

class CustomDriver implements DriverContract {
  private readonly _dbUrl: string

  constructor(connection: string) {
    this._dbUrl = Config.get(`database.connections.${connection}.url`)
  }

  // all the methods implemented from DriverContract...
}
```

> Constructor is extremely important in your CustomDriver class, it's the constructor that
> will use the values from config/database connections to manipulate your CustomDriver using
> `connection` method from database. So if you are building a CustomDriver, and you want to use it,
> you can create a new connection inside config/database connections or change the driver from an existing connection.

```ts
// extending connections
// config/database file

export default {
  // default etc...

  connections: {
    myconnection: {
      driver: 'custom',
      url: Env('DATABASE_URL', ''),
    }
    // ... other connections
  }
}
```

> Build you new driver using build static method

```ts
const name = 'custom'
const driver = CustomDriver

// Will create the driver
Database.build(name, driver)

// List all Database drivers
console.log(Database.drivers()) // ['mysql', 'mongo', 'sqlite', 'mssql', 'postgres', 'custom']

const onlyConnected = true

// List only Database drivers where there are a connection established
console.log(Database.drivers(onlyConnected)) // ['postgres', 'mongo']
```

> Now, if you have implemented your connection in config/database, you can use him inside Database

```ts
// Will use CustomDriver to handle the database operations and 
// save the shared connection in DriverFactory
await database.connection('myconnection').connect()

console.log(Database.drivers(true)) // ['postgres', 'mongo', 'custom']
```

---

Made with 🖤 by [jlenon7](https://github.com/jlenon7) :wave:
