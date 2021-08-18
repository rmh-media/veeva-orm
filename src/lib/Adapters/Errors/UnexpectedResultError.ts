export class UnexpectedResultError extends Error {
  public result: any = null;

  constructor(result: any) {
    super('Unexpected result from Veeva');

    this.result = result;

    this.name = 'UnexpectedResultError';
  }
}
