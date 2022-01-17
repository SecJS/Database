/**
 * @secjs/database
 *
 * (c) João Lenon <lenon@secjs.com.br>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
import { LinksContract } from './LinksContract'

export interface PaginationContract {
  itemCount: number
  totalItems: number
  totalPages: number
  currentPage: number
  itemsPerPage: number
  links: LinksContract
  data: any | any[]
}
