import { SchemaMissingError } from '../Errors/SchemaMissingError';
import { Model } from '../Model';

const VeevaObjectField = function (crmName: string, primary = false) {
  return (target: Model, prop: string) => {
    const modelConstructor = target.constructor as typeof Model;

    if (!modelConstructor._repository) {
      throw new SchemaMissingError(modelConstructor.name);
    }

    modelConstructor._repository._schema.addField(prop, {
      primary,
      name: crmName,
    });
  };
};

export default VeevaObjectField;
