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
  isLoading: 0
})

export const mutations = {
  M_PAYMENT (state, { poster, postee, payment }) {
    const key = `${poster}->${postee}`
    state.payments = { ...state.payments, [key]: payment }
  },
  IS_POSTING (state, { isPosting, postSuccessFail }) {
    state.isPosting = isPosting
    if (typeof postSuccessFail !== 'undefined') {
      state.postSuccessFail = postSuccessFail
    }
  },
  IS_LOADING (state, bool) {
    if (bool) {
      state.isLoading += 1
    } else {
      state.isLoading -= 1
    }
  }
}

export const actions = {
  async NEW_PAYMENT ({ commit, rootState, dispatch }, { amount, from, desc, to, currency, poster }) {
    commit('IS_POSTING', { isPosting: true, postSuccessFail: 0 })

    // Create payment obj
    const newPost = {
      amount,
      desc,
      from,
      to,
      time: new Date().getTime(),
      currency,
      poster,
      paid: false
    }
    // retrieve existing posts
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
    // concat new post to existing and post
    const paymentObj = [...curPayment, newPost]

    commit('M_PAYMENT', {
      poster: rootState.user.userData.username,
      postee: from,
      payment: paymentObj
    })

    await dispatch('POST_PAYMENT', { from, paymentObj, keyObj })
    commit('IS_POSTING', { isPosting: false })
  },
  async POST_PAYMENT ({ commit, rootState, rootGetters }, { from, paymentObj, keyObj }) {
    commit('IS_POSTING', { isPosting: true, postSuccessFail: 0 })

    // get public key of the other other
    const pubkey = rootGetters['friends/loadedObj'].reduce((acc, elem) => {
      return (elem.username === from) ? elem.pubkey : acc
    }, '')

    // create key
    const keyData = keyObj || {
      iv: crypto.randomBytes(16),
      key: crypto.randomBytes(32)
    }
    // symmetrically encrypt and store the data publicly
    const cipher = crypto.createCipheriv('aes-256-cbc', keyData.key, keyData.iv)
    const cipherText = cipher.update(JSON.stringify(paymentObj), 'utf-8', 'hex') + cipher.final('hex')
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
    // encrypt symetric key with other users pubkey
    const keyDataCipherTextObject = encryptContent(JSON.stringify(stringifiedKey), { publicKey: pubkey })
    await rootState.user.userSession.putFile(
      `post/${from.replace(/\./g, '_')}_cipherkey.json`,
      keyDataCipherTextObject,
      { sign: true, encrypt: false }
    ).catch((e) => {
      console.error(e)
      commit('IS_POSTING', { isPosting: false, postSuccessFail: -1 })
    })
    // encrypt symmetric key for local user
    await rootState.user.userSession.putFile(
      `post/${from.replace(/\./g, '_')}_personalkey.json`,
      JSON.stringify(stringifiedKey),
      { sign: true }
    ).catch((e) => {
      console.error(e)
      commit('IS_POSTING', { isPosting: false, postSuccessFail: -1 })
    })
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
    const payment = await retrievePost(
      id,
      username,
      keyObj,
      rootState.user.userSession
    )
    if (payment) {
      commit('M_PAYMENT', { poster: id, postee: username, payment })
    }
    commit('IS_LOADING', false)
  },
  async LOAD_SELF_PAYMENT ({ commit, rootState }, id) {
    commit('IS_LOADING', true)
    const username = rootState.user.userData.username
    const keyObj = await retrieveKey(
      username,
      id,
      true,
      rootState.user.userSession
    )
    const payment = await retrievePost(
      username,
      id,
      keyObj,
      rootState.user.userSession
    )
    if (payment) {
      commit('M_PAYMENT', { poster: username, postee: id, payment })
    }
    commit('IS_LOADING', false)
  },
  async REMOVE_PAYMENT ({ commit, rootState, state, dispatch }, { poster, postee, index }) {
    console.log({ poster, postee, index })
    const key = `${poster}->${postee}`
    const newFile = state.payments[key].filter((elem, i) => {
      return i !== index
    })
    console.log({ newFile })
    commit('M_PAYMENT', { poster, postee, payment: newFile })

    const keyObj = await retrieveKey(
      rootState.user.userData.username,
      postee,
      true,
      rootState.user.userSession
    )

    await dispatch('POST_PAYMENT', { from: postee, paymentObj: newFile, keyObj })
  }
}

export const getters = {
  sortedPayments (state) {
    const arr = Object.values(state.payments)
    console.log({ arr })
    const mapped = arr.map((lst) => {
      return lst.map((payment, i) => {
        return { ...payment, index: i }
      })
    })
    return mapped.flat().sort((a, b) => {
      if (a.time > b.time) {
        return -1
      } else {
        return 1
      }
    })
  },
  totalReceivable (state, getters, rootState) {
    const toMe = getters.sortedPayments.filter((elem) => {
      return elem.to === rootState.user.userData.username
    })
    return toMe.reduce((acc, elem) => {
      if (elem.currency === 'satoshi') {
        return acc + elem.amount * 0.00000001 / rootState.exchangeRate
      } else {
        return acc + elem.amount
      }
    }, 0)
  },
  totalPayable (state, getters, rootState) {
    const fromMe = getters.sortedPayments.filter((elem) => {
      return elem.from === rootState.user.userData.username
    })
    return fromMe.reduce((acc, elem) => {
      if (elem.currency === 'satoshi') {
        return acc + elem.amount * 0.00000001 / rootState.exchangeRate
      } else {
        return acc + elem.amount
      }
    }, 0)
  },
  netAmount (state, getters) {
    return getters.totalReceivable - getters.totalPayable
  }
}
