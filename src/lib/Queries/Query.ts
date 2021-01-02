import SelectQuery from './SelectQuery'

export default class Query {

  /**
   * Creates a new Select Query
   *
   * @param fields - API Names of the fields to select
   */
  static select (...fields: Array<string>): SelectQuery {
    return new SelectQuery(fields)
  }
}
