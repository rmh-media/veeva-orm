# Veeva ORM Documentation

- You should be familiar with the Veeva Ecosystem (like CLM, MyInsights, etc.)
- Should have general knowledge about ORMs (we are following a DataMapper-ish-approach)

If you are already experienced with Veeva and the ecosystem (or Salesforce) you are most likely ready to go.  

## Concepts

We have divided the library into two different parts:

1. Query Classes
2. ORM Classes

### Query Classes

Every query type is abstracted in a specific class (`SelectQuery`, `InsertQuery` etc.) – they are all extending the BaseQuery as they share some common
functionality.

Queries contain methods following the SQL naming – `from(...)`, `where(...)` which makes it easy to understand and to use.
Once you've prepared your query, you can execute it against an adapter.

If you call `myQuery.exec()`, the default adapter is called and executed which invokes commands on the device or the online
CRM. Depending on your environment. 

**Adapters**
We are currently providing two different adapters – one (the default) adapter is working with CLM and MyInsights and a second one is
meant to be used with mocked data for development purposes.

### ORM Classes

> TODO
 
## Writing Queries

> TODO

A very basic Query to get all accounts:

```javascript
    const accounts = await Query
      .select('Id', 'FirstName', 'LastName')
      .from('Account')
      .exec()
```

You can use where clauses to limit your results:

```javascript
    const kolAccounts = await Query
      .select('Id', 'FirstName', 'LastName')
      .from('Account')
      .where('KOL_vod__c', true)
      .exec()
```

Where clauses are chained with AND by default:

```javascript
    const kolAccounts = await Query
      .select('Id', 'FirstName', 'LastName')
      .from('Account')
      .where('KOL_vod__c', true)
      .where('')
      .exec()
```



```javascript
    const selectQuery = Query.select('field1__c', 'field2__c')
    const insertQuery = Query.insert({ some: 'data' }) 
    const deleteQuery = Query.deleteFrom('Object__c') 
    const updateQuery = Query.update('Object__c')
    const selectCurrentQuery = Query.select('field1__c').
    const selectCurrentQuery = Query.update('Account').whereCurrent()
```

```javascript
Query
    .insert({
    
    })
    .into('object')

Query
    .select('field')
    .from('object')
    .where()

Query
    .deleteFrom('object')
    .where()

Query
    .update('object')
    .set('foo', 'bar')
    .where()
```


## Creating Models

> TODO

## Mocking Data

As developing against the CRM is not a piece of cake, you can use the built-in mock adapter:

```javascript
import { Manager, MockAdapter } from '@rmh-media/veeva-orm-core'

// lets keep the reference as we want to load/unload data in our test suites
const adapter = new MockAdapter()

// tell the manager instance to use the new adapter
Manager.getInstance().use(adapter)

// load some data into the `Account` object
adapter.load('Account', [
  {
    FirstName: 'Bruce',
    LastName: 'Wayne' 
  }
])

// the first loaded account will automatically become the current account
const currentAccount = await Query
    .select('FirstName', 'LastName')
    .fromCurrent('Account')
    .exec()

console.log(`${currentAccount.FirstName} ${currentAccount.LastName}`)
```
