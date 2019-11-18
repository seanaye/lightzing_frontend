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
  },
  LOGOUT (state) {
    state.friends = []
    state.loadedFriends = []
  }
}

export const actions = {
  async ADD_FRIENDS ({ commit, rootState, state, dispatch }, { friends, loadProfiles }) {
    console.log(friends)
    const newFriends = [
      ...new Set(state.friends.concat(friends))
    ].filter(elem => elem !== rootState.user.userData.username)
    commit('M_FRIENDS', newFriends)
    const updated = await rootState.user.userSession.putFile('friends.json', JSON.stringify(newFriends))
    console.log(updated)
    if (loadProfiles) {
      dispatch('LOAD_PROFILES')
    }
  },
  async REMOVE_FRIEND ({ commit, rootState, state }, friend) {
    const newFriends = state.friends.filter(elem => elem !== friend)
    commit('M_FRIENDS', newFriends)
    await rootState.user.userSession.putFile('friends.json', JSON.stringify(newFriends))
  },
  async LOAD_FRIENDS ({ commit, rootState }) {
    console.log('load frinds')
    const file = await rootState.user.userSession.getFile('friends.json')
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
  },
  async LOAD_PROFILE ({ commit, state }, id) {
    const loaded = state.loadedFriends.filter(elem => elem === id)
    if (loaded.length === 0) {
      const userData = await lookupProfile(id)
      const person = new Person(userData)
      person.username = id
      commit('M_LOADED_FRIENDS', state.loadedFriends.concat(person))
    }
  }
}
