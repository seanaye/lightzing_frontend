import { lookupProfile, Person } from 'blockstack'

export const state = () => ({
  friends: [],
  loadedFriends: []
})

export const mutations = {
  M_FRIENDS (state, friends) {
    state.friends = friends
  },
  M_LOADED_FRIENDS (state, loadedFriends) {
    state.loadedFriends = loadedFriends
  }
}

export const actions = {
  async ADD_FRIENDS ({ commit, rootState, dispatch, state }, friends) {
    console.log(friends)
    const newFriends = [
      ...new Set(state.friends.concat(friends))
    ].filter(elem => elem !== rootState.user.userData.username)
    const updated = await rootState.user.userSession.putFile('friends.json', JSON.stringify(newFriends), { encrypt: false })
    console.log(updated)
    commit('M_FRIENDS', newFriends)
    dispatch('LOAD_PROFILES')
  },
  async LOAD_FRIENDS ({ commit, rootState }) {
    console.log('load frinds')
    const file = await rootState.user.userSession.getFile('friends.json', { decrypt: false })
    const friends = JSON.parse(file)
    commit('M_FRIENDS', friends)
  },
  async LOAD_PROFILES ({ commit, state, dispatch }) {
    if (state.friends.length === 0) {
      await dispatch('LOAD_FRIENDS')
    }
    const loadedFriends = state.friends.map(async (id) => {
      const userData = await lookupProfile(id)
      console.log(userData)
      const person = new Person(userData)
      person.username = id
      return person
    })
    commit('M_LOADED_FRIENDS', await Promise.all(loadedFriends))
  }
}
