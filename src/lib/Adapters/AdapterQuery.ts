export enum QueryType {
  SELECT,
  SELECT_CURRENT,
  INSERT,
  DELETE,
  UPDATE,
  UPDATE_CURRENT,
}

export interface Term {
  operator: string;
  value: any;
  field: string;
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

export interface AdapterQuery {
  type: QueryType;
  where: Array<Array<Term>>;
  object: string;
  fields: Array<string>;
  values: Map<string, string | number | boolean>;
  limit: number | null;
  sort: Map<string, SortDirection>;
}
