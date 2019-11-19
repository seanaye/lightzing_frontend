import { Person, hexStringToECPair } from 'blockstack'

export const state = () => ({
  userSession: null,
  userData: null,
  person: null,
  currentStatus: '',
  redirect: '',
  hasPublicKey: false
})

export const mutations = {
  CREATE_SESSION (state) {
    state.userSession = this.$createSession()
  },
  M_CURRENT_STATUS (state, status) {
    state.currentStatus = status
  },
  INIT_USERDATA (state, userdata) {
    state.userData = userdata
    state.person = new Person(userdata.profile)
    console.log(state.person)
  },
  LOGOUT (state) {
    state.userSession.signUserOut()
    state.signedIn = false
    state.userData = null
    state.person = null
    state.userSession = null
  },
  M_REDIRECT_URL (state, url) {
    state.redirect = url
  },
  M_HAS_PUBLIC (state, value) {
    state.hasPublicKey = value
  }
}

export const actions = {
  async UPDATE_STATUS ({ commit, state }, newStatus) {
    const status = {
      status: newStatus,
      created: Date.now()
    }
    const updated = await state.userSession.putFile('status.json', JSON.stringify(status), { encrypt: false })
    console.log(updated)
    commit('M_CURRENT_STATUS', status.status)
  },
  async LOAD_STATUS ({ commit, state }) {
    const file = await state.userSession.getFile('status.json', { decrypt: false })
    const status = JSON.parse(file)
    console.log(status)
    commit('M_CURRENT_STATUS', status.status)
  },
  LOGOUT ({ commit }) {
    commit('LOGOUT')
    commit('friends/LOGOUT', '', { root: true })
  },
  async ENSURE_PUBLIC_KEY ({ state, commit }) {
    if (state.hasPublicKey) {
      return
    }
    const file = await state.userSession.getFile('public_key.json', { decrypt: false }).catch(e => console.log(e))
    if (!file) {
      console.log('putting public key')
      const appPublicKey = hexStringToECPair(state.userData.appPrivateKey).publicKey.toString('hex')
      const r = await state.userSession.putFile('public_key.json', JSON.stringify({ appPublicKey }), { sign: true }).catch(e => console.log(e))
      if (r) {
        commit('M_HAS_PUBLIC', true)
      }
    } else {
      commit('M_HAS_PUBLIC', true)
    }
  }
}

export const getters = {
  userObj (state) {
    if (state.person) {
      return {
        username: state.userData.username,
        name: state.person.name(),
        description: state.person.description(),
        avatarUrl: state.person.avatarUrl() || 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
      }
    } else {
      return {}
    }
  }
}
