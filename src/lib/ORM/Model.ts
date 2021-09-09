import IAdapter from '../Adapters/IAdapter';

import { Repository } from './Repository';

/**
 * Raw Model data interface
 */
export interface ModelData {
  [key: string]: any;
}

/**
 * Model Constructor Interface
 */
export interface ModelConstructor<T extends Model> {
  new (data: ModelData): T;
}

/**
 * Base Model Class
 *
 * @abstract
 */
export abstract class Model {
  /**
   * Has the Model been popularized from CRM through the Repository?
   *
   * @protected
   */
  protected _created = false;

  /**
   * Setup model
   *
   * @param {ModelData} data
   */
  constructor(data: ModelData = {}) {
    Object.keys(data).forEach((key) => {
      this[key] = data[key];
    });

    this._created = false;
  }

  /**
   * Checks if the model is present in the CRM (so called "created")
   */
  isCreated(): boolean {
    return this._created;
  }

  /**
   * Sets Created status of the model
   *
   * @param {boolean} isCreated
   * @returns {this}
   */
  setCreated(isCreated: boolean): this {
    this._created = isCreated;

    return this;
  }

  /**
   * Returns Instance of Model repository
   *
   * @returns {Repository<T>}
   */
  repo<T extends Model>(): Repository<T> {
    return this.constructor.prototype._repository;
  }

  /**
   * Returns Instance of Model repository
   *
   * @returns {Repository<T>}
   */
  static repo<T extends Model>(): Repository<T> {
    return this.prototype.constructor.prototype._repository;
  }

  /**
   * Retrieve the identifying key (internal name)
   *
   * @returns {string | number | undefined}
   */
  getKey(): string | number | undefined {
    return this.repo().keyOf(this);
  }

  /**
   * Save model back to CRM
   *
   * @returns {Promise<this>}
   */
  async save(adapter: IAdapter | null = null): Promise<this> {
    const repo = this.repo();

    if (this.isCreated()) {
      await repo.update(this, adapter);
    } else {
      await repo.store(this, adapter);
    }

    return this;
  }
}
