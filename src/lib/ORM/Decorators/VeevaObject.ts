import { SchemaMissingError } from '../Errors/SchemaMissingError'
import { Model } from '../Model'

const VeevaObject = function (objectName: string) {
  return (target: typeof Model) => {
    if (!target._schema) {
      throw new SchemaMissingError(target.name)
    }

    target._schema.setObject(objectName)
  }
}

export default VeevaObject
