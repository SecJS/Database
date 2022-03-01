/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import '@secjs/env/src/utils/global'

import { TableBuilder } from '../src/Builders/TableBuilder'

describe('\n Builders Classes', () => {
  let tableBuilder: TableBuilder = null

  beforeEach(async () => {
    tableBuilder = new TableBuilder()
  })

  it('should create a new table json', () => {
    tableBuilder.string('name', 30).notNullable().unique()
    tableBuilder.integer('quantity', 20).defaultTo(0)

    expect(tableBuilder.toJSON()).toStrictEqual([
      {
        unique: true,
        primary: false,
        nullable: false,
        defaultTo: null,
        columnName: 'name',
        columnType: 'string',
        columnLength: 30,
      },
      {
        unique: false,
        primary: false,
        nullable: true,
        defaultTo: 0,
        columnName: 'quantity',
        columnType: 'integer',
        columnLength: 20,
      },
    ])
  })

  it('should create a new table json with references', () => {
    tableBuilder.string('detail').notNullable()
    tableBuilder.string('productId').references('id').inTable('products')

    expect(tableBuilder.toJSON()).toStrictEqual([
      {
        unique: false,
        primary: false,
        nullable: false,
        defaultTo: null,
        columnName: 'detail',
        columnType: 'string',
        columnLength: 255,
      },
      {
        unique: false,
        primary: false,
        nullable: true,
        defaultTo: null,
        columnName: 'productId',
        columnType: 'string',
        columnLength: 255,
        references: {
          columnName: 'id',
          defaultTo: null,
          inTable: 'products',
          nullable: true,
          unique: false,
        },
      },
    ])
  })
})
