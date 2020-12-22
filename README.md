# Veeva ORM

ORM Library for use with the Veeva CRM Ecosystem (MyInsights, CLM, etc.)

We – [RMH MEDIA](https://rmh-media.com) – are building applications with and for the [Veeva](https://veeva.com) ecosystem.
Within this ecosystem, a data layer can be used to interact with information stored in the CRM.

Veeva provides simple JavaScript utilities to work in a CRUDish way with it but for more sophisticated applications this might not be enough – 
at least not for us 👻.

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
```ecmascript 6
import { Manager, Query } from '@rmh-media/veeva-orm-core'
import { Adapter } from '@rmh-media/veeva-orm-myinsights-adapter'

// create a new manager singleton instance
const manager = Manager.init(new Adapter())

// create a query
const currentAccount = await Query
    .select('FirstName', 'LastName')
    .from('Account')
    .whereCurrent()
    .exec()
```

Checkout the detailed guides in the [docs/guides/](docs/guides/) folder
