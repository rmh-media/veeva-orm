import IAdapter from './Adapters/IAdapter'
import OnlineAdapter from './Adapters/OnlineAdapter'
import OfflineAdapter from './Adapters/OfflineAdapter'
import MockAdapter from './Adapters/MockAdapter'

export default class Manager {
  private _adapter: IAdapter
  private static instance: Manager

  private static isOnline (): boolean {
    return /(cdnhtml|cloudfront.net)/gi.test(window.location.hostname)
  }

  private static isLocalhost (): boolean {
    return ['localhost', '0.0.0.0', '127.0.0.1'].includes(window.location.hostname)
  }

  private static createDefaultAdapter (): IAdapter {
    if (Manager.isLocalhost()) {
      console.warn('Running on Localhost, using Mock Adapter')
      return new MockAdapter()
    }

    return Manager.isOnline()
      ? new OnlineAdapter()
      : new OfflineAdapter()
  }

  public static getInstance (): Manager {
    if (!Manager.instance) {
      Manager.instance = new Manager()
    }

    return Manager.instance
  }

  private constructor () {
    this._adapter = Manager.createDefaultAdapter()
  }

  get adapter (): IAdapter {
    return this._adapter
  }

  public use (adapter: IAdapter): this {
    this._adapter = adapter

    return this
  }
}
