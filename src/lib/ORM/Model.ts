import { Query } from '../../index'
import IAdapter from '../Adapters/IAdapter'

import { KeyFieldMissingError } from './Errors/KeyFieldMissingError'
import { ModelResolverFunction, Schema } from './Schema'

export interface ModelData {
  [key: string]: any
}

export class Model {
  private _created = false
  static _schema: Schema = new Schema()

  constructor (data: ModelData = {}) {
    Object.keys(data).forEach(key => {
      this[key] = data[key]
    })

    this._created = false
  }

  static all (adapter: IAdapter | null = null): Promise<Model[]> {
    return this.query()
      .exec(adapter)
      .then(res => res.objects)
  }

  static current (adapter: IAdapter | null = null): Promise<Model | null> {
    return this.query().current()
      .exec(adapter)
      .then(res => {
        return res.objects.length === 1
          ? res.objects[0]
          : null
      })
  }

  static find (id: string, adapter: IAdapter | null = null): Promise<Model | null> {
    if (!this._schema.keyField()) {
      return Promise.resolve(null)
    }

    const keyField = this._schema.get(this._schema.keyField()!)

    return this
      .query()
      .limit(1)
      .where(keyField.name, id)
      .exec(adapter)
      .then(res => {
        return res.objects.length === 1
          ? res.objects[0]
          : null
      })
  }

  /**
   * Query object
   *
   * @return {Query}
   */
  static query () {
    return Query
      .select(...this._schema.crmFields())
      .from(this._schema.getObject())

      // we will add a default post processor which generates models
      // our of the raw data we will receive by the CRM adapter
      .addPostProcessor(result => {
        return Promise
          .all(result.objects.map(this._makeModel.bind(this)))
          .then(models => {
            return {
              success: true,
              objects: models
            }
          })
      })
  }

  /**
   * Creates a new model (which is coming from CRM Data)
   *
   * @param input
   * @private
   */
  private static _makeModel (input: any): Promise<Model> {
    return (new this())
      .fill(input as ModelData)
      .then(model => {
        // we have initially filled everything from the CRM here...
        // therefore we will mark it as "already created in crm"
        model._created = true

        return model
      })
  }

  /**
   * Checks if the model is present in the CRM (so called "created")
   */
  isCreated (): boolean {
    return this._created
  }

  /**
   * Retrieve the identifying key (internal name)
   */
  getKey (): string | number | undefined {
    const schema = (this.constructor as typeof Model)._schema
    const key = schema.keyField()

    if (!key) {
      throw new KeyFieldMissingError()
    }

    return this[key]
  }

  /**
   * Uses incoming CRM data to fill the model
   *
   * @param {Object} data - Model properties
   * @returns this
   */
  fill (data: ModelData): Promise<Model> {
    const schema = (this.constructor as typeof Model)._schema

    // we will fill all simple properties first
    schema
      .simpleFields()
      .forEach(key => {
        // set properties
        this[key] = data[schema.get(key).name]
      })

    // we are basically done, but we want to check for complex data types...
    const promises = schema
      .complexFields()
      .map(complexPropertyKey => {
        const rawDataValue = data[complexPropertyKey] || null
          ? data[complexPropertyKey]
          : null

        // call the model resolver with our model and save the return value
        const resolver = schema.get(complexPropertyKey).resolver as ModelResolverFunction

        return resolver(this, rawDataValue)
          .then(data => {
            // we should have received a result from the promise here now
            // and want to populate our property with it
            this[complexPropertyKey] = data
          })
      })

    // we wait for all promises to finish
    // until we return our now fully populated model
    return Promise
      .all(promises)
      .then(() => {
        return this
      })
  }

  /**
   * Save model
   *
   * @return boolean
   */
  save (adapter: IAdapter | null = null): Promise<Model> {
    return this.isCreated()
      ? this._update(adapter)
      : this._store(adapter)
  }

  private _store (adapter: IAdapter | null = null): Promise<Model> {
    const schema = (this.constructor as typeof Model)._schema

    // lets get the data from our object here
    const data = schema.simpleFields().reduce((obj, key) => {
      obj[schema.get(key).name] = this[key]
      return obj
    }, {})

    // lets build the insert query and run it
    return Query
      .insert(data)
      .into(schema.getObject())
      .exec(adapter)
      .then(res => {
        const data = res.objects[0]
        const keyField = schema.keyField()

        // we are now created :)
        this._created = true

        // set the keyfield to the new object id if possible
        if (
          keyField
          && Object.hasOwnProperty.call(data, 'objectId')
          && Object.hasOwnProperty.call(this, keyField)
        ) {
          this[keyField] = data.objectId
        }

        // return the updated model as the promise result
        return this
      })
  }

  private _update (adapter: IAdapter | null = null): Promise<Model> {
    const schema = (this.constructor as typeof Model)._schema
    const keyField = schema.keyField()

    if (!keyField) {
      throw new KeyFieldMissingError()
    }

    const query = Query.update(schema.getObject())

    // fill query
    schema.simpleFields().forEach(key => {
      query.set(schema.get(key).name, this[key])
    })

    // only this one
    query.where(schema.get(keyField).name, this.getKey())

    // return this
    return query.exec(adapter).then(() => {
      return this
    })
  }
}

