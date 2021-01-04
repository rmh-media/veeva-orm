import it from 'ava'

import { QueryType } from '../Adapters/AdapterQuery'

import Query from './Query'
import SelectQuery from './SelectQuery'


it('should be possible to create it', t => {
  const q = new SelectQuery(['nickname__c'])
  q
    .from('villains__c')
    .where('risk__c', 'high')
    .whereLike('abode__c', '%asylum')

  t.like(q.adapterQuery, {
    type: QueryType.SELECT,
    fields: [
      'nickname__c'
    ],
    object: 'villains__c',
    where: [
      [
        {
          field: 'risk__c',
          operator: '=',
          value: 'high'
        },
        {
          field: 'abode__c',
          operator: 'LIKE',
          value: '%asylum'
        }
      ]
    ]
  })
})

it('should change type to use current data', t => {
  const q = new SelectQuery(['field_a'])
  q.current()
  t.is(q.adapterQuery.type, QueryType.SELECT_CURRENT)

  q.current(false)
  t.is(q.adapterQuery.type, QueryType.SELECT)
})

it('should be possible to use the facade', t => {
  const q = Query
    .select('some_field')
    .from('my_object')

  t.truthy(q instanceof SelectQuery)
})
