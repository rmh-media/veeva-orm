import { Model } from './Model'
import { FieldType, Schema } from './Schema'

export class AccountModel extends Model {
  static $schema = new Schema({
    id: {
      type: FieldType.TEXT,
      name: 'Id'
    },
    first: {
      type: FieldType.TEXT,
      name: 'FirstName'
    },
    last: {
      type: FieldType.TEXT,
      name: 'LastName'
    }
  })


}
