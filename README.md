# Veeva ORM

**WORK IN PROGRESS**

Unopiniated ORM Library for use with the [Veeva](https://veeva.com) CRM Ecosystem (MyInsights, CLM, etc.).
Slightly inspired by Laravel Eloquent :)

This library does not aim to be a replacement for the official Veeva libraries even though we are not depending on the official ones.
**Important to note**: This library is not compatible with IE8 and below as we do not support outdated browsers with our products.

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
npm install @rmh-media/veeva-orm --save
```

**Query an object**
```javascript
import { Query } from '@rmh-media/veeva-orm'

// create a select query
const currentAccount = await Query
    .select('Name', 'FirstName', 'LastName')
    .fromCurrent('Account')
    .exec()

// who am i?
console.log(`I am ${currentAccount.Name}`) // I am Batman
```

**Create you models**
```javascript
import { Model } from '@rmh-media/veeva-orm'

class Hero extends Model {
  static identitiy() {
    return { object: 'Hero__c', key: 'id' } 
  }

  static fields() {
    return {
      Id: String,
      Name: String
    }
  }

  static mapping() {
    return {
      Id: 'id',
      Name: 'name'
    }
  }
}

const heroes = await Hero.repo().all()


// who am i?
console.log(`We have ${heroes.length} Heroes! ${heroes[0].name} is the first one`) // I am Batman
```

*You'll find more samples in the docs [the docs](./docs/index.md).*
