import { SortDirection, Term } from '../AdapterQuery';

function formatBooleanValue(v: boolean): string {
  return v ? 'true' : 'false';
}

function formatValue(value: any): string {
  if (typeof value === 'boolean') {
    return formatBooleanValue(value as boolean);
  }

  if (typeof value === 'number') {
    return value + '';
  }

  return `'${value}'`;
}

function buildWhereTerm(t: Term): string {
  if (t.operator.toUpperCase() === 'IN') {
    const stringifiedValues = (t.value as Array<any>)
      .map((v) => {
        return JSON.stringify(formatValue(v));
      })
      .join(',');

    return `${t.field} IN '{ ${stringifiedValues} }'`;
  }

  return `${t.field} ${t.operator} ${formatValue(t.value)}`;
}

export function buildWhereClause(termGroups: Array<Array<Term>>): string {
  const clause = termGroups
    .map((terms) => {
      return `(${terms.map(buildWhereTerm).join(' AND ')})`;
    })
    .join(' OR ');

  return clause.length ? 'WHERE ' + clause : '';
}

export function buildSortClause(sort: Map<string, SortDirection>) {
  const items: string[] = [];

  for (const [key, value] of sort) {
    items.push(`${key} ${value}`);
  }

  return items;
}
