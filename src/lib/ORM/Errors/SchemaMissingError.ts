export class SchemaMissingError extends Error {
  constructor (fieldName: string) {
    super(`No Schema definition for field "${fieldName}"`)

    this.name = 'SchemaMissingError'
  }
}
