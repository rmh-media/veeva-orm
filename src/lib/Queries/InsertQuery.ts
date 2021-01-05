import { QueryType } from '../Adapters/AdapterQuery'

import BaseQuery from './BaseQuery'

export interface InsertValues {
  [key: string]: number | string | boolean
}

/**
 * Represents a Select query which can be used to get data for
 * current call objects or default/custom object data.
 */
export default class InsertQuery extends BaseQuery {
  constructor (data: InsertValues) {
    super();

    this._adapterQuery.type = QueryType.INSERT

    Object.keys(data).forEach(key => {
      this._adapterQuery.values.set(key, data[key])
    })
  }

  into (object: string): this {
    this._adapterQuery.object = object

    return this
  }
}
