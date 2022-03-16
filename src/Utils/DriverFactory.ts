/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  InternalServerException,
  NotImplementedException,
} from '@secjs/exceptions'
import { Config } from '@secjs/utils'
import { MongoDriver } from '../Drivers/MongoDriver'
import { MySqlDriver } from '../Drivers/MySqlDriver'
import { SqliteDriver } from '../Drivers/SqliteDriver'
import { ConnectionFactory } from './ConnectionFactory'
import { PostgresDriver } from '../Drivers/PostgresDriver'
import { SqlServerDriver } from '../Drivers/SqlServerDriver'
import { DriverContract } from '../Contracts/DriverContract'

export interface DriverObject {
  Driver: any
  lastConName?: string
  clientConnection?: any
}

export class DriverFactory {
  private static drivers: Map<string, DriverObject> = new Map()
    .set('mongo', { Driver: MongoDriver })
    .set('mysql', { Driver: MySqlDriver })
    .set('sqlite', { Driver: SqliteDriver })
    .set('postgres', { Driver: PostgresDriver })
    .set('sqlserver', { Driver: SqlServerDriver })

  static availableDrivers(onlyConnected = false): string[] {
    const availableDrivers = []

    for (const [key, value] of this.drivers.entries()) {
      if (onlyConnected) {
        if (!value.clientConnection) continue

        availableDrivers.push(key)

        continue
      }

      availableDrivers.push(key)
    }

    return availableDrivers
  }

  static fabricate(conName: string, runtimeConfig: any = {}): DriverContract {
    const conConfig = this.getConnectionConfig(conName)

    const { Driver, clientConnection } = this.drivers.get(conConfig.driver)

    if (clientConnection) {
      return new Driver(clientConnection, runtimeConfig)
    }

    this.drivers.set(conConfig.driver, {
      Driver,
      clientConnection,
      lastConName: conName,
    })

    return new Driver(conName, runtimeConfig)
  }

  static createDriver(
    name: string,
    driver: new (connection: string, configs?: any) => DriverContract,
  ) {
    if (this.drivers.has(name)) {
      throw new InternalServerException(`Driver ${name} already exists`)
    }

    this.drivers.set(name, { Driver: driver })
  }

  static async closeAllDriversConnection() {
    for (const [key] of this.drivers.keys()) {
      await this.closeDriverConnection(key)
    }
  }

  static async closeDriverConnection(driverName: string) {
    if (!this.drivers.has(driverName)) {
      throw new InternalServerException(`Driver ${driverName} doesn't exist`)
    }

    const driverObject = this.drivers.get(driverName)

    const client = driverObject.clientConnection

    if (client.close) await client.close()
    else await client.destroy()

    driverObject.clientConnection = null

    this.drivers.set(driverName, driverObject)
  }

  static setClientConnection(driverName: string, clientConnection: any) {
    if (!this.drivers.has(driverName)) {
      throw new InternalServerException(`Driver ${driverName} doesn't exist`)
    }

    const driverObject = this.drivers.get(driverName)

    driverObject.clientConnection = clientConnection

    this.drivers.set(driverName, driverObject)
  }

  static async generateDriverClient(
    driverName: string,
    conName?: string,
    configs: any = {},
    saveOnDriver = true,
  ) {
    if (!this.drivers.has(driverName)) {
      throw new InternalServerException(`Driver ${driverName} doesn't exist`)
    }

    const driverObject = this.drivers.get(driverName)

    if (!conName) conName = driverObject.lastConName

    const client = await ConnectionFactory[driverName](conName, configs)

    if (!saveOnDriver) return client

    driverObject.clientConnection = client
    this.drivers.set(driverName, driverObject)

    return client
  }

  static async generateConnectionClient(
    conName?: string,
    configs: any = {},
    saveOnDriver = true,
  ) {
    const conConfig = this.getConnectionConfig(conName)

    await this.generateDriverClient(
      conConfig.driver,
      conName,
      configs,
      saveOnDriver,
    )
  }

  static async closeConnection(conName: string) {
    const conConfig = this.getConnectionConfig(conName)

    await this.closeDriverConnection(conConfig.driver)
  }

  private static getConnectionConfig(conName: string) {
    if (conName === 'default') conName = Config.get('database.default')

    const conConfig = Config.get(`database.connections.${conName}`)

    if (!conConfig) {
      throw new NotImplementedException(
        `Connection ${conName} is not configured inside database.connections object from config/database file`,
      )
    }

    if (!this.drivers.has(conConfig.driver)) {
      throw new NotImplementedException(
        `Driver ${conConfig.driver} does not exist, use Database.build method to create a new driver`,
      )
    }

    return conConfig
  }
}
