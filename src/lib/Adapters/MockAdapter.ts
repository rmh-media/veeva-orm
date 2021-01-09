import { Operator } from '../Queries/QueryWithWhereClause'

import { AdapterQuery, QueryType, SortDirection, Term } from './AdapterQuery'
import AdapterResult from './AdapterResult'
import IAdapter from './IAdapter'

function termMatches (term: Term, item: any): boolean {
  if (!Object.hasOwnProperty.call(item, term.field)) {
    throw new Error(`Object does not have the property ${term.field}`)
  }

  const val = item[term.field]

  if (term.operator === Operator.EQUALS) {
    return val == term.value
  } else if (term.operator === Operator.LIKE) {
    return (new RegExp('.+', 'i')).test(val)
  } else if (term.operator === Operator.IN) {
    return term.value.includes(val)
  }

  return false
}

function filter (termGroups: Term[][]): (item: any) => boolean {
  return (item: any) => {
    for (let i = 0; i < termGroups.length; i++) {
      let matchesGroup = true

      for (let j = 0; j < termGroups[i].length; j++) {
        const term = termGroups[i][j]

        if (!termMatches(term, item)) {
          // the term does not match and we can skip execution of this
          // group as all terms are ANDed
          matchesGroup = false
          break
        }
      }

      if (matchesGroup) {
        // the term matches the group, all groups are ORed so we can
        // skip further execution and return a true for a match
        return true
      }
    }

    return false
  }
}

function project (fields: string[]): (item: any) => any {
  return item => {
    const data = {}

    fields.forEach(fieldName => {
      data[fieldName] = item[fieldName]
    })

    return data
  }
}

function sort (sort: Map<string, SortDirection>): (a: any, b: any) => number {
  return (a, b) => {
    for (const [field, direction] of sort.entries()) {
      const val = direction === SortDirection.ASC
        ? 1
        : -1

      if (a[field] === b[field]) {
        continue
      }

      if (a[field] < b[field]) {
        return val
      } else if (a[field] > b[field]) {
        return val * -1
      }

      return 0
    }

    return 0
  }
}

export default class MockAdapter implements IAdapter {
  private _objects = new Map<string, any[]>()
  private _defaults = new Map<string, string>()
  private _schemas = new Map<string, string[]>()


  private static emptyResult (): Promise<AdapterResult> {
    return Promise.resolve({
      success: true,
      objects: []
    })
  }

  private static generateResult (query: AdapterQuery, objects: any[]): AdapterResult {
    if (query.limit) {
      objects = objects.slice(0, query.limit)
    }

    if (query.sort.size) {
      objects = objects.sort(sort(query.sort))
    }

    objects = objects
      .map(project(query.fields))

    return {
      success: true,
      objects
    }
  }

  fill (object: string, items: any[]): this {
    this._objects.set(object, items)
    if (items.length > 0) {
      this._schemas.set(object, Object.keys(items[0]))
    }

    return this
  }

  setDefaultId (object: string, id: string): this {
    this._defaults.set(object, id)
    return this
  }

  runQuery (query: AdapterQuery): Promise<AdapterResult> {
    switch (query.type) {
      case QueryType.SELECT:
        return this.runSelectQuery(query)
      case QueryType.SELECT_CURRENT:
        return this.runSelectCurrentQuery(query)
      case QueryType.UPDATE:
        return this.runUpdateQuery(query)
      case QueryType.UPDATE_CURRENT:
        return this.runUpdateCurrentQuery(query)
      case QueryType.DELETE:
        return this.runDeleteQuery(query)
      case QueryType.INSERT:
        return this.runInsertQuery(query)
    }

    throw new Error('Query Type not supported')
  }

  private validateQuery (query: AdapterQuery) {
    if (!this._objects.has(query.object)) {
      throw new Error(`Object ${query.object} was not filled`)
    }

    if (!this._schemas.has(query.object)) {
      console.warn(`No objects set for object '${query.object}' – could not validate schema`)
      return
    }

    const unmatchedField = query.fields.find((field) => {
      return !this._schemas.get(query.object)!.includes(field)
    })

    if (unmatchedField) {
      throw new Error(`Object '${query.object} does not have a field named '${unmatchedField}'`)
    }
  }

  private runSelectQuery (query: AdapterQuery): Promise<AdapterResult> {
    this.validateQuery(query)

    const objects = this._objects.get(query.object)!
      .filter(filter(query.where))

    return Promise.resolve(MockAdapter.generateResult(query, objects))
  }

  private runSelectCurrentQuery (query: AdapterQuery): Promise<AdapterResult> {
    this.validateQuery(query)

    if (!this._defaults.has(query.object)) {
      return Promise.resolve({
        success: true,
        objects: []
      })
    }

    const objects = this._objects.get(query.object)!
      .filter((item) => {
        return item.Id === this._defaults.get(query.object)
      })

    return Promise.resolve(MockAdapter.generateResult(query, objects))
  }

  private runInsertQuery (query: AdapterQuery): Promise<AdapterResult> {
    if (!this._schemas.has(query.object)) {
      console.warn(`Could not validate Schema as there are no Objects for ${query.object}`)
    } else {
      const unmatchedField = Object.keys(query.values).find((field) => {
        return !this._schemas.get(query.object)!.includes(field)
      })

      if (unmatchedField) {
        throw new Error(`Object '${query.object} does not have a field named '${unmatchedField}'`)
      }
    }

    const o = JSON.parse(JSON.stringify(Object.fromEntries(query.values.entries())))

    if (this._objects.has(query.object)) {
      this._objects.get(query.object)!.push(o)
    } else {
      this.fill(query.object, [o])
    }

    return Promise.resolve({
      success: true,
      objects: [
        Object.assign(o, {
          objectId: Math.ceil(Math.random() * Date.now())
        })
      ]
    })
  }

  private runDeleteQuery (query: AdapterQuery): Promise<AdapterResult> {
    this.validateQuery(query)

    const objects = this._objects.get(query.object)!
    const candidates = objects.filter(filter(query.where))

    candidates.forEach(o => {
      objects.splice(objects.indexOf(o), 1)
    })

    return MockAdapter.emptyResult()
  }

  private runUpdateQuery (query: AdapterQuery): Promise<AdapterResult> {
    this.validateQuery(query)

    const objects = this._objects.get(query.object)!
    const candidates = objects.filter(filter(query.where))
    const data = Object.fromEntries(query.values.entries())

    candidates.forEach(o => {
      Object.assign(o, data)
    })

    return MockAdapter.emptyResult()
  }

  private runUpdateCurrentQuery (query: AdapterQuery): Promise<AdapterResult> {
    this.validateQuery(query)

    if (!this._defaults.has(query.object)) {
      return MockAdapter.emptyResult()
    }

    const o = this._objects
      .get(query.object)!
      .find(obj => obj.Id === this._defaults.get(query.object))

    if (o) {
      Object.assign(o, Object.fromEntries(query.values.entries()))
    }

    return MockAdapter.emptyResult()
  }
}

