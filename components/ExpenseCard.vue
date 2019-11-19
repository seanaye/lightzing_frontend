<template>
  <v-card>
    <v-row align="center" justify="space-around" dense>
      <v-col cols="10" md="4" lg="3">
        <v-select
          v-model="selectedPaidBy"
          item-text="name"
          item-value="username"
          :items="payables"
          label="Paid By: "
          chips
        >
          <template v-slot:selection="data">
            <v-chip
              v-bind="data.attrs"
              :input-value="data.selected"
            >
              <v-avatar left>
                <v-img :src="data.item.avatarUrl"></v-img>
              </v-avatar>
              {{ data.item.name }}
            </v-chip>
          </template>
          <template v-slot:item="data">
            <v-list-item-avatar>
              <v-img :src="data.item.avatarUrl"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ data.item.name }}</v-list-item-title>
            </v-list-item-content>
          </template>
        </v-select>
      </v-col>
      <v-col cols="10" md="6" lg="7">
        <v-autocomplete
          v-model="splitWith"
          :items="payables"
          filled
          chips
          label="Split Between:"
          item-text="name"
          item-value="username"
          multiple
        >
          <template v-slot:selection="data">
            <v-chip
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              @click="data.select"
              @click:close="remove(data.item.username)"
            >
              <v-avatar left>
                <v-img :src="data.item.avatarUrl"></v-img>
              </v-avatar>
              {{ data.item.name }}
            </v-chip>
          </template>
          <template v-slot:item="data">
            <v-list-item-avatar>
              <v-img :src="data.item.avatarUrl"></v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>{{ data.item.name }}</v-list-item-title>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
    <v-row align="center" justify="center" justify-md="space-around" dense>
      <v-col cols="10" sm="2">
        <v-radio-group v-model="currency">
          <v-radio label="Satoshi" value="Satoshi" color="blue"></v-radio>
          <v-radio label="USD" value="USD" color="blue"></v-radio>
        </v-radio-group>
      </v-col>
      <v-col cols="10" sm="8" md="3" lg="4">
        <v-text-field
          type="number"
          v-model="payAmount"
          :suffix="currency"
          label="Split Amount: "
        ></v-text-field>
      </v-col>
      <v-col cols="10" sm="8" md="3" lg="4">
        <v-text-field
          type="text"
          v-model="payDescription"
          label="Description"
        ></v-text-field>
      </v-col>
      <v-col cols="10" md="5" class="text-center">
        {{ convString }}
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="10">
        <v-list>
          <v-divider></v-divider>
          <template v-for="(item, i) in splitWithObj">
            <v-list-item  :key="item.username">
              <v-list-item-avatar>
                <v-img :src="item.avatarUrl"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                {{ item.name }}
              </v-list-item-content>
              <v-spacer></v-spacer>
              <v-list-item-action-text>
                Owes {{ selectedPaidByName }} {{ payAmount / splitWith.length }} {{ currency }}
              </v-list-item-action-text>
            </v-list-item>
            <v-divider :key="item.username + i"></v-divider>
          </template>
        </v-list>
      </v-col>
    </v-row>
    <v-row justify="end" dense>
      <v-col cols="auto">
        <v-card-actions>
          <v-btn @click="cancel" class="mr-3">Cancel</v-btn>
          <v-tooltip top nudge-left="50" :disabled="!errorMsg">
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-btn
                  color="blue"
                  :disabled="invalidPost"
                >Post!</v-btn>
              </div>
            </template>
            <span>{{ errorMsg }}</span>
          </v-tooltip>
        </v-card-actions>
      </v-col>
      <v-col cols="1"></v-col>
    </v-row>
  </v-card>
</template>

<script>

export default {
  data () {
    return {
      exchangeRate: 0
    }
  },
  computed: {
    payables () {
      const me = JSON.parse(JSON.stringify(this.me))
      me.name = 'Me'
      return [ me, ...this.loadedFriendsObj ]
    },
    loadedFriendsObj () {
      return this.$store.getters['friends/loadedObj']
    },
    splitWith: {
      get () {
        return this.$store.state.splitWith
      },
      set (value) {
        this.$store.commit('M_EXPENSE_DIALOG', { show: true, splitWith: this.splitWith.concat(value) })
      }
    },
    splitWithObj () {
      return this.payables.filter((elem) => {
        return this.splitWith.includes(elem.username) && elem.username !== this.selectedPaidBy
      })
    },
    selectedPaidBy: {
      get () {
        return this.$store.state.selectedPaidBy
      },
      set (value) {
        this.$store.commit('M_SELECTED_PAID_BY', value)
      }
    },
    selectedPaidByName () {
      return this.payables.reduce((acc, elem) => {
        return (elem.username === this.selectedPaidBy) ? elem.name : acc
      }, '')
    },
    me () {
      return this.$store.getters['user/userObj']
    },
    payAmount: {
      get () {
        return this.$store.state.payAmount
      },
      set (value) {
        this.$store.commit('M_PAY_AMOUNT', value)
      }
    },
    payDescription: {
      get () {
        return this.$store.state.payDescription
      },
      set (value) {
        this.$store.commit('M_PAY_DESCRIPTION', value)
      }
    },
    currency: {
      get () {
        return this.$store.state.currency
      },
      set (value) {
        this.$store.commit('M_CURRENCY', value)
      }
    },
    convString () {
      if (this.currency === 'USD') {
        return `${this.payAmount} USD is about
        ${Math.floor(this.exchangeRate * this.payAmount / 0.00000001)} Satoshi or
        ${this.exchangeRate * this.payAmount} BTC`
      } else {
        return `${this.payAmount} Satoshi is about
        ${this.payAmount * 0.00000001 / this.exchangeRate} USD or
        ${this.payAmount * 0.00000001} BTC`
      }
    },
    invalidPost () {
      const validAmount = (this.currency === 'USD') ? Boolean(this.payAmount) : this.payAmount >= 1000
      return !this.payDescription || !validAmount
    },
    errorMsg () {
      if (!this.payAmount) {
        return 'Please enter an amount'
      } else if (this.currency === 'Satoshi' && this.payAmount < 1000) {
        return 'Please enter an amount greater than 1000 Satoshi'
      } else if (!this.payDescription) {
        return 'Please enter a description for the payment'
      } else {
        return ''
      }
    }
  },
  methods: {
    remove (id) {
      const newIDs = this.splitWith.filter(elem => elem !== id)
      this.$store.commit('M_EXPENSE_DIALOG', { show: true, splitWith: newIDs })
    },
    async getExchangeRate () {
      const req = await this.$axios.get('https://blockchain.info/tobtc?currency=USD&value=1&cors=true').catch(e => console.log(e))
      this.exchangeRate = req.data
    },
    cancel () {
      this.$router.back()
    }
  },
  created () {
    this.getExchangeRate()
    this.$store.dispatch('friends/LOAD_FRIENDS', { loadProfiles: true })
    this.$store.commit('M_SELECTED_PAID_BY', this.me.username)
  }
}
</script>
