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
      dispatch('LOAD_FRIENDS_PROFILES')
    }
  },
  async REMOVE_FRIEND ({ commit, rootState, state }, friend) {
    const newFriends = state.friends.filter(elem => elem !== friend)
    commit('M_FRIENDS', newFriends)
    await rootState.user.userSession.putFile('friends.json', JSON.stringify(newFriends))
  },
  async LOAD_FRIENDS ({ commit, rootState, dispatch }, { loadProfiles }) {
    console.log('load frinds')
    const file = await rootState.user.userSession.getFile('friends.json')
    const friends = JSON.parse(file)
    commit('M_FRIENDS', friends || [])
    if (loadProfiles) {
      dispatch('LOAD_FRIENDS_PROFILES')
    }
  },
  async LOAD_PROFILE ({ commit, state }, id) {
    const userData = await lookupProfile(id)
    const person = new Person(userData)
    person.username = id
    commit('M_LOADED_FRIENDS', state.loadedFriends.concat(person))
  },
  LOAD_FRIENDS_PROFILES ({ getters, state, dispatch }) {
    const loaded = getters.loadedObj.map(elem => elem.username)
    const toLoad = state.friends.filter(elem => !loaded.includes(elem))
    for (let i = 0; i < toLoad.length; i++) {
      dispatch('LOAD_PROFILE', toLoad[i])
    }
  }
}

export const getters = {
  loadedObj (state) {
    return state.loadedFriends.map((elem) => {
      return {
        name: elem.name() || elem.username,
        description: elem.description(),
        avatarUrl: elem.avatarUrl() || 'https://s3.amazonaws.com/onename/avatar-placeholder.png',
        username: elem.username
      }
    })
  }
}
