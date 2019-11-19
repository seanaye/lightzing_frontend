
export default async function ({ store, route, redirect }) {
  const data = store.state.user.userData
  if (!store.state.user.userSession) {
    store.commit('user/CREATE_SESSION')
  }
  const signedIn = store.state.user.userSession.isUserSignedIn()
  const pending = store.state.user.userSession.isSignInPending()
  if (signedIn && !data) {
    store.commit('user/INIT_USERDATA', store.state.user.userSession.loadUserData())
  } else if (pending && !signedIn) {
    console.log('pending signin')
    store.commit('user/INIT_USERDATA', await store.state.user.userSession.handlePendingSignIn())
  } else if (!signedIn) {
    store.commit('user/M_REDIRECT_URL', route.fullPath)
    return redirect('/login')
  }
  store.dispatch('user/ENSURE_PUBLIC_KEY')
  return true
}
