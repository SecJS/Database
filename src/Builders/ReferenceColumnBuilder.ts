/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export class ReferenceColumnBuilder {
  private _inTable: string
  private _unique = false
  private _nullable = true
  private _defaultTo = null
  private readonly _columnName: string

  toJSON() {
    return {
      unique: this._unique,
      nullable: this._nullable,
      defaultTo: this._defaultTo,
      inTable: this._inTable,
      columnName: this._columnName,
    }
  }

  constructor(columnName: string) {
    this._columnName = columnName
  }

  unique() {
    this._unique = true

    return this
  }

  inTable(tableName: string) {
    this._inTable = tableName

    return this
  }

  nullable() {
    this._nullable = true

    return this
  }

  defaultTo(defaultValue: any) {
    this._defaultTo = defaultValue

    return this
  }

  notNullable() {
    this._nullable = false

    return this
  }
}
