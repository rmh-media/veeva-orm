import { QueryType } from '../Adapters/AdapterQuery';

import QueryWithWhereClause from './QueryWithWhereClause';

/**
 * Represents a Select query which can be used to get data for
 * current call objects or default/custom object data.
 */
export default class DeleteQuery extends QueryWithWhereClause {
  constructor(object: string) {
    super();
    this._adapterQuery.object = object;
    this._adapterQuery.type = QueryType.DELETE;
  }
}
