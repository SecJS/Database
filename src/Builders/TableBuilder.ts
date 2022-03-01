/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ColumnBuilder } from './ColumnBuilder'

export class TableBuilder {
  private columns: ColumnBuilder[] = []

  toJSON() {
    return this.columns.map(column => column.toJSON())
  }

  enum(columnName: string, values: any[]): ColumnBuilder {
    const column = new ColumnBuilder(columnName, this.enum.name, values)

    this.columns.push(column)

    return column
  }

  date(columnName: string): ColumnBuilder {
    const column = new ColumnBuilder(columnName, this.date.name)

    this.columns.push(column)

    return column
  }

  string(columnName: string, length = 255): ColumnBuilder {
    const column = new ColumnBuilder(columnName, this.string.name, length)

    this.columns.push(column)

    return column
  }

  integer(columnName: string, length = 255): ColumnBuilder {
    const column = new ColumnBuilder(columnName, this.integer.name, length)

    this.columns.push(column)

    return column
  }

  boolean(columnName: string): ColumnBuilder {
    const column = new ColumnBuilder(columnName, this.boolean.name)

    this.columns.push(column)

    return column
  }

  increments(columnName: string): ColumnBuilder {
    const column = new ColumnBuilder(columnName, this.increments.name)

    this.columns.push(column)

    return column
  }
}
