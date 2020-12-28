import IAdapter from './Adapters/IAdapter'

export default class Manager {
  private readonly _adapter: IAdapter
  private static instance: Manager

  private constructor (adapter: IAdapter) {
    this._adapter = adapter
  }

  get adapter (): IAdapter {
    return this._adapter
  }

  public static getInstance (): Manager {
    if (!Manager.instance) {
      throw new Error('The default Manager was not initialized. Did you call `init` before?')
    }

    return Manager.instance
  }

  public init (adapter: IAdapter) {
    if (!Manager.instance) {
      Manager.instance = new Manager(adapter)

      return Manager.instance
    }

    return new Manager(adapter)
  }
}
