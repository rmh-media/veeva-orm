import 'reflect-metadata';
import { Model } from '../Model';

export const VEEVA_PROPERTY_METADATA_KEY = 'veevaProperties';

export const VeevaObjectField = (crmName: string, primary = false) => {
  return (target: Model, prop: string) => {
    const props =
      Reflect.getOwnMetadata(VEEVA_PROPERTY_METADATA_KEY, target.constructor) ||
      [];

    Reflect.defineMetadata(
      'veevaProperties',
      [...props, { prop, primary, crmName }],
      target.constructor
    );
  };
};

export default VeevaObjectField;
