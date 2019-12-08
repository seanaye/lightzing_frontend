import crypto from 'crypto'
import { decryptContent, encryptContent } from 'blockstack'

const retrievePost = async (poster, postee, keyObj, userSession) => {
  if (!keyObj) {
    return []
  }
  const postPath = `post/${postee.replace(/\./g, '_')}.hex`
  const options = {
    decrypt: false,
    verify: true,
    username: poster
  }
  const cipherText = await userSession.getFile(postPath, options)
    .catch((e) => {
      console.error(e)
      return []
    })
  if (!cipherText) {
    return []
  }
  const cipher = crypto.createDecipheriv(
    'aes-256-cbc',
    keyObj.key,
    keyObj.iv
  )
  const payment = JSON.parse(cipher.update(cipherText, 'hex', 'utf-8') + cipher.final('utf-8'))
  return payment
}

const retrieveKey = async (poster, postee, owned, userSession) => {
  const keyPath = (owned)
    ? `post/${postee.replace(/\./g, '_')}_personalkey.json`
    : `post/${postee.replace(/\./g, '_')}_cipherkey.json`
  const options = {
    decrypt: owned,
    verify: true,
    username: poster
  }
  const cipherKeyText = await userSession.getFile(keyPath, options)
    .catch((e) => {
      console.error(e)
      return false
    })
  if (!cipherKeyText) {
    return false
  }
  const cipherKey = (owned) ? cipherKeyText : decryptContent(cipherKeyText)
  const cipherKeyString = JSON.parse(cipherKey)
  return {
    iv: Buffer.from(cipherKeyString.iv, 'hex'),
    key: Buffer.from(cipherKeyString.key, 'hex')
  }
}

export const state = () => ({
  payments: {},
  isPosting: false,
  postSuccessFail: 0,
  isLoading: 0,
  allLoaded: false
})

export const mutations = {
  ADD_PAYMENT (state, { poster, postee, payment }) {
    const key = `${poster}->${postee}`
    state.payments[key] = payment
  },
  IS_POSTING (state, { isPosting, postSuccessFail }) {
    state.isPosting = isPosting
    state.postSuccessFail = postSuccessFail
  },
  IS_LOADING (state, bool) {
    if (bool) {
      state.isLoading += 1
    } else {
      state.isLoading -= 1
    }
  },
  ALL_LOADED (state, bool) {
    state.allLoaded = bool
  }
}

export const actions = {
  async POST_PAYMENT ({ commit, rootState, state, rootGetters }, { amount, from, desc, to, currency, poster }) {
    if (state.isPosting) {
      return
    }
    commit('IS_POSTING', { isPosting: true, postSuccessFail: 0 })
    // get public key of the other other
    const pubkey = rootGetters['friends/loadedObj'].reduce((acc, elem) => {
      return (elem.username === from) ? elem.pubkey : acc
    }, '')
    const newPost = {
      amount,
      desc,
      from,
      to,
      time: new Date().getTime(),
      currency,
      poster
    }
    const keyObj = await retrieveKey(
      rootState.user.userData.username,
      from,
      true,
      rootState.user.userSession
    )
    const curPayment = await retrievePost(
      rootState.user.userData.username,
      from,
      keyObj,
      rootState.user.userSession
    )
    const post = [...curPayment, newPost]
    // Create post data

    // create key
    const keyData = keyObj || {
      iv: crypto.randomBytes(16),
      key: crypto.randomBytes(32)
    }
    // symmetrically encrypt and store the data publicly
    const cipher = crypto.createCipheriv('aes-256-cbc', keyData.key, keyData.iv)
    const cipherText = cipher.update(JSON.stringify(post), 'utf-8', 'hex') + cipher.final('hex')
    await rootState.user.userSession.putFile(`post/${from.replace(/\./g, '_')}.hex`, cipherText, { sign: true, encrypt: false })
      .catch((e) => {
        console.error(e)
        commit('IS_POSTING', { isPosting: false, postSuccessFail: -1 })
      })

    // Encrypt and store symmetric key for the other user
    const stringifiedKey = {
      iv: keyData.iv.toString('hex'),
      key: keyData.key.toString('hex')
    }
    const keyDataCipherTextObject = encryptContent(JSON.stringify(stringifiedKey), { publicKey: pubkey })
    await rootState.user.userSession.putFile(
      `post/${from.replace(/\./g, '_')}_cipherkey.json`,
      keyDataCipherTextObject,
      { sign: true, encrypt: false }
    ).catch((e) => {
      console.error(e)
      commit('IS_POSTING', { isPosting: false, postSuccessFail: -1 })
    })
    await rootState.user.userSession.putFile(
      `post/${from.replace(/\./g, '_')}_personalkey.json`,
      JSON.stringify(stringifiedKey),
      { sign: true }
    ).catch((e) => {
      console.error(e)
      commit('IS_POSTING', { isPosting: false, postSuccessFail: -1 })
    })
    commit('ADD_PAYMENT', newPost)
    commit('IS_POSTING', { isPosting: false, postSuccessFail: 1 })
  },
  async LOAD_OTHER_PAYMENT ({ commit, rootState }, id) {
    console.log('load other payment')
    commit('IS_LOADING', true)
    const username = rootState.user.userData.username
    const keyObj = await retrieveKey(
      id,
      username,
      false,
      rootState.user.userSession
    )
    console.log({ otherKey: keyObj })
    const payment = await retrievePost(
      id,
      username,
      keyObj,
      rootState.user.userSession
    )
    if (payment) {
      commit('ADD_PAYMENT', { poster: id, postee: username, payment })
    }
    commit('IS_LOADING', false)
  },
  async LOAD_SELF_PAYMENT ({ commit, rootState }, id) {
    console.log('load self payment')
    commit('IS_LOADING', true)
    const username = rootState.user.userData.username
    const keyObj = await retrieveKey(
      username,
      id,
      true,
      rootState.user.userSession
    )
    console.log({ selfKey: keyObj })
    const payment = await retrievePost(
      username,
      id,
      keyObj,
      rootState.user.userSession
    )
    console.log({ selfPayment: payment })
    if (payment) {
      commit('ADD_PAYMENT', { poster: username, postee: id, payment })
    }
    commit('IS_LOADING', false)
  }
}

export const getters = {
  sortedPayments (state) {
    const arr = Object.values(state.payments)
    return arr.flat().sort((a, b) => {
      if (a.time > b.time) {
        return -1
      } else {
        return 1
      }
    })
  }
}