import IAdapter from './IAdapter'
import AdapterQuery, { QueryType, Term } from './AdapterQuery'
import AdapterResult from './AdapterResult'

/**
 * Some Objects don't use the default API names here – not sure why so this
 * list might not be complete but it is enough so far :D
 */
const CURRENT_CALL_ALIASES = {
  Clm_Presentation_vod__c: 'Presentation',
  Key_Message_vod__c: 'KeyMessage',
  Call_Objective_vod__c: 'CallObjective',
  ChildAccount_TSF_vod__c: 'TSF',
  Address_vod__c: 'Address',
  Call2_vod__c: 'Call'
}

export default class ClmAdapter implements IAdapter {
  async runQuery (query: AdapterQuery): Promise<AdapterResult> {
    switch (query.type) {
      case QueryType.SELECT:
        return this.buildSelectDefaultCommand(query)
      default:
        throw new Error('Adapter does not support the given Query')
    }
  }

  static buildWhereClause (termGroups: Array<Array<Term>>): string {
    return termGroups
      .map((terms) => {
        return terms.map(ClmAdapter.buildWhereTerm).join(' AND ')
      })
      .join(' OR ')
  }

  static buildWhereTerm (t: Term): string {
    if (t.operator.toUpperCase() === 'IN') {
      const stringifiedValues = (t.value as Array<any>)
        .map(v => {
          return JSON.stringify(v)
        })

      return '{' + stringifiedValues +'}'
    }

    return JSON.stringify(t.value)
  }

  /**
   * Builds a Select command for non "current" queries
   */
  async buildSelectDefaultCommand (q: AdapterQuery): Promise<AdapterResult> {
    const cmd = [
      `queryObject(${q.object})`,
      `fields(${q.fields.join(',')})`
    ]

    const where = ClmAdapter.buildWhereClause(q.where)

    if (where) {
      cmd.push(`where(${where})`)
    }

    // sort, limit todo

    return cmd
  }
}
