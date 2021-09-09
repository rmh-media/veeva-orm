import { Query } from '../../index';
import IAdapter from '../Adapters/IAdapter';
import SelectQuery from '../Queries/SelectQuery';

import { KeyFieldMissingError } from './Errors/KeyFieldMissingError';
import { Model, ModelConstructor } from './Model';
import { Schema } from './Schema';

export class Repository<T extends Model> {
  _schema: Schema<T>;
  _class: ModelConstructor<T>;

  constructor(modelClass: ModelConstructor<T>) {
    this._schema = new Schema<T>();
    this._class = modelClass;
  }

  keyOf(model: T): string | number | undefined {
    const field = this._schema.keyField();

    if (!field) {
      throw new KeyFieldMissingError();
    }

    return model[field];
  }

  all(adapter: IAdapter | null = null): Promise<T[]> {
    return this.query()
      .exec(adapter)
      .then((res) => res.objects);
  }

  current(adapter: IAdapter | null = null): Promise<T | null> {
    return this.query()
      .current()
      .exec(adapter)
      .then((res) => {
        return res.objects.length === 1 ? res.objects[0] : null;
      });
  }

  find(id: string, adapter: IAdapter | null = null): Promise<T | null> {
    if (!this._schema.keyField()) {
      return Promise.resolve(null);
    }

    const keyField = this._schema.get(this._schema.keyField()!);

    if (!keyField) {
      throw new KeyFieldMissingError();
    }

    return this.query()
      .limit(1)
      .where(keyField.name!, id)
      .exec(adapter)
      .then((res) => {
        return res.objects.length === 1 ? res.objects[0] : null;
      });
  }

  query(): SelectQuery {
    return (
      Query.select(...this._schema.crmFields())
        .from(this._schema.getObject())

        // we will add a default post processor which generates models
        // our of the raw data we will receive by the CRM adapter
        .addPostProcessor((result) => {
          return Promise.all(result.objects.map(this._fill.bind(this))).then(
            (models) => {
              return {
                success: true,
                objects: models,
              };
            }
          );
        })
    );
  }

  _fill(data: any): Promise<T> {
    const model: T = new this._class({});

    // we will fill all simple properties first
    this._schema.simpleFields().forEach((key) => {
      // set properties
      model[key] = data[this._schema.get(key).name!];
    });

    // we are basically done, but we want to check for complex data types...
    const promises = this._schema.complexFields().map((complexPropertyKey) => {
      const rawDataValue =
        data[complexPropertyKey] || null ? data[complexPropertyKey] : null;

      // call the model resolver with our model and save the return value
      const resolver = this._schema.get(complexPropertyKey).resolver!;

      return resolver(model, rawDataValue).then((data) => {
        // we should have received a result from the promise here now
        // and want to populate our property with it
        model[complexPropertyKey] = data;
      });
    });

    // we wait for all promises to finish
    // until we return our now fully populated model
    return Promise.all(promises).then(() => {
      model.setCreated(true);

      return model;
    });
  }

  store(model: T, adapter: IAdapter | null = null): Promise<T> {
    // lets get the data from our object here
    const data = this._schema.simpleFields().reduce((obj, key) => {
      obj[this._schema.get(key).name!] = model[key];
      return obj;
    }, {});

    // lets build the insert query and run it
    return Query.insert(data)
      .into(this._schema.getObject())
      .exec(adapter)
      .then((res) => {
        const data = res.objects[0];
        const keyField = this._schema.keyField();

        // we are now created :)
        model.setCreated(true);

        // set the keyfield to the new object id if possible
        if (
          keyField &&
          Object.hasOwnProperty.call(data, 'objectId') &&
          Object.hasOwnProperty.call(this, keyField)
        ) {
          this[keyField] = data.objectId;
        }

        // return the updated model as the promise result
        return model;
      });
  }

  update(model: T, adapter: IAdapter | null = null): Promise<T> {
    const keyField = this._schema.keyField();

    if (!keyField) {
      throw new KeyFieldMissingError();
    }

    const query = Query.update(this._schema.getObject());

    // fill query
    this._schema.simpleFields().forEach((key) => {
      query.set(this._schema.get(key).name!, model[key]);
    });

    // only this one
    query.where(this._schema.get(keyField).name!, this.keyOf(model));

    // return this
    return query.exec(adapter).then(() => {
      return model;
    });
  }
}
