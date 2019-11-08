import blockstack from 'blockstack'
import Vue from 'vue'

const appConfig = new blockstack.AppConfig(
  ['store_write', 'publish_data'],
  'http://localhost:3000',
  '/block'
)
Vue.prototype.$userSession = new blockstack.UserSession({ appConfig })
Vue.prototype.$blockstack = blockstack
