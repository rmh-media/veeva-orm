import {
  AdapterQuery,
  QueryType,
  SortDirection
} from '../Adapters/AdapterQuery'
import AdapterResult from '../Adapters/AdapterResult'
import Manager from '../Manager'
import IAdapter from '../Adapters/IAdapter'

interface Preprocessor {
  (query: BaseQuery): Promise<BaseQuery>
}

interface Postprocessor {
  (result: AdapterResult): Promise<AdapterResult>
}

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

  private _preProcessors: Preprocessor[] = []
  private _postProcessors: Postprocessor[] = []

  get adapterQuery (): AdapterQuery {
    return this._adapterQuery
  }

  /**
   * Adds a new callback which will be executed once the query
   * finished its process
   *
   * @param callbackFn - Callback function
   */
  addPostProcessor (callbackFn: Postprocessor): this {
    this._postProcessors.push(callbackFn)

    return this
  }

  /**
   * Adds a new callback which will be executed before the query
   * executed its CRM action
   *
   * @param callbackFn - Callback function
   */
  addPreProcessor (callbackFn: Preprocessor): this {
    this._preProcessors.push(callbackFn)

    return this
  }

  public async exec (adapter: IAdapter | null = null): Promise<AdapterResult> {
    if (!adapter) {
      adapter = Manager.getInstance().adapter
    }

    // initialize our first promise
    let currentPromise = this._preProcessors.length === 0
      ? Promise.resolve(this)
      : this._preProcessors[0](this)

    // run the "other" pre-processors
    for (let i = 1; i < this._preProcessors.length; i++) {
      this._preProcessors.slice(1).forEach(processor => {
        currentPromise = currentPromise.then(processor)
      })
    }

    // execute the query against the adapter
    let resultingPromise = currentPromise.then(query => {
      return adapter!.runQuery(query.adapterQuery)
    })

    // run all post-processors
    this._postProcessors.forEach(function (processor) {
      resultingPromise = resultingPromise.then(processor)
    })

    return resultingPromise
  }
}
