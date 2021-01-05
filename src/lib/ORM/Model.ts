import { FieldType, ModelResolverFunction, Schema } from './Schema'
import { Repository } from './Repository'
import { SchemaMissingError } from './Errors/SchemaMissingError'
import { KeyFieldMissingError } from './Errors/KeyFieldMissingError'

export interface ModelData {
  [key: string]: any
}

export abstract class Model {
  private _created = false
  private _properties: ModelData = {}

  static $schema: Schema = new Schema({
    id: {
      type: FieldType.TEXT,
      name: 'Id'
    }
  })

  static repo () {
    return new Repository(this)
  }

  constructor (data: ModelData) {
    data = data || {}

    if (Object.keys(data).length > 0) {
      this.fill(data)
    }

    this._created = false
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
  getKey (): any {
    const schema = (this.constructor as typeof Model).$schema
    const key = schema.internalKey()

    if (!key) {
      throw new KeyFieldMissingError()
    }

    return this.getProperty(key)
  }

  /**
   * Get a property out of our internal storage bag
   * uses get[NAME]Property Accessors
   *
   * @param name - Name of the property to get
   * @returns the property data
   */
  getProperty (name: string): any {
    const fnName = 'get' + name.charAt(0).toUpperCase() + name.slice(1) + 'Property'

    if (typeof this[fnName] === 'function') {
      return this[fnName]()
    }

    return this._properties[name]
  }

  /**
   * Sets a property
   *
   * @param name – the name of the field to set
   * @param value – the value to set
   */
  setProperty (name: string, value: any) {
    // ensure the property is defined
    this._defineProperty(name)

    // we want to call e.g. setNameProperty if available
    const fnName = 'set' + name.charAt(0).toUpperCase() + name.slice(1) + 'Property'

    if (typeof this[fnName] === 'function') {
      // we call the function without any tricks, we leave the input value untouched
      return this[fnName](value)
    }

    // finally set it
    this._properties[name] = value

    return this
  }


  /**
   * Define a property if it does not exist
   * and set getter and setter
   *
   * @param {string} key
   * @private
   */
  _defineProperty (key: string) {
    if (Object.hasOwnProperty.call(this, key)) {
      // already defined
      return
    }

    const schema = (this.constructor as typeof Model).$schema

    // check if we have a definition for this item?
    if (!schema.has(key)) {
      throw new SchemaMissingError(key)
    }

    Object.defineProperty(this, key, {
      get: () => {
        return this.getProperty(key)
      },
      set: (value) => {
        return this.setProperty(key, value)
      }
    })
  }

  /**
   * Fills our internal storage bag with property data
   *
   * @param {Object} data - Model properties
   * @returns this
   */
  fill (data: ModelData) {
    const schema = (this.constructor as typeof Model).$schema

    // we will fill all simple properties first
    schema
      .simpleFields()
      .forEach(key => {
        // set properties
        this.setProperty(key, data[key])
      })

    // we are basically done, but we want to check for complex data types...
    const promises = schema
      .complexFields()
      .map(complexPropertyKey => {
        const rawDataValue = data && data[complexPropertyKey]
          ? data[complexPropertyKey]
          : null

        // call the model resolver with our model and save the return value
        const resolver = schema.get(complexPropertyKey).type as ModelResolverFunction

        return resolver(this, rawDataValue)
          .then(data => {
            // we should have received a result from the promise here now
            // and want to populate our property with it

            this.setProperty(complexPropertyKey, data)
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
}

