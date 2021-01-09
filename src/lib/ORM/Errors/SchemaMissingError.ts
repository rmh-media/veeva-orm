export class SchemaMissingError extends Error {
  constructor (className: string) {
    super(`Cannot find property _schema in Model ${className}, did you forget to extend from Model?`)

    this.name = 'SchemaMissingError'
  }
}
