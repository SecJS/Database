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
  default: Env('DB_CONNECTION', 'postgresql'),

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
      url: Env('DB_URL', ''),
      database: Env('DB_DATABASE', Path.database('sqlite')),
    },

    mysql: {
      driver: 'mysql',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 3306),
      database: Env('DB_DATABASE', 'sqlite'),
      username: Env('DB_USERNAME', 'sqlite'),
      password: Env('DB_PASSWORD', ''),
    },

    postgresql: {
      driver: 'postgresql',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 5432),
      database: Env('DB_DATABASE', 'sqlite'),
      username: Env('DB_USERNAME', 'sqlite'),
      password: Env('DB_PASSWORD', ''),
    },

    sqlserver: {
      driver: 'sqlserver',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 1433),
      database: Env('DB_DATABASE', 'sqlserver'),
      username: Env('DB_USERNAME', 'sqlserver'),
      password: Env('DB_PASSWORD', ''),
    },

    mongodb: {
      driver: 'mongodb',
      url: Env('DB_URL', ''),
      host: Env('DB_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'DB_PORT' }, 27017),
      database: Env('DB_DATABASE', 'sqlserver'),
      username: Env('DB_USERNAME', 'sqlserver'),
      password: Env('DB_PASSWORD', ''),
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

  /*
  |--------------------------------------------------------------------------
  | Redis Databases
  |--------------------------------------------------------------------------
  |
  | Redis is an open source, fast, and advanced key-value store that also
  | provides a richer body of commands than a typical key-value system
  | such as APC or Memcached. SecJS makes it easy to dig right in.
  |
  */

  redis: {

    default: {
      host: Env('REDIS_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'REDIS_PORT' }, 6379),
      password: Env('REDIS_PASSWORD', '')
    },

    cache: {
      host: Env('REDIS_HOST', '127.0.0.1'),
      port: Env({ type: 'number', name: 'REDIS_PORT' }, 6379),
      password: Env('REDIS_PASSWORD', '')
    },

  }
}
