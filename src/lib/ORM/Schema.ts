export interface ModelResolverFunction<T> {
  (parentModel: T, rawData: any): Promise<any>;
}

export interface FieldSchema<T> {
  resolver?: ModelResolverFunction<T>;
  name?: string;
  primary?: boolean;
}

export interface FieldsSchema<T> {
  [fieldName: string]: FieldSchema<T>;
}

export class Schema<T> {
  protected _fields: FieldsSchema<T> = {};
  protected _object = '';

  setObject(object: string): this {
    this._object = object;
    return this;
  }

  getObject(): string {
    return this._object;
  }

  addField(field: string, schema: FieldSchema<T>): this {
    this._fields[field] = schema;

    return this;
  }

  simpleFields(): string[] {
    return Object.keys(this._fields).filter((k) => {
      return !Object.hasOwnProperty.call(this._fields[k], 'resolver');
    });
  }

  complexFields(): string[] {
    return Object.keys(this._fields).filter((k) => {
      return Object.hasOwnProperty.call(this._fields[k], 'resolver');
    });
  }

  get(key: string): FieldSchema<T> {
    return this._fields[key];
  }

  has(key: string): boolean {
    return Object.hasOwnProperty.call(this._fields, key);
  }

  keyField(): string | null {
    const key = Object.keys(this._fields).find((k) => this._fields[k].primary);
    return key ?? null;
  }

  crmFields(): string[] {
    return Object.keys(this._fields)
      .filter((key) => Object.hasOwnProperty.call(this._fields[key], 'name'))
      .map((key) => {
        return this._fields[key].name!;
      });
  }
}
