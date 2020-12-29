import { AdapterQuery, QueryType, SortDirection, Term } from './AdapterQuery'

/**
 * Some Objects don't use the default API names here – not sure why so this
 * list might not be complete but it is enough so far :D
 */
// const CURRENT_CALL_ALIASES = {
//   Clm_Presentation_vod__c: 'Presentation',
//   Key_Message_vod__c: 'KeyMessage',
//   Call_Objective_vod__c: 'CallObjective',
//   ChildAccount_TSF_vod__c: 'TSF',
//   Address_vod__c: 'Address',
//   Call2_vod__c: 'Call'
// }

function formatBooleanValue (v: boolean): string {
  return v ? 'true' : 'false'
}

function formatValue (value: any): string {
  if (typeof value === 'boolean') {
    return formatBooleanValue(value as boolean)
  }

  if (typeof value === 'number') {
    return value + ''
  }

  return `'${value}'`
}

function buildWhereTerm (t: Term): string {
  if (t.operator.toUpperCase() === 'IN') {
    const stringifiedValues = (t.value as Array<any>)
      .map(v => {
        return JSON.stringify(formatValue(v))
      })
      .join(',')

    return `${t.field} IN '{ ${stringifiedValues} }'`
  }

  return `${t.field} ${t.operator} ${formatValue(t.value)}`
}

export function buildWhereClause (termGroups: Array<Array<Term>>): string {
  const clause = termGroups
    .map((terms) => {
      return `(${terms.map(buildWhereTerm).join(' AND ')})`
    })
    .join(' OR ')

  return clause.length
    ? 'WHERE ' + clause
    : ''
}

export function buildSortClause (sort: Map<string, SortDirection>) {
  const items: string[] = []

  for (const [key, value] of sort) {
    items.push(`${key} ${value}`)
  }

  return items
}

function buildSelectCommand (q: AdapterQuery): Array<string> {
  const cmd = [
    `queryObject(${q.object})`,
    `fields(${q.fields.join(',')})`
  ]

  if (q.where.length) {
    cmd.push(`where(${buildWhereClause(q.where)})`)
  }


  if (q.sort.size) {
    cmd.push(`sort(${buildSortClause(q.sort)})`)
  }

  if (q.limit) {
    cmd.push(`limit(${q.limit})`)
  }

  return cmd
}

export function buildCommand (query: AdapterQuery): Array<string> {
  switch (query.type) {
    case QueryType.SELECT:
      return buildSelectCommand(query)
    default:
      throw new Error('Adapter does not support the given Query')
  }
}
