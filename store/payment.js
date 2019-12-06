import crypto from 'crypto'
import { decryptContent, encryptContent } from 'blockstack'

const retrievePost = async (id, owned, userSession) => {
  const keyPath = (owned) ?
    `post/${id.replace(/\./g, '_')}_personalkey.json` :
    `post/${id.replace(/\./g, '_')}_cipherkey.json`
  const postPath = `post/${id.replace(/\./g, '_')}.hex`
  const options = {
    decrypt: owned,
    verify: true,
    username: id
  }
  const cipherKeyText = await userSession.getFile(keyPath, options)
    .catch(e => console.error(e))
  if (!cipherKeyText) {
    return false
  }
  const key = JSON.parse(decryptContent(cipherKeyText))
  const cipherText = await userSession.getFile(postPath, options)
    .catch(e => console.error(e))
  const cipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(key.key, 'hex'),
    Buffer.from(key.iv, 'hex')
  )
  const payment = JSON.parse(cipher.update(cipherText, 'hex', 'utf-8') + cipher.final('utf-8'))
  console.log({ payment })
  return payment
}

export const state = () => ({
  payments: [],
  posting: false
})

export const mutations = {
  ADD_PAYMENT (state, payment) {
    state.payments = state.payments.concat(payment)
  },
  IS_POSTING (state, bool) {
    state.posting = bool
  }
}

export const actions = {
  async POST_PAYMENT ({ commit, rootState, state, rootGetters }, { amount, id, desc, to }) {
    if (state.posting && !state.posting) {
      return
    }
    commit('IS_POSTING', true)
    // get public key of the other other
    const pubkey = rootGetters['friends/loadedObj'].reduce((acc, elem) => {
      return (elem.username === id) ? elem.pubkey : acc
    }, '')
    console.log({ otherpubkey: pubkey })
    const curPayment = await rootState.user.userSession.getFile(`post_/${id.replace(/\./g, '_')}`)
      .catch(e => console.error(e))
    if (curPayment) {

    }
    // Create post data
    const post = {
      amount,
      desc,
      id,
      to,
      time: new Date().getTime()
    }
    // create key
    const keyData = {
      iv: crypto.randomBytes(16),
      key: crypto.randomBytes(32)
    }
    // symmetrically encrypt and store the data publicly
    console.log({ keyData })
    const cipher = crypto.createCipheriv('aes-256-cbc', keyData.key, keyData.iv)
    const cipherText = cipher.update(JSON.stringify(post), 'utf-8', 'hex') + cipher.final('hex')
    await rootState.user.userSession.putFile(`post/${id.replace(/\./g, '_')}.hex`, cipherText, { sign: true, encrypt: false })

    // Encrypt and store symmetric key for the other user
    console.log({ keyData, pubkey })
    const stringifiedKey = {
      iv: keyData.iv.toString('hex'),
      key: keyData.key.toString('hex')
    }
    console.log({ stringifiedKey })
    const keyDataCipherTextObject = encryptContent(JSON.stringify(stringifiedKey), { publicKey: pubkey })
    console.log({ keyDataCipherTextObject, path })
    await rootState.user.userSession.putFile(
      `post/${id.replace(/\./g, '_')}_cipherkey.json`,
      keyDataCipherTextObject,
      { sign: true, encrypt: false }
    )
    await rootState.user.userSession.putFile(
      `post/${id.replace(/\./g, '_')}_personalkey.json`,
      keyDataCipherTextObject,
      { sign: true }
    )
    commit('ADD_PAYMENT', post)
    commit('IS_POSTING', false)
  },
  async LOAD_PAYMENT ({ commit, rootState }, id) {
    const username = rootState.user.userData.username
    const options = {
      decrypt: false,
      verify: true,
      username: id,
      app: window.location.origin,
      zoneFileLookupURL: 'https://core.blockstack.org/v1/names/'
    }
    const url = `post_${username.replace(/\./g, '_')}_cipherkey.json`
    console.log({ url, options })
    const cipherKeyText = await rootState.user.userSession.getFile(url, options)
      .catch(e => console.error(e))
    const key = JSON.parse(decryptContent(cipherKeyText))
    console.log({ key, cipherKeyText })
    console.log({ iv: Buffer.from(key.iv, 'hex') })
    console.log('after')
    const cipherText = await rootState.user.userSession.getFile(`post_${username.replace(/\./g, '_')}.hex`, options)
      .catch(e => console.error(e))
    const cipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.key, 'hex'), Buffer.from(key.iv, 'hex'))
    console.log({ cipher })
    const payment = JSON.parse(cipher.update(cipherText, 'hex', 'utf-8') + cipher.final('utf-8'))
    console.log(payment)
    commit('ADD_PAYMENT', payment)
  }
}
