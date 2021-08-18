import IAdapter from '../Adapters/IAdapter';

import { Repository } from './Repository';
// import SelectQuery from '../Queries/SelectQuery'

export interface ModelData {
  [key: string]: any;
}

export interface ModelConstructor<T extends Model> {
  new (data: ModelData): T;

  _repository: Repository<T>;
}

export class Model {
  _created = false;
  static _repository: any; // todo better typing here, challenge: Repositories are generics

  constructor(data: ModelData = {}) {
    Object.keys(data).forEach((key) => {
      this[key] = data[key];
    });

    this._created = false;
  }

  static repo(): any {
    return {};
  }

  /**
   * Checks if the model is present in the CRM (so called "created")
   */
  isCreated(): boolean {
    return this._created;
  }

  /**
   * Retrieve the identifying key (internal name)
   */
  getKey(): string | number | undefined {
    return (this.constructor as typeof Model).repo().keyOf(this);
  }

  repo(): Repository<Model> {
    return (this.constructor as typeof Model).repo();
  }

  /**
   * Save model
   *
   * @return boolean
   */
  save(adapter: IAdapter | null = null): Promise<Model> {
    const repo = this.repo();

    return this.isCreated()
      ? repo.update(this, adapter)
      : repo.store(this, adapter);
  }
}
