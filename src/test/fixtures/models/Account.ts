import VeevaObject from '../../../lib/ORM/Decorators/VeevaObject';
import VeevaObjectField from '../../../lib/ORM/Decorators/VeevaObjectField';
import { Model } from '../../../lib/ORM/Model';
// import Address from './Address'

// function resolvesAddresses (acc: Account): Promise<any> {
//   return Address.query()
//     .where('accountId', acc.id)
//     .exec()
//     .then(res => {
//       return res.objects
//     })
// }

@VeevaObject('Account')
export default class Account extends Model {
  @VeevaObjectField('Id', true)
  id: string | undefined;

  @VeevaObjectField('Name')
  name: string | undefined;

  @VeevaObjectField('FirstName')
  first: string | undefined;

  @VeevaObjectField('LastName')
  last: string | undefined;

  fullName(): string {
    return `${this.first} ${this.last}`;
  }
}
