import blockstack from 'blockstack'

export default (ctx, inject) => {
  inject('createSession', () => {
    const appConfig = new blockstack.AppConfig(
      ['store_write', 'publish_data'],
      'http://localhost:3000',
      '/block'
    )
    return new blockstack.UserSession(appConfig)
  })
}
