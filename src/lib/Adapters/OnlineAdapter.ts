import IAdapter from './IAdapter'
import AdapterResult from './AdapterResult'
import { AdapterQuery, QueryType } from './AdapterQuery'
import { buildWhereClause } from './commandBuilder'

export class OnlineAdapter implements IAdapter {
  fetchFields (object: string): Promise<string[]> {
    return Promise.resolve([]);
  }

  runQuery (query: AdapterQuery): Promise<AdapterResult> {
    const cmd = OnlineAdapter.buildCommand(query)
    console.log(cmd)

    return Promise.resolve({ success: false })
  }

  private static buildCommand (query: AdapterQuery): any {
    if (query.type === QueryType.SELECT) {
      return OnlineAdapter.buildSelectCommand(query)
    }
  }

  private static buildSelectCommand (query: AdapterQuery): any {
    const o: any = {
      command: 'queryObject',
      fields: query.fields,
      object: query.object
    }

    if (query.where.length) {
      o.where = buildWhereClause(query.where)
    }

    return o
  }
}
