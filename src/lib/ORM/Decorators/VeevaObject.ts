import 'reflect-metadata';
import { VeevaObjectFieldMissingError } from '../Errors/VeevaObjectFieldMissingError';
import { VeevaObjectMissingError } from '../Errors/VeevaObjectMissingError';
import { Model, ModelConstructor } from '../Model';
import { Repository } from '../Repository';

import { VEEVA_PROPERTY_METADATA_KEY } from './VeevaObjectField';

export const VEEVA_OBJECT_METADATA_KEY = 'veevaObject';

/**
 * Model Class Decorator
 * Creates Repository and Schema of model and matches it to CRM objects and properties
 *
 * @param {string} objectName
 */
export const VeevaObject = <T extends Model>(objectName: string) => {
  return (target: ModelConstructor<T>) => {
    const props = Reflect.getOwnMetadata(VEEVA_PROPERTY_METADATA_KEY, target);

    if (!objectName) {
      throw new VeevaObjectMissingError(target.name);
    }

    if (!props || props.length === 0) {
      throw new VeevaObjectFieldMissingError(target.name);
    }

    target.prototype._repository = new Repository<T>(target);
    target.prototype._repository._schema.setObject(objectName);

    props.forEach((prop) => {
      target.prototype._repository._schema.addField(prop.prop, {
        primary: prop.primary,
        name: prop.crmName,
      });
    });
  };
};

export default VeevaObject;
