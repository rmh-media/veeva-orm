/**
 * Custom Error when no fields in a model where decorated as VeevaObjectField
 */
export class VeevaObjectFieldMissingError extends Error {
  constructor(className: string) {
    super(
      `Cannot find any property decorated as VeevaObjectField in ${className}`
    );

    this.name = 'SchemaMissingError';
  }
}
