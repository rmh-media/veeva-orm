export enum QueryType {
  SELECT,
  SELECT_CURRENT,
  INSERT,
  DELETE
}

export interface Term {
  operator: string,
  value: any,
  field: string
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface InsertValues {
  [key: string]: number | string | boolean
}

export interface AdapterQuery {
  type: QueryType,
  where: Array<Array<Term>>
  object: string,
  fields: Array<string>,
  values: InsertValues,
  limit: number | null,
  sort: Map<string, SortDirection>
}
