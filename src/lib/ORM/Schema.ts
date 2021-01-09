import { Model } from './Model'

export interface ModelResolverFunction {
  (parentModel: Model, rawData: any): any
}

export enum FieldType {
  TEXT,
  NUMBER,
  BOOLEAN
}

export interface FieldSchema {
  resolver?: ModelResolverFunction,
  name: string,
  primary?: boolean
}

export interface FieldsSchema {
  [fieldName: string]: FieldSchema
}

export class Schema {
  protected _fields: FieldsSchema = {}
  protected _object: string = ''

  setObject (object: string): this {
    this._object = object
    return this
  }

  getObject (): string {
    return this._object
  }

  addField (field: string, schema: FieldSchema): this {
    this._fields[field] = schema

    return this
  }

  simpleFields (): string[] {
    return Object
      .keys(this._fields)
      .filter(k => {
        return !Object.hasOwnProperty.call(this._fields[k], 'resolver')
      })
  }

  complexFields (): string[] {
    return Object.keys(this._fields)
      .filter(k => {
        return Object.hasOwnProperty.call(this._fields[k], 'resolver')
      })
  }

  get (key: string): FieldSchema {
    return this._fields[key]
  }

  has (key: string): boolean {
    return Object.hasOwnProperty.call(this._fields, key)
  }

  keyField (): string | null {
    const key = Object.keys(this._fields).find(k => this._fields[k].primary)
    return key ?? null
  }

  crmFields (): string[] {
    return Object.keys(this._fields).map(key => {
      return this._fields[key].name
    })
  }
}
