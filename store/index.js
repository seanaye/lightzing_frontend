export const state = () => ({
  showSignInModal: false,
  showExpenseDialog: false,
  splitWith: []
})

export const mutations = {
  M_EXPENSE_DIALOG (state, { show, splitWith }) {
    state.showExpenseDialog = show
    if (splitWith) {
      const toSplit = [...new Set(splitWith)]
      if (toSplit.length === 0) {
        state.showExpenseDialog = false
      }
      state.splitWith = toSplit
    }
  }
}
