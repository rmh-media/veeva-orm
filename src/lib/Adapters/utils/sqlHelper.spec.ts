import it from 'ava'

import { Operator } from '../../Queries/QueryWithWhereClause'
import { SortDirection, Term } from '../AdapterQuery'

import { buildSortClause, buildWhereClause } from './sqlHelper'

it('creates an empty where clause', t => {
  const clause = buildWhereClause([])
  t.is(clause, '')
})

it('creates a simple equals clause', t => {
  const terms: Term[][] = [[]]

  terms[0].push({
    operator: Operator.EQUALS,
    value: 'Batman',
    field: 'Name'
  })

  t.is(buildWhereClause(terms), "WHERE (Name = 'Batman')")
})

it('creates a numeric equals clause', t => {
  const terms: Term[][] = [[]]

  terms[0].push({
    operator: Operator.EQUALS,
    value: 35,
    field: 'Age'
  })

  t.is(buildWhereClause(terms), "WHERE (Age = 35)")
})

it('creates a boolean equals clause', t => {
  const terms: Term[][] = [[]]

  terms[0].push({
    operator: Operator.EQUALS,
    value: false,
    field: 'Retired'
  })

  t.is(buildWhereClause(terms), "WHERE (Retired = false)")
})

it('chains clauses', t => {
  const terms: Term[][] = [[]]

  terms[0].push({
    operator: Operator.EQUALS,
    value: 35,
    field: 'Age'
  })

  terms[0].push({
    operator: Operator.EQUALS,
    value: 'Batman',
    field: 'Name'
  })

  t.is(buildWhereClause(terms), "WHERE (Age = 35 AND Name = 'Batman')")
})

it('chains clause groups', t => {
  const terms: Term[][] = [[]]

  terms[0].push({
    operator: Operator.EQUALS,
    value: 35,
    field: 'Age'
  })

  terms[0].push({
    operator: Operator.EQUALS,
    value: 'Batman',
    field: 'Name'
  })

  terms.push([
    {
      operator: Operator.EQUALS,
      value: 'Philanthropist',
      field: 'Profession'
    }
  ])

  t.is(
    buildWhereClause(terms),
    "WHERE (Age = 35 AND Name = 'Batman') OR (Profession = 'Philanthropist')"
  )
})

it('creates a sort clause', t => {
  const sort = new Map<string, SortDirection>()
  sort.set('Name', SortDirection.ASC)
  sort.set('Age', SortDirection.DESC)

  t.is(buildSortClause(sort).join(', '), 'Name ASC, Age DESC')
})

