export class MissingPropertyError extends Error {
  public result: any = null;

  constructor(property: string, result: any) {
    super(`Property ${property} is missing`);

    this.result = result;
    this.name = 'MissingPropertyError';
  }
}
