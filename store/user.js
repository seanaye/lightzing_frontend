import { Person } from 'blockstack'

export const state = () => ({
  signedIn: false,
  userSession: null,
  userData: null,
  person: null
})

export const mutations = {
  M_SESSION (state, session) {
    state.userSession = session
  },
  INIT_USERDATA (state, userdata) {
    state.signedIn = true
    state.userData = userdata
    state.person = new Person(userdata.profile)
    state.person.username = userdata.username
  },
  LOGOUT (state) {
    state.userSession.signUserOut()
    state.signedIn = false
    state.userData = null
    state.person = null
  }
}

export const actions = {
  async INIT_SESSION ({ commit }) {
    const session = this.$createSession()
    commit('M_SESSION', session)
    if (session.isUserSignedIn()) {
      commit('INIT_USERDATA', session.loadUserData())
    } else if (session.isSignInPending()) {
      commit('INIT_USERDATA', await session.handlePendingSignIn())
    }
  }
}
