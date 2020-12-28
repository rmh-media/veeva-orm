import { QueryType } from '../Adapters/AdapterQuery'

import QueryWithWhereClause from './QueryWithWhereClause'

/**
 * Represents a Select query which can be used to get data for
 * current call objects or default/custom object data.
 */
export default class SelectQuery extends QueryWithWhereClause {
  constructor (fields: Array<string>) {
    super();

    this._adapterQuery.fields = fields
  }

  /**
   * Enable or disable usage of current call data.
   *
   * @param shouldUseCurrentCallData
   */
  public current (shouldUseCurrentCallData = true): SelectQuery {
    if (shouldUseCurrentCallData) {
      this._adapterQuery.type = QueryType.SELECT_CURRENT
    } else {
      this._adapterQuery.type = QueryType.SELECT
    }

    return this
  }

  public from (object: string): SelectQuery {
    this._adapterQuery.object = object

    return this
  }
}
