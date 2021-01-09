import it from 'ava'

import Account from '../../test/fixtures/models/Account'
import { getAdapter } from '../../test/fixtures/utils/adapter'

it('can be created', t => {
  const a = new Account()
  a.first = 'Hello'
  a.last = 'World'

  t.is(a.fullName(), 'Hello World')
})

it('should create a query', async t => {
  const res = await Account.query().limit(1).exec(getAdapter())

  t.is(res.objects[0].id, 'iron-man')
  t.is(res.objects.length, 1)
})

it('should find a model', async t => {
  const captain = await Account.find('cap', getAdapter())

  t.is(captain!.id, 'cap')
  t.is(captain!.fullName(), 'Steve Rogers')
})

it('should find the current model', async t => {
  const ironman = await Account.current(getAdapter())

  t.is(ironman!.fullName(), 'Tony Stark')
})

it('should find all models', async t => {
  const accounts = await Account.all(getAdapter())
  t.is(accounts.length, 6)
})

it('should save a new model', async t => {
  const adapter = getAdapter()

  const newAccount = new Account({
    first: 'Carol',
    last: 'Danvers',
    name: 'Captain Marvel'
  })

  await newAccount.save(adapter)
  const allAccounts = await Account.all(adapter)

  t.is(allAccounts.length, 7)
  t.is(allAccounts[6].fullName(), 'Carol Danvers')
})

it('should update a model', async t => {
  const adapter = getAdapter()
  let falcon = await Account.find('falcon', adapter)
  falcon.last = 'Nobody'

  t.is(falcon.fullName(), 'Sam Nobody')

  await falcon.save(adapter)

  falcon = await Account.find('falcon', adapter)

  t.is(falcon.fullName(), 'Sam Nobody')
  t.is(falcon.name, 'Falcon')
})

it.todo('should fetch with providers')
