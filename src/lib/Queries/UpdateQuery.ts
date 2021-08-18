import { QueryType } from '../Adapters/AdapterQuery';

import QueryWithWhereClause from './QueryWithWhereClause';

export default class UpdateQuery extends QueryWithWhereClause {
  constructor(object: string) {
    super();
    this._adapterQuery.type = QueryType.UPDATE;
    this._adapterQuery.object = object;
  }

  /**
   * Enable or disable usage of current call data.
   *
   * @param shouldUseCurrentCallData
   */
  current(shouldUseCurrentCallData = true): this {
    if (shouldUseCurrentCallData) {
      this._adapterQuery.type = QueryType.UPDATE_CURRENT;
    } else {
      this._adapterQuery.type = QueryType.UPDATE;
    }

    return this;
  }

  set(field: string, value: string | number | boolean): this {
    this._adapterQuery.values.set(field, value);
    return this;
  }
}
