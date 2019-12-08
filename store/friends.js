import { lookupProfile, Person } from 'blockstack'

export const state = () => ({
  friends: [],
  loadedProfiles: [],
  isLoading: 0,
  loadingAll: false
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
  },
  M_LOADING_ALL (state, value) {
    state.loadingAll = value
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
      .catch(e => console.error(e))
    console.log(updated)
    if (loadProfiles) {
      dispatch('LOAD_FRIENDS_PROFILES')
    }
    commit('M_ISLOADING', false)
  },
  async REMOVE_FRIEND ({ commit, rootState, state }, friend) {
    commit('M_ISLOADING', true)
    const newFriends = state.friends.filter(elem => elem !== friend)
    commit('M_FRIENDS', newFriends)
    await rootState.user.userSession.putFile('friends.json', JSON.stringify(newFriends))
      .catch(e => console.error(e))
    commit('M_ISLOADING', false)
  },
  async LOAD_FRIENDS ({ commit, rootState, dispatch }, { loadProfiles }) {
    commit('M_ISLOADING', true)
    console.log('load frinds')
    const file = await rootState.user.userSession.getFile('friends.json')
      .catch(e => console.error(e))
    const friends = JSON.parse(file)
    commit('M_FRIENDS', friends || [])
    if (loadProfiles) {
      await dispatch('LOAD_FRIENDS_PROFILES')
    }
    commit('M_ISLOADING', false)
  },
  async LOAD_PROFILE ({ commit, state, rootState }, id) {
    if (!state.loadedProfiles.map(elem => elem.username).includes(id)) {
      commit('M_ISLOADING', true)
      const userData = await lookupProfile(id)
        .catch(e => console.error(e))
      const person = new Person(userData)
      person.username = id
      const pubKey = await rootState.user.userSession.getFile('publicKey.json', { username: id, verify: true, decrypt: false })
        .catch(e => console.log(e))
      console.log({ pubKey })
      if (pubKey) {
        person.pubkey = JSON.parse(pubKey).appPublicKey
      } else {
        console.error(`Could not retrive public key for ${id}`)
      }
      if (!state.loadedProfiles.map(elem => elem.username).includes(id)) {
        commit('M_LOADED_PROFILES', state.loadedProfiles.concat(person))
      }
      commit('M_ISLOADING', false)
    }
  },
  async LOAD_FRIENDS_PROFILES ({ getters, state, dispatch, commit }) {
    if (state.loadingAll) {
      return
    }
    commit('M_LOADING_ALL', true)
    const loaded = getters.loadedObj.map(elem => elem.username)
    const toLoad = state.friends.filter(elem => !loaded.includes(elem))
    for (const id of toLoad) {
      await dispatch('LOAD_PROFILE', id)
      console.log(`loaded ${id}`)
    }
    commit('M_LOADING_ALL', false)
  }
}

export const getters = {
  loadedObj (state) {
    return state.loadedProfiles.map((elem) => {
      return {
        name: elem.name() || elem.username,
        description: elem.description(),
        avatarUrl: elem.avatarUrl() || 'https://s3.amazonaws.com/onename/avatar-placeholder.png',
        username: elem.username,
        pubkey: elem.pubkey
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
        username: elem.username,
        pubkey: elem.pubkey
      }
    })
  }
}
