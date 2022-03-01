/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Is } from '@secjs/utils'
import { ReferenceColumnBuilder } from './ReferenceColumnBuilder'

export class ColumnBuilder {
  private _unique = false
  private _nullable = true
  private _defaultTo = null
  private _primary = false
  private readonly _columnName: string
  private readonly _columnType: string
  private readonly _lengthOrValues: number | any[]

  private referenceColumnBuilder: ReferenceColumnBuilder

  toJSON() {
    const column: any = {
      unique: this._unique,
      primary: this._primary,
      nullable: this._nullable,
      defaultTo: this._defaultTo,
      columnName: this._columnName,
      columnType: this._columnType,
    }

    if (this._columnType === 'enum' && Is.Array(this._lengthOrValues)) {
      column.enumValues = this._lengthOrValues
    } else {
      column.columnLength = this._lengthOrValues
    }

    if (this.referenceColumnBuilder) {
      column.references = this.referenceColumnBuilder.toJSON()
    }

    return column
  }

  constructor(
    columnName: string,
    columnType: string,
    lengthOrValues?: number | any[],
  ) {
    this._columnName = columnName
    this._columnType = columnType
    this._lengthOrValues = lengthOrValues
  }

  unique(): this {
    this._unique = true

    return this
  }

  nullable(): this {
    this._nullable = true

    return this
  }

  defaultTo(defaultValue: any): this {
    this._defaultTo = defaultValue

    return this
  }

  references(columName: string): ReferenceColumnBuilder {
    this.referenceColumnBuilder = new ReferenceColumnBuilder(columName)

    return this.referenceColumnBuilder
  }

  notNullable(): this {
    this._nullable = false

    return this
  }

  primary(): this {
    this._primary = true

    return this
  }
}
