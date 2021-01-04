import BaseQuery from './BaseQuery'
import { InsertValues, QueryType } from '../Adapters/AdapterQuery'



/**
 * Represents a Select query which can be used to get data for
 * current call objects or default/custom object data.
 */
export default class InsertQuery extends BaseQuery {
  constructor (data: InsertValues) {
    super();

    this._adapterQuery.type = QueryType.INSERT
    this._adapterQuery.values = data
  }

  into (object: string): this {
    this._adapterQuery.object = object

    return this
  }
}
