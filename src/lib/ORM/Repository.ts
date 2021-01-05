import { Model } from './Model'

export class Repository {
  private _modelClass: typeof Model

  constructor (modelClass: typeof Model) {
    this._modelClass = modelClass
  }
}
