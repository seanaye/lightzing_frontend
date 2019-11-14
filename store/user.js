import { Person } from 'blockstack'

export const state = () => ({
  signedIn: false,
  userSession: null,
  userData: null,
  person: null,
  currentStatus: '',
  friends: []
})

export const mutations = {
  M_SESSION (state, session) {
    state.userSession = session
  },
  M_CURRENT_STATUS (state, status) {
    state.currentStatus = status
  },
  M_FRIENDS (state, friends) {
    state.friends = friends
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
  async ADD_FRIENDS ({ commit, state }, friends) {
    console.log(state.friends)
    const newFriends = [...new Set([...state.friends, ...friends])]
    const updated = await state.userSession.putFile('friends.json', JSON.stringify(newFriends), { encrypt: false })
    console.log(updated)
    commit('M_FRIENDS', newFriends)
  },
  async LOAD_STATUS ({ commit, state }) {
    const file = await state.userSession.getFile('status.json', { decrypt: false })
    const status = JSON.parse(file)
    console.log(status)
    commit('M_CURRENT_STATUS', status.status)
  },
  async LOAD_FRIENDS ({ commit, state }) {
    const file = await state.userSession.getFile('friends.json', { decrypt: false })
    if (file) {
      const friends = JSON.parse(file)
      commit('M_FRIENDS', friends)
    }
  }
}
