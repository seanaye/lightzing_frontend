export default function ({ store, redirect }) {
  if (!store.state.user.userSession) {
    store.commit('user/CREATE_SESSION')
  }
  if (store.state.user.userSession.isUserSignedIn()) {
    return redirect('/')
  }
}
