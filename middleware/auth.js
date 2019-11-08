
export default function ({ store, app }) {
  if (!store.state.user.userSession) {
    console.log('dispatching usersession')
    store.dispatch('user/INIT_SESSION')
  }
}
