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
npm install @secjs/env @secjs/utils @secjs/config @secjs/contracts @secjs/exceptions
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

> Create tables

```ts
import { Knex } from 'knex'
import { Database } from '@secjs/database'

const database = await new Database().connect()

// Database class will always use the default value set in config/database to handle operations, in this case, postgres.
// All SQL Drivers from Database are using Knex as query builder and for Mongo NoSQL, mongoose.
await database.createTable('products', (tableBuilder: Knex.TableBuilder) => {
  tableBuilder.increments('id').primary()
  tableBuilder.string('name').nullable()
  tableBuilder.integer('quantity').nullable().defaultTo(0)
})
```

> Insert products

```ts
// Insert and return an array of ID
const productIds = await database.insert([{ name: 'iPhone 10' }, { name: 'iPhone 11' }, { name: 'iPhone 12' }])
// Insert and return an array of products objects
const products = await database.insertAndGet({ name: 'iPhone 13' })
```

> Get products

```ts
// Build a where query and handle it with find, find return only one value
const product = await database.buildWhere('id', idIphone).find()
// Find many return an array of values
const products = await database.findMany()
// Find many products paginated and return meta and links
const { data, meta, links } = await database.paginate(0, 2, '/products')
// Find many products paginated and return only the data
const productsPaginated = await database.forPage(0, 2)
```

...

---

## License

Made with 🖤 by [jlenon7](https://github.com/jlenon7) :wave:
