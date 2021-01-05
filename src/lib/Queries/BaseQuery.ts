import {
  AdapterQuery,
  QueryType,
  SortDirection
} from '../Adapters/AdapterQuery'
import AdapterResult from '../Adapters/AdapterResult'
import Manager from '../Manager'
import IAdapter from '../Adapters/IAdapter'

export default class BaseQuery {

  protected readonly _adapterQuery: AdapterQuery = {
    type: QueryType.SELECT,
    object: '',
    fields: [],
    values: new Map<string, string | number | boolean>(),
    where: [],
    limit: null,
    sort: new Map<string, SortDirection>()
  }

  get adapterQuery (): AdapterQuery {
    return this._adapterQuery
  }

  public async exec (adapter: IAdapter | null = null): Promise<AdapterResult> {
    if (!adapter) {
      adapter = Manager.getInstance().adapter
    }

    return adapter.runQuery(this._adapterQuery)
  }
}
