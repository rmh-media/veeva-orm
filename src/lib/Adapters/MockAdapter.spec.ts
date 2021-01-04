import it from 'ava'

import { Query } from '../../index'
import objects from '../../test/fixtures/objects'
import Manager from '../Manager'

import { SortDirection } from './AdapterQuery'
import MockAdapter from './MockAdapter'

it.beforeEach(t => {
  const adapter = new MockAdapter()

  Object.keys(objects).forEach(key => {
    adapter.fill(
      key,
      JSON.parse(JSON.stringify(objects[key].objects))
    )
  })

  Manager.getInstance().use(adapter)
})

it('should select all items', async t => {
  const result = await Query
    .select('Name')
    .from('Account')
    .exec()

  const names = result.objects.map(o => o.Name)
  const list = objects.Account.objects.map(o => o.Name)

  t.deepEqual(names, list)
})

it('should limit the results', async t => {
  const result = await Query
    .select('Name')
    .from('Account')
    .limit(2)
    .exec()

  const list = objects.Account.objects.map(o => o.Name).slice(0, 2)
  const names = result.objects.map(o => o.Name)

  t.deepEqual(names, list)
})

it('should order the results', async t => {
  const result = await Query
    .select('FirstName', 'LastName')
    .from('Account')
    .orderBy('LastName', SortDirection.DESC)
    .exec()

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

  await Query
    .insert(natascha)
    .into('Account')
    .exec()

  const result = await Query
    .select('Name')
    .from('Account')
    .where('Id', 'black-widow')
    .exec()

  t.is(result.objects[0].Name, natascha.Name)
})

it('should delete objects', async t => {
  await Query
    .deleteFrom('Account')
    .where('FirstName', 'Peter')
    .exec()

  const count = await Query
    .select('Name')
    .from('Account')
    .count()

  t.is(objects.Account.objects.length - 1, count)
})
