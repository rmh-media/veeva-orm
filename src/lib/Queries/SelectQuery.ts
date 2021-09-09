import { QueryType, SortDirection } from '../Adapters/AdapterQuery';
import AdapterResult from '../Adapters/AdapterResult';
import IAdapter from '../Adapters/IAdapter';
import { VeevaObjectFieldMissingError } from '../ORM/Errors/VeevaObjectFieldMissingError';

import QueryWithWhereClause from './QueryWithWhereClause';

/**
 * Represents a Select query which can be used to get data for
 * current call objects or default/custom object data.
 */
export default class SelectQuery extends QueryWithWhereClause {
  constructor(fields: Array<string>) {
    super();

    this._adapterQuery.fields = fields;
  }

  /**
   * Enable or disable usage of current call data.
   *
   * @param shouldUseCurrentCallData
   */
  current(shouldUseCurrentCallData = true): SelectQuery {
    if (shouldUseCurrentCallData) {
      this._adapterQuery.type = QueryType.SELECT_CURRENT;
    } else {
      this._adapterQuery.type = QueryType.SELECT;
    }

    return this;
  }

  from(object: string): this {
    this._adapterQuery.object = object;

    return this;
  }

  fromCurrent(object: string): this {
    this._adapterQuery.object = object;
    this._adapterQuery.type = QueryType.SELECT_CURRENT;

    return this;
  }

  orderBy(field: string, direction: SortDirection = SortDirection.ASC): this {
    this._adapterQuery.sort.set(field, direction);

    return this;
  }

  firstOrFail(): Promise<AdapterResult> {
    return this.exec().then((result) => {
      if (result.objects.length < 1) {
        throw new VeevaObjectFieldMissingError(this._adapterQuery.object);
      }

      return result.objects[0];
    });
  }

  limit(limit: number): this {
    this._adapterQuery.limit = limit;

    return this;
  }

  async count(adapter: IAdapter | null = null): Promise<number> {
    const items = await this.exec(adapter);

    return items.objects.length;
  }
}
