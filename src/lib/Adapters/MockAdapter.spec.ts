import it from 'ava'

import { Query } from '../../index'
import objects from '../../test/fixtures/objects'

import { SortDirection } from './AdapterQuery'
import MockAdapter from './MockAdapter'
import { getAdapter } from '../../test/fixtures/utils/adapter'

it('should select all items', async t => {
  const result = await Query
    .select('Name')
    .from('Account')
    .exec(getAdapter())

  const names = result.objects.map(o => o.Name)
  const list = objects.Account.objects.map(o => o.Name)

  t.deepEqual(names, list)
})

it('should limit the results', async t => {
  const result = await Query
    .select('Name')
    .from('Account')
    .limit(2)
    .exec(getAdapter())

  const list = objects.Account.objects.map(o => o.Name).slice(0, 2)
  const names = result.objects.map(o => o.Name)

  t.deepEqual(names, list)
})

it('should order the results', async t => {
  const result = await Query
    .select('FirstName', 'LastName')
    .from('Account')
    .orderBy('LastName', SortDirection.DESC)
    .exec(getAdapter())

  const expected = objects.Account.objects.map(o => o.LastName).sort()
  const names = result.objects.map(o => o.LastName)

  t.deepEqual(names, expected)
})

it('should add an object', async t => {
  const natascha = {
    FirstName: 'Natascha',
    LastName: 'Romanow',
    Name: 'Black Widow',
    Id: 'black-widow'
  }

  const adapter = getAdapter()

  await Query
    .insert(natascha)
    .into('Account')
    .exec(adapter)

  const result = await Query
    .select('Name')
    .from('Account')
    .where('Id', 'black-widow')
    .exec(adapter)

  t.is(result.objects[0].Name, natascha.Name)
})

it('should delete objects', async t => {
  const adapter = getAdapter()

  await Query
    .deleteFrom('Account')
    .where('FirstName', 'Peter')
    .exec(adapter)

  const count = await Query
    .select('Name')
    .from('Account')
    .count(adapter)

  t.is(objects.Account.objects.length - 2, count)
})

it('should update objects', async t => {
  const adapter = getAdapter()

  await Query
    .update('Account')
    .set('Name', 'Unknown')
    .where('FirstName', 'Peter')
    .exec(adapter)

  const results = await Query
    .select('Name', 'LastName', 'FirstName')
    .from('Account')
    .where('FirstName', 'Peter')
    .exec(adapter)

  t.is(results.objects[0].FirstName, 'Peter')
  t.is(results.objects[0].LastName, 'Quill')
  t.is(results.objects[0].Name, 'Unknown')

  t.is(results.objects[1].FirstName, 'Peter')
  t.is(results.objects[1].LastName, 'Parker')
  t.is(results.objects[1].Name, 'Unknown')
})

it('should select the current object', async t => {
  const adapter = getAdapter() as MockAdapter
  adapter.setDefaultId('Account', 'cap')

  const res = await Query
    .select('Name')
    .fromCurrent('Account')
    .exec(adapter)

  t.is(res.objects.length, 1)
  t.is(res.objects[0].Name, 'Captain America')
})

it('should update the current object', async t => {
  const adapter = getAdapter() as MockAdapter
  adapter.setDefaultId('Account', 'iron-man')

  await Query
    .updateCurrent('Account')
    .set('LastName', 'Padilla')
    .exec(adapter)

  const res = await Query
    .select('Name', 'LastName')
    .fromCurrent('Account')
    .exec(adapter)

  t.is(res.objects.length, 1)
  t.is(res.objects[0].Name, 'Iron Man')
  t.is(res.objects[0].LastName, 'Padilla')
})
