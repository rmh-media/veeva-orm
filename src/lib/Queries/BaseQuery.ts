import AdapterQuery, { QueryType } from '../Adapters/AdapterQuery'
import AdapterResult from '../Adapters/AdapterResult'
import Manager from '../Manager'

export default class BaseQuery {
  protected readonly _adapterQuery: AdapterQuery = {
    type: QueryType.SELECT,
    object: null,
    fields: [],
    values: null,
    where: []
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
