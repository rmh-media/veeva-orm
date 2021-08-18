import { AdapterQuery } from './AdapterQuery';
import AdapterResult from './AdapterResult';

export default interface IAdapter {
  runQuery(query: AdapterQuery): Promise<AdapterResult>;
}
