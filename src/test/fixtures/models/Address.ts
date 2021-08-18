import VeevaObject from '../../../lib/ORM/Decorators/VeevaObject';
import VeevaObjectField from '../../../lib/ORM/Decorators/VeevaObjectField';
import { Model } from '../../../lib/ORM/Model';

@VeevaObject('Address_vod__c')
export default class Address extends Model {
  @VeevaObjectField('Id', true)
  id: string | undefined;

  @VeevaObjectField('Account_vod__c')
  accountId: string | undefined;

  @VeevaObjectField('Name')
  name: string | undefined;

  @VeevaObjectField('City_vod__c')
  city: string | undefined;

  @VeevaObjectField('Zip_vod__c')
  zipCode: string | undefined;

  // static allForAccount (account: Account): Promise<Address[]> {
  //   // how to get the repository
  // }
}
