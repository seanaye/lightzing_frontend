import { Person, hexStringToECPair } from 'blockstack'

export const state = () => ({
  signedIn: false,
  userSession: null,
  userData: null,
  person: null,
  currentStatus: ''
})

export const mutations = {
  M_SESSION (state, session) {
    state.userSession = session
  },
  M_CURRENT_STATUS (state, status) {
    state.currentStatus = status
  },
  INIT_USERDATA (state, userdata) {
    state.signedIn = true
    state.userData = userdata
    state.person = new Person(userdata.profile)
    console.log(state.person)
  },
  LOGOUT (state) {
    state.userSession.signUserOut()
    state.signedIn = false
    state.userData = null
    state.person = null
  }
}

export const actions = {
  async INIT_SESSION ({ commit, state, dispatch }) {
    const session = this.$createSession()
    commit('M_SESSION', session)
    if (session.isUserSignedIn()) {
      commit('INIT_USERDATA', session.loadUserData())
    } else if (session.isSignInPending()) {
      commit('INIT_USERDATA', await session.handlePendingSignIn())
    } else {
      // Delete this in favor of login dialog in root state
      state.userSession.redirectToSignIn(window.location.href)
    }
    await dispatch('ENSURE_PUBLIC_KEY')
  },
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
  async ENSURE_PUBLIC_KEY ({ state }) {
    const file = await state.userSession.getFile('public_key.json', { decrypt: false })
    console.log(file)
    if (!file) {
      console.log('putting public key')
      const appPublicKey = hexStringToECPair(state.userData.appPrivateKey).publicKey.toString('hex')
      await state.userSession.putFile('public_key.json', JSON.stringify({ appPublicKey }), { sign: true })
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
