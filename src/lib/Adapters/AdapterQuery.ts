export enum QueryType {
  SELECT,
  SELECT_CURRENT
}

export interface Term {
  operator: string,
  value: unknown,
  field: string
}

export default interface AdapterQuery {
  type: QueryType,
  where: Array<Array<Term>>
  object: string | null,
  fields: Array<string>,
  values: {string: string} | null
}
