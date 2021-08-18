import { Model, ModelConstructor } from '../Model';
import { Repository } from '../Repository';

const VeevaObject = function <T extends Model>(objectName: string) {
  return (target: ModelConstructor<T>) => {
    target._repository = new Repository<T>(target);
    target._repository._schema.setObject(objectName);
  };
};

export default VeevaObject;
