class NotFoundError extends Error {
  public result: any = null

  constructor (object: string) {
    super(`No result for '${object}' Object`)
    this.name = 'NotFoundError'
  }
}
