import AdapterQuery from './AdapterQuery'
import AdapterResult from './AdapterResult'
import IAdapter from './IAdapter'
import { buildCommand } from './commandBuilder'
import { isOnline } from './veevaUtils'

/**
 * Getting the command name
 */
const REGEX_CMD_NAME = /^[a-zA-Z0-9]+/

/**
 * Some methods require to add "callback(THE_CALLBACK_NAME)" to the command chain
 * others require to use "THE_CALLBACK(result)" instead. This is a list of commands
 * which require the second option to work properly
 */
const COMMANDS_WITH_NAMED_CALLBACK_CALL = [
  'getDataForObjectV2',
  'queryObject'
]

export default class VeevaAdapter implements IAdapter {

  /**
   * Stores references to currently pending timeout timers which we have
   * to cancel if necessary
   *
   * @private
   */
  private _timeouts: { [key: string]: number } = {}

  /**
   * The timeout in milliseconds
   * @private
   */
  private readonly _timeout: number

  /**
   * Creates a new Veeva Adapter Instance
   *
   * @param timeout
   */
  constructor (timeout = 500) {
    this._timeout = timeout

    window.addEventListener('message', this.onMessage.bind(this))
  }

  private onMessage (msg: any): void {
    if (!msg) {
      return
    }

    msg = typeof msg === 'string'
      ? JSON.parse(msg)
      : msg

    const data = typeof msg.data === 'string'
      ? JSON.parse(msg.data)
      : msg.data
  }

  async fetchFields (object: string): Promise<string[]> {
    return Promise.resolve([])
  }

  /**
   * Format an incoming veeva response and check if its valid
   *
   * @param input – the input the callback has received
   * @param objectName – the object name which we are currently working on
   */
  private static formatResponse (input: any, objectName: string): AdapterResult {
    if (!input) {
      throw new Error('Received faulty Veeva Response')
    }

    if (typeof input === 'string') {
      input = JSON.parse(input)
    }

    if (Object.hasOwnProperty.call(input, 'success') && input.success === false) {
      throw new Error('Veeva answered with unsuccessful state: ' + input.message)
    }

    if (Object.hasOwnProperty.call(input, objectName)) {
      return input[objectName]
    }

    return input
  }

  private static shouldAppendNamedCallback (cmd: string[]): boolean {
    const cmdName = REGEX_CMD_NAME.exec(cmd[0])

    return cmdName
      ? COMMANDS_WITH_NAMED_CALLBACK_CALL.includes(cmdName[0])
      : false
  }

  public async runQuery (query: AdapterQuery): Promise<AdapterResult> {
    return new Promise((resolve, reject) => {

      // lets create the global callback make the request
      const callbackId = this.createCallback(resolve, reject, query.object)

      return this.makeRequest(query, callbackId)
    })
  }

  private makeRequest (query: AdapterQuery, callbackId: string): void {
    return isOnline()
      ? this.makeOnlineReqest(query, callbackId)
      : this.makeOfflineRequest(query, callbackId)
  }

  private clearCallback (callbackId: string): void {
    const iframe = <HTMLIFrameElement>window
      .document
      .querySelector('iframe[data-callback-id="' + callbackId + '"]')

    // try stopping the iframe load before we clear it
    if (iframe && iframe.contentDocument && 'execCommand' in iframe.contentDocument) {
      iframe.contentDocument.execCommand('stop')
    }

    if (iframe && ('stop' in iframe)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (iframe as any).stop()
    }

    if (iframe && iframe.parentElement) {
      iframe.parentElement.removeChild(iframe)
    }

    // deleting the callback
    delete window[callbackId]

    // clearing the timeout timeout
    window.clearTimeout(this._timeouts[callbackId])
    delete this._timeouts[callbackId]
  }

  private createCallback (resolve: any, reject: any, objectName: string) {
    const name = 'vcb_' + Date.now().valueOf() + '_' + Math.random().toString(36).substring(7)

    if (!objectName) {
      throw new Error('Could not parse command to get the objectName')
    }

    // this is what veeva will call
    window[name] = (response: any) => {
      this.clearCallback(name)

      let result: AdapterResult | null = null

      try {
        result = VeevaAdapter.formatResponse(response, objectName)
      } catch (err) {
        reject(err)
      }

      resolve(result)
    }

    // create the timeout
    this._timeouts[name] = window.setTimeout(function () {
      if (!Object.hasOwnProperty.call(window, name)) {
        // the callback has already been used
        // usually this means that veeva has answered the request properly
        // and the timeout was not canceled as expected (most likely a timing issue)
        return
      }

      // rejecting the promise here
      window[name]({
        success: false,
        message: `Timeout for ${name} reached.`
      })

    }, this._timeout)

    return name
  }

  private makeOnlineReqest (query: AdapterQuery, callbackId: string): void {
    // todo create online request stuff
    const data = {
      foo: 'bar',
      callbackId,
      fields: query.fields
    }

    window.parent.postMessage(JSON.stringify(data), '*');
  }

  private makeOfflineRequest (query: AdapterQuery, callbackId: string): void {
    // build the veeva command chain
    const command = buildCommand(query)

    if (VeevaAdapter.shouldAppendNamedCallback(command)) {
      // adding the specific callback as a string here
      command.push(callbackId + '(result)')
    } else {
      // generic callback "callback" variable
      command.push('callback(' + callbackId + ')')
    }

    // normal "web request" in an iframe
    const iframe = document.createElement('IFRAME')
    iframe.setAttribute('data-callback-id', callbackId)
    iframe.setAttribute('src', 'veeva:' + command.join(','))

    document.documentElement.appendChild(iframe)
  }
}
