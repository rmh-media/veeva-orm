export enum VEEVA_ENV {
  ONLINE,
  DEVICE
}

function findEnvironment (): VEEVA_ENV {
  return /(cdnhtml|cloudfront.net)/gi.test(window.location.hostname)
    ? VEEVA_ENV.ONLINE
    : VEEVA_ENV.DEVICE
}

export const VEEVA_ENVIRONMENT = findEnvironment()
