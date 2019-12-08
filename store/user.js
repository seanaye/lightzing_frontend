import { Person, decodeToken, hexStringToECPair } from 'blockstack'

export const state = () => ({
  userSession: null,
  userData: null,
  person: null,
  currentStatus: '',
  redirect: '',
  pubkey: '',
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
    const decodedToken = decodeToken(userdata.authResponseToken)
    state.pubkey = decodedToken.payload.public_keys[0]
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
  M_HAS_PUBLIC (state, bool) {
    state.hasPublicKey = bool
  }
}

export const actions = {
  async UPDATE_STATUS ({ commit, state }, newStatus) {
    const status = {
      status: newStatus,
      created: Date.now()
    }
    const updated = await state.userSession.putFile('status.json', JSON.stringify(status), { encrypt: false })
    commit('M_CURRENT_STATUS', status.status)
  },
  async LOAD_STATUS ({ commit, state }) {
    const file = await state.userSession.getFile('status.json', { decrypt: false })
    const status = JSON.parse(file)
    commit('M_CURRENT_STATUS', status.status)
  },
  LOGOUT ({ commit }) {
    commit('LOGOUT')
    commit('friends/LOGOUT', '', { root: true })
    this.$router.push('/')
  },
  async ENSURE_PUBLIC_KEY ({ state, commit }) {
    // if (state.hasPublicKey) {
    //   return
    // }
    const file = await state.userSession.getFile('publicKey.json', { decrypt: false, verify: true })
      .catch(e => console.error(e))
    if (!file || file) {
      console.log('putting public key')
      const appPublicKey = hexStringToECPair(state.userData.appPrivateKey).publicKey.toString('hex')
      const publicKeyData = { appPublicKey }
      const r = await state.userSession.putFile(
        'publicKey.json',
        JSON.stringify(publicKeyData),
        { sign: true, encrypt: false }
      )
        .catch(e => console.error(e))
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
