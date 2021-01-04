import { QueryType, SortDirection } from '../Adapters/AdapterQuery'
import AdapterResult from '../Adapters/AdapterResult'

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
  current (shouldUseCurrentCallData = true): SelectQuery {
    if (shouldUseCurrentCallData) {
      this._adapterQuery.type = QueryType.SELECT_CURRENT
    } else {
      this._adapterQuery.type = QueryType.SELECT
    }

    return this
  }

  from (object: string): SelectQuery {
    this._adapterQuery.object = object

    return this
  }

  orderBy (field: string, direction: SortDirection = SortDirection.ASC): this {
    this._adapterQuery.sort.set(field, direction)

    return this
  }

  firstOrFail (): Promise<AdapterResult> {
    return this.exec()
      .then(result => {
        if (result.objects.length < 1) {
          throw new NotFoundError(this._adapterQuery.object)
        }

        return result.objects[0]
      })
  }

  limit (limit: number): this {
    this._adapterQuery.limit = limit

    return this
  }

  async count (): Promise<number> {
    const items = await this.exec()

    return items.objects.length
  }
}
