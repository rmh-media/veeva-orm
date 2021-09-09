/**
 * Custom Error when no fields in a model where decorated as VeevaObjectField
 */
export class VeevaObjectMissingError extends Error {
  constructor(className: string) {
    super(`Could not find definition of Veeva object in Model ${className}`);

    this.name = 'SchemaMissingError';
  }
}
