export function isOnline (): boolean {
  return /(cdnhtml|cloudfront.net)/gi.test(window.location.hostname)
}
