class DeferredNotFoundError extends Error {
  constructor () {
    super('Deferred not found in store')

    this.name = 'DeferredNotFoundError'
  }
}
