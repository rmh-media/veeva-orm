import IAdapter from '../../../lib/Adapters/IAdapter';
import MockAdapter from '../../../lib/Adapters/MockAdapter';
import objects from '../objects';

export function getAdapter(): IAdapter {
  const adapter = new MockAdapter();

  Object.keys(objects).forEach((key) => {
    adapter.fill(key, JSON.parse(JSON.stringify(objects[key].objects)));
    adapter.setDefaultId(key, objects[key].currentId);
  });

  return adapter;
}
