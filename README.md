# Veeva ORM

Unopiniated ORM Library for use with the [Veeva](https://veeva.com) CRM Ecosystem (MyInsights, CLM, etc.).
Slightly inspired by Laravel Eloquent :)

## Why?
During [our work](https://rmh-media.com) we had to build some kind of data abstraction to interact with VeevaCRM data multiple times.
[Veeva](https://veeva.com) provides simple JavaScript utilities to work in a *CRUDish* way with their data but for more sophisticated 
applications this might not be enough – so we started this unopinioated project 👻.

## Goal
The goal of this project is to build a sustainable data layer which can be used throughout different Veeva Applications. 
We are currently targeting MyInsights and CLM – but we might add Engage in the near future.

## TL;RD

**Install it**
```bash
# Install Core and MyInsights Adapter
npm install @rmh-media/veeva-orm-core @rmh-media/veeva-orm-myinsights-adapter --save
```
*Checkout the [the docs](./docs/index.md) for more information about adapters.*

**Use it**
```javascript
import { Manager, Query } from '@rmh-media/veeva-orm-core'
import { Adapter as ClmAdapter} from '@rmh-media/veeva-orm-myinsights-adapter'

// setup the manager
Manager.init(new ClmAdapter())

// create a select query
const currentAccount = await Query
    .select('Name', 'FirstName', 'LastName')
    .fromCurrent('Account')
    .exec()

// who am i?
console.log(`I am ${currentAccount.Name}`) // I am Batman
```

*You'll find more samples in the docs [the docs](./docs/index.md).*
