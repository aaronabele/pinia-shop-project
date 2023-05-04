import { defineStore, acceptHMRUpdate } from 'pinia'
import { groupBy } from 'lodash'
import { useAuthUserStore } from './AuthUserStore'
import { useStorage } from '@vueuse/core'
export const useCartStore = defineStore('CartStore', {
  state: () => {
    return {
      items: useStorage('items', [])
    }
  },
  actions: {
    addItems(count, item) {
      count = parseInt(count)
      for (let i = 0; i < count; i++) {
        this.items.push({ ...item })
      }
    },
    clearItem(itemName) {
      this.items = this.items.filter((item) => {
        item.name !== itemName
      })
    },
    setItemCount(item, count) {
      if (count === 0) {
        return this.clearItem(item.name)
      }

      const groupCount = this.groupCount(item.name)
      const diff = Math.abs(count - groupCount)

      for (let i = 0; i < diff; i++) {
        if (count > groupCount) {
          this.addItems(1, item)
        } else {
          const index = this.items.findIndex((i) => i.name === item.name)
          this.items.splice(index, 1)
        }
      }
    },
    checkout() {
      const authUserStore = useAuthUserStore()
      alert(
        `${authUserStore.username} just bought ${this.count} items at a total of $${this.total}`
      )
    }
  },
  getters: {
    count: (state) => state.items.length,
    isEmpty: (state) => state.count === 0,
    grouped: (state) => {
      const grouped = groupBy(state.items, (item) => item.name)
      const sorted = Object.keys(grouped).sort()
      let inOrder = {}
      sorted.forEach((key) => (inOrder[key] = grouped[key]))
      return inOrder
    },
    groupCount: (state) => (name) => state.grouped[name].length,
    total: (state) => state.items.reduce((p, c) => p + c.price, 0)
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCartStore, import.meta.hot))
}
