import BaseQuery from './BaseQuery'

export enum Operator {
  EQUALS = '=',
  IN = 'IN',
  LIKE = 'LIKE',
}

export default class QueryWithWhereClause extends BaseQuery {
  constructor () {
    super()

    // default group
    this._adapterQuery.where = [[]]
  }

  public where (field: string, value: unknown): this {
    this._adapterQuery.where[0].push({
      field,
      operator: Operator.EQUALS,
      value
    })

    return this
  }

  public whereIn (field: string, list: Array<unknown>): this {
    this._adapterQuery.where[0].push({
      field,
      operator: Operator.IN,
      value: list
    })

    return this
  }

  public whereLike (field: string, value: string): this {
    this._adapterQuery.where[0].push({
      field,
      operator: Operator.LIKE,
      value
    })

    return this
  }

  public orWhere (fn: (clause: QueryWithWhereClause) => void): this {
    const q = new QueryWithWhereClause()

    fn(q)

    this._adapterQuery.where = this._adapterQuery
      .where
      .concat(this._adapterQuery.where)

    return this
  }
}
