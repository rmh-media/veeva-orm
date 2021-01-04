import SelectQuery from './SelectQuery'
import { InsertValues } from '../Adapters/AdapterQuery'
import InsertQuery from './InsertQuery'
import DeleteQuery from './DeleteQuery'


export default class Query {

  /**
   * Creates a new Select Query
   *
   * @param fields - API Names of the fields to select
   */
  static select (...fields: Array<string>): SelectQuery {
    return new SelectQuery(fields)
  }

  static insert (data: InsertValues): InsertQuery {
    return new InsertQuery(data)
  }

  static deleteFrom (object: string): DeleteQuery {
    return new DeleteQuery(object)
  }
}
