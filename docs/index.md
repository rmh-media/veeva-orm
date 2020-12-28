# Veeva ORM Documentation

- You should be familiar with the Veeva Ecosystem (like CLM, MyInsights, etc.)
- Should have general knowledge about ORMs

If you are already experienced with Veeva and the ecosystem (or Salesforce) you are most likely ready to go.  

## Concepts

We have divided the library into different parts:

1. Query Classes
2. Adapters
3. ORM Helpers

### Query Classes

Every query type is abstracted in a specific class (`SelectQuery`, `InsertQuery` etc.) – they are all extending the BaseQuery as they share some common
functionality.

Queries contain methods following the SQL naming – `from(...)`, `where()` which makes it easy to understand and to use.
Once you've prepared your query, you can execute it against an adapter.

### Adapters

Adapters transform the query instances to a readable string which can be consumed and performed by the Veeva applications. You should decide on a proper adapter to 
fire the queries and receive your results. 

We are currently planning to build a `MyInsights` Adapter and a `CLM` Adapter.

### ORM Helpers
 


## Initialization

The easiest way to init:

```javascript
import { Manager, Query } from '@rmh-media/veeva-orm-core'
import { Adapter as ClmAdapter} from '@rmh-media/veeva-orm-myinsights-adapter'

Manager.init(new ClmAdapter())
```

From now on, all queries will be executed against the ClmAdapter as the default manager has been initialized with it.

## Ease of development

As developing against the CRM is not a piece of cake, you can use the built-in mock adapter:

```javascript
import { Manager, Query, MockAdapter } from '@rmh-media/veeva-orm-core'

// lets keep the reference as we want to load/unload data in our test suites
const adapter = new MockAdapter()

// default manager should use the adapter
Manager.init(new MockAdapter())

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

### Working with Queries

All Queries can be created with the factory class `Query`:

#### Select Queries

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
