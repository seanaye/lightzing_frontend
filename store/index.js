export const state = () => ({
  showSignInModal: false,
  showExpenseDialog: false,
  splitWith: [],
  selectedPaidBy: '',
  payAmount: 0,
  currency: 'USD',
  payDescription: ''
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
  },
  M_SELECTED_PAID_BY (state, paidBy) {
    state.selectedPaidBy = paidBy
  },
  M_PAY_AMOUNT (state, amount) {
    state.payAmount = amount
  },
  M_CURRENCY (state, currency) {
    state.currency = currency
  },
  M_PAY_DESCRIPTION (state, value) {
    state.payDescription = value
  }
}
