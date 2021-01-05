import { Operator } from '../Queries/QueryWithWhereClause'

import { AdapterQuery, QueryType } from './AdapterQuery'
import AdapterResult from './AdapterResult'
import { DeferredIdNotSetError } from './Errors/DeferredIdNotSetError'
import { DeferredNotFoundError } from './Errors/DeferredNotFoundError'
import { MissingPropertyError } from './Errors/MissingPropertyError'
import { UnexpectedResultError } from './Errors/UnexpectedResultError'
import IAdapter from './IAdapter'
import { createCallbackId } from './utils/adapterUtils'
import { buildSortClause, buildWhereClause } from './utils/sqlHelper'

interface RunningQuery {
  object: string,

  resolve (result: AdapterResult): void

  reject (err: Error): void
}

export default class OnlineAdapter implements IAdapter {

  private readonly _queries = new Map<string, RunningQuery>()

  constructor () {
    window.addEventListener('message', this.onMessage)
  }

  public runQuery (query: AdapterQuery): Promise<AdapterResult> {
    if (query.type === QueryType.SELECT) {
      return this.runSelectCommand(query)
    } else if (query.type === QueryType.SELECT_CURRENT) {
      return this.runSelectCurrentCommand(query)
    }

    return Promise.reject(new Error('Query Type not supported'))
  }

  private onMessage (msg: MessageEvent) {
    const data = typeof msg.data === 'string'
      ? JSON.parse(msg.data)
      : msg.data

    if (!data.deferredId) {
      throw new DeferredIdNotSetError()
    }

    const d = this._queries.get(data.deferredId)

    if (d === undefined) {
      throw new DeferredNotFoundError()
    }

    if (data.command !== 'queryReturn') {
      return d.reject(new UnexpectedResultError(data))
    }

    if (!Object.hasOwnProperty.call(data, d.object)) {
      return d.reject(new MissingPropertyError(d.object, data))
    }

    return d.resolve({
      success: true,
      objects: data[d.object]
    })
  }

  private sendMessage (message: any): Promise<AdapterResult> {
    // create a new command
    message.deferredId = createCallbackId()

    const promise = new Promise<AdapterResult>((resolve, reject) => {
      this._queries.set(message._callbackId, {
        object: message.object,
        resolve,
        reject
      })

      window.parent.postMessage(message, '*')
    })

    promise.finally(() => {
      this._queries.delete(message.deferredId)
    })

    return promise
  }

  private async runSelectCommand (query: AdapterQuery): Promise<AdapterResult> {
    const message: any = {
      command: 'queryObject',
      fields: query.fields,
      object: query.object
    }

    const clause = buildWhereClause(query.where)

    if (clause.length) {
      message.where = clause
    }

    if (query.sort.size) {
      message.sort = buildSortClause(query.sort)
    }

    if (query.limit) {
      message.limit = query.limit
    }

    return this.sendMessage(message)
  }

  private async runSelectCurrentCommand (query: AdapterQuery): Promise<AdapterResult> {
    const data = await this.sendMessage({
      command: 'getDataForObjectV2',
      fields: ['Id'],
      object: query.object
    })

    if (data.objects.length !== 1) {
      return Promise.resolve({
        success: true,
        objects: []
      })
    }

    // clone the original query
    const clonedQuery: AdapterQuery = JSON.parse(JSON.stringify(query))

    clonedQuery.where = [[{
      operator: Operator.EQUALS,
      field: 'Id',
      value: data.objects[0].Id
    }]]

    return this.runSelectCommand(clonedQuery)
  }
}
