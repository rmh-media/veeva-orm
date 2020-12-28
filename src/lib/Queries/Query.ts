import SelectQuery from './SelectQuery'

export default class Query {
  static select (...fields: Array<string>): SelectQuery {
    return new SelectQuery(fields)
  }
}
