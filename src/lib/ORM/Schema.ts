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
  type: ModelResolverFunction | FieldType,
  name: string,
  primary?: boolean
}

export interface FieldsSchema {
  [fieldName: string]: FieldSchema
}

export class Schema {
  private readonly _fields: FieldsSchema

  constructor (fields: FieldsSchema) {
    this._fields = fields
  }

  simpleFields (): string[] {
    return Object.keys(this._fields)
      .filter(k => {
        return typeof this._fields[k].type !== 'function'
      })
  }

  complexFields (): string[] {
    return Object.keys(this._fields)
      .filter(k => {
        return typeof this._fields[k].type === 'function'
      })
  }

  get (key: string): FieldSchema {
    return this._fields[key]
  }

  has (key: string): boolean {
    return Object.hasOwnProperty.call(this._fields, key)
  }

  internalKey (): string | null {
    const key = Object.keys(this._fields).find(k => this._fields[k].primary)
    return key ?? null
  }
}
