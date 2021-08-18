export function createCallbackId(): string {
  return (
    'vcb_' +
    Date.now().valueOf() +
    '_' +
    Math.random().toString(36).substring(7)
  );
}
