export const state = () => ({
  showSignInModal: false,
  showExpenseDialog: false,
  splitWith: [],
  selectedPaidBy: '',
  payAmount: 0,
  currency: 'USD',
  payDescription: '',
  exchangeRate: 0
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
  },
  M_EXCHANGE_RATE (state, value) {
    state.exchangeRate = value
  }
}

export const actions = {
  async GET_EXCHANGE_RATE ({ commit }) {
    const req = await this.$axios.get('https://blockchain.info/tobtc?currency=USD&value=1&cors=true')
      .catch(e => console.error(e))
    console.log({ req })
    commit('M_EXCHANGE_RATE', req.data)
  }
}
