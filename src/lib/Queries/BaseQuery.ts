import {
  AdapterQuery,
  QueryType,
  SortDirection
} from '../Adapters/AdapterQuery'
import AdapterResult from '../Adapters/AdapterResult'
import Manager from '../Manager'

export default class BaseQuery {

  protected readonly _adapterQuery: AdapterQuery = {
    type: QueryType.SELECT,
    object: '',
    fields: [],
    values: new Map<string, string>(),
    where: [],
    limit: null,
    sort: new Map<string, SortDirection>()
  }

  get adapterQuery (): AdapterQuery {
    return this._adapterQuery
  }

  public async exec (): Promise<AdapterResult> {
    return Manager
      .getInstance()
      .adapter
      .runQuery(this._adapterQuery)
  }
}
