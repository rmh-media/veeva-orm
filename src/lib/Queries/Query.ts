import DeleteQuery from './DeleteQuery';
import InsertQuery, { InsertValues } from './InsertQuery';
import SelectQuery from './SelectQuery';
import UpdateQuery from './UpdateQuery';

export default class Query {
  /**
   * Creates a new Select Query
   *
   * @param fields - API Names of the fields to select
   */
  static select(...fields: Array<string>): SelectQuery {
    return new SelectQuery(fields);
  }

  static insert(data: InsertValues): InsertQuery {
    return new InsertQuery(data);
  }

  static deleteFrom(object: string): DeleteQuery {
    return new DeleteQuery(object);
  }

  static update(object: string): UpdateQuery {
    return new UpdateQuery(object);
  }

  static updateCurrent(object: string): UpdateQuery {
    return this.update(object).current(true);
  }
}
