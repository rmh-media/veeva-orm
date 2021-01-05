export class KeyFieldMissingError extends Error {
  constructor () {
    super(`Schema does not contain a primary field`)

    this.name = 'KeyFieldMissingError'
  }
}
