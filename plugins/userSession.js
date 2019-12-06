import blockstack from 'blockstack'

export default (ctx, inject) => {
  inject('createSession', () => {
    const appConfig = new blockstack.AppConfig(
      ['store_write', 'publish_data', 'email'],
      window.location.origin,
      '/dashboard',
      '/manifest.json'
    )
    console.log({ appConfig })
    return new blockstack.UserSession({ appConfig })
  })
  inject('blockstack', () => {
    return blockstack
  })
}
