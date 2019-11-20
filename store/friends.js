import { lookupProfile, Person } from 'blockstack'

export const state = () => ({
  friends: [],
  loadedProfiles: [],
  isLoading: 0
})

export const mutations = {
  M_FRIENDS (state, friends) {
    state.friends = friends
  },
  M_LOADED_PROFILES (state, loadedProfiles) {
    state.loadedProfiles = loadedProfiles
  },
  LOGOUT (state) {
    state.friends = []
    state.loadedProfiles = []
  },
  M_ISLOADING (state, value) {
    if (value) {
      state.isLoading += 1
    } else {
      state.isLoading -= 1
    }
  }
}

export const actions = {
  async ADD_FRIENDS ({ commit, rootState, state, dispatch }, { friends, loadProfiles }) {
    commit('M_ISLOADING', true)
    const newFriends = [
      ...new Set(state.friends.concat(friends))
    ].filter(elem => elem !== rootState.user.userData.username)
    commit('M_FRIENDS', newFriends)
    const updated = await rootState.user.userSession.putFile('friends.json', JSON.stringify(newFriends))
    console.log(updated)
    if (loadProfiles) {
      dispatch('LOAD_FRIENDS_PROFILES')
    }
    commit('M_ISLOADING', false)
  },
  async REMOVE_FRIEND ({ commit, rootState, state }, friend) {
    const newFriends = state.friends.filter(elem => elem !== friend)
    commit('M_FRIENDS', newFriends)
    await rootState.user.userSession.putFile('friends.json', JSON.stringify(newFriends))
  },
  async LOAD_FRIENDS ({ commit, rootState, dispatch }, { loadProfiles }) {
    commit('M_ISLOADING', true)
    console.log('load frinds')
    const file = await rootState.user.userSession.getFile('friends.json')
    const friends = JSON.parse(file)
    commit('M_FRIENDS', friends || [])
    if (loadProfiles) {
      dispatch('LOAD_FRIENDS_PROFILES')
    }
    commit('M_ISLOADING', false)
  },
  async LOAD_PROFILE ({ commit, state }, id) {
    commit('M_ISLOADING', true)
    if (!state.loadedProfiles.reduce((acc, elem) => { return acc || elem.username === id }, false)) {
      const userData = await lookupProfile(id)
      const person = new Person(userData)
      person.username = id
      commit('M_LOADED_PROFILES', state.loadedProfiles.concat(person))
    }
    commit('M_ISLOADING', false)
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
    return state.loadedProfiles.map((elem) => {
      return {
        name: elem.name() || elem.username,
        description: elem.description(),
        avatarUrl: elem.avatarUrl() || 'https://s3.amazonaws.com/onename/avatar-placeholder.png',
        username: elem.username
      }
    })
  },
  loadedFriends (state) {
    return state.loadedProfiles.filter((elem) => {
      return state.friends.includes(elem.username)
    })
  },
  loadedFriendsObj (state, getters) {
    return getters.loadedFriends.map((elem) => {
      return {
        name: elem.name() || elem.username,
        description: elem.description(),
        avatarUrl: elem.avatarUrl() || 'https://s3.amazonaws.com/onename/avatar-placeholder.png',
        username: elem.username
      }
    })
  }
}
