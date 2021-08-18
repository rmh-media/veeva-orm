import { Operator } from '../Queries/QueryWithWhereClause';

import { AdapterQuery, QueryType } from './AdapterQuery';
import AdapterResult from './AdapterResult';
import IAdapter from './IAdapter';
import { createCallbackId } from './utils/adapterUtils';
import { buildSortClause, buildWhereClause } from './utils/sqlHelper';

/**
 * If we want to get the ID of an object for the current call, Veeva does not
 * use API names for it – so here is a (probably unfinished) mapping for it
 */
const CURRENT_CALL_ALIASES = {
  Clm_Presentation_vod__c: 'Presentation',
  Key_Message_vod__c: 'KeyMessage',
  Call_Objective_vod__c: 'CallObjective',
  ChildAccount_TSF_vod__c: 'TSF',
  Address_vod__c: 'Address',
  Call2_vod__c: 'Call',
};

/**
 * Getting the command name
 */
const REGEX_CMD_NAME = /^[a-zA-Z0-9]+/;

/**
 * Some methods require to add "callback(THE_CALLBACK_NAME)" to the command chain
 * others require to use "THE_CALLBACK(result)" instead. This is a list of commands
 * which require the second option to work properly
 */
const COMMANDS_WITH_NAMED_CALLBACK_CALL = ['getDataForObjectV2', 'queryObject'];

export default class OfflineAdapter implements IAdapter {
  /**
   * Stores references to currently pending timeout timers which we have
   * to cancel if necessary
   *
   * @private
   */
  private _timeouts = new Map<string, number>();

  /**
   * The timeout in milliseconds
   *
   * @private
   */
  private readonly _timeout: number;

  /**
   * Creates a new Veeva Adapter Instance
   *
   * @param timeout
   */
  constructor(timeout = 500) {
    this._timeout = timeout;
  }

  /**
   * Format an incoming veeva response and check if its valid
   *
   * @param input – the input the callback has received
   * @param objectName – the object name which we are currently working on
   */
  private static formatResponse(input: any, objectName: string): AdapterResult {
    if (!input) {
      throw new Error('Received faulty Veeva Response');
    }

    if (typeof input === 'string') {
      input = JSON.parse(input);
    }

    if (
      Object.hasOwnProperty.call(input, 'success') &&
      input.success === false
    ) {
      throw new Error(
        'Veeva answered with unsuccessful state: ' + input.message
      );
    }

    if (Object.hasOwnProperty.call(input, objectName)) {
      return input[objectName];
    }

    return input;
  }

  /**
   * Checks if the commands requires the callback to be added
   * as a named parameter or not.
   *
   * @param cmd
   * @private
   */
  private static shouldAppendNamedCallback(cmd: string[]): boolean {
    const cmdName = REGEX_CMD_NAME.exec(cmd[0]);

    return cmdName
      ? COMMANDS_WITH_NAMED_CALLBACK_CALL.includes(cmdName[0])
      : false;
  }

  /**
   * @inheritDoc
   */
  public async runQuery(query: AdapterQuery): Promise<AdapterResult> {
    if (query.type === QueryType.SELECT) {
      return this.runSelectCommand(query);
    } else if (query.type === QueryType.SELECT_CURRENT) {
      return this.runSelectCurrentCommand(query);
    }

    return Promise.reject(new Error('Query Type not supported'));
  }

  private createCallback(resolve: any, reject: any, objectName: string) {
    const name = createCallbackId();

    // this is what veeva will call
    window[name] = (response: any) => {
      this.clearCallback(name);

      try {
        resolve(OfflineAdapter.formatResponse(response, objectName));
      } catch (err) {
        reject(err);
      }
    };

    // create the timeout
    this._timeouts.set(
      name,
      window.setTimeout(function () {
        if (!Object.hasOwnProperty.call(window, name)) {
          // the callback has already been used
          // usually this means that veeva has answered the request properly
          // and the timeout was not canceled as expected (most likely a timing issue)
          return;
        }

        // rejecting the promise here
        window[name]({
          success: false,
          message: `Timeout for ${name} reached.`,
        });
      }, this._timeout)
    );

    return name;
  }

  private async sendCommand(
    command: string[],
    objectName: string
  ): Promise<AdapterResult> {
    return new Promise((resolve, reject) => {
      const callbackId = this.createCallback(resolve, reject, objectName);

      if (OfflineAdapter.shouldAppendNamedCallback(command)) {
        // adding the specific callback as a string here
        command.push(callbackId + '(result)');
      } else {
        // generic callback "callback" variable
        command.push('callback(' + callbackId + ')');
      }

      // normal "web request" in an iframe
      const iframe = document.createElement('IFRAME');
      iframe.setAttribute('data-callback-id', callbackId);
      iframe.setAttribute('src', 'veeva:' + command.join(','));

      document.documentElement.appendChild(iframe);
    });
  }

  private async runSelectCommand(query: AdapterQuery): Promise<AdapterResult> {
    const cmd = [
      `queryObject(${query.object})`,
      `fields(${query.fields.join(',')})`,
    ];

    const whereClause = buildWhereClause(query.where);

    if (whereClause.length) {
      cmd.push(`where(${whereClause})`);
    }

    if (query.sort.size) {
      cmd.push(`sort(${buildSortClause(query.sort)})`);
    }

    if (query.limit) {
      cmd.push(`limit(${query.limit})`);
    }

    return this.sendCommand(cmd, query.object);
  }

  private async runSelectCurrentCommand(
    query: AdapterQuery
  ): Promise<AdapterResult> {
    const objectName = Object.hasOwnProperty.call(
      CURRENT_CALL_ALIASES,
      query.object
    )
      ? CURRENT_CALL_ALIASES[query.object]
      : query.object;

    const command = ['getDataForObjectV2(' + objectName + ')', 'fieldName(Id)'];

    const result = await this.sendCommand(command, objectName);

    if (result.objects.length !== 1) {
      return Promise.resolve({
        success: true,
        objects: [],
      });
    }

    // clone the original query
    const clonedQuery: AdapterQuery = JSON.parse(JSON.stringify(query));

    // set up the new where clause
    clonedQuery.where = [
      [
        {
          operator: Operator.EQUALS,
          field: 'Id',
          value: result.objects[0].Id,
        },
      ],
    ];

    return this.runSelectCommand(clonedQuery);
  }

  private clearCallback(callbackId: string): void {
    const timeout = this._timeouts.get(callbackId);

    if (!timeout) {
      // nothing to do, lets stop it here
      return;
    }

    const iframe = <HTMLIFrameElement>(
      window.document.querySelector(
        'iframe[data-callback-id="' + callbackId + '"]'
      )
    );

    // try stopping the iframe load before we clear it
    if (
      iframe &&
      iframe.contentDocument &&
      'execCommand' in iframe.contentDocument
    ) {
      iframe.contentDocument.execCommand('stop');
    }

    if (iframe && 'stop' in iframe) {
      (iframe as any).stop();
    }

    if (iframe && iframe.parentElement) {
      iframe.parentElement.removeChild(iframe);
    }

    // delete the callback
    delete window[callbackId];

    // clearing the timeout
    window.clearTimeout(timeout);
    this._timeouts.delete(callbackId);
  }
}
