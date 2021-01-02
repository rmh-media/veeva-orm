class DeferredIdNotSetError extends Error {
  constructor () {
    super('Property deferredId not found on message')

    this.name = 'DeferredIdNotSetError'
  }
}
