export enum QueryType {
  SELECT,
  SELECT_CURRENT
}

export interface Term {
  operator: string,
  value: unknown,
  field: string
}

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export interface AdapterQuery {
  type: QueryType,
  where: Array<Array<Term>>
  object: string,
  fields: Array<string>,
  values: Map<string, string>
  limit: number | null,
  sort: Map<string, SortDirection>
}
