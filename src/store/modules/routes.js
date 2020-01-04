//import { fireStore } from 'firebase'
import fb from '@/plugins/firebase'

export const state = () => {
  return {
    routes: ['aap', 'noot', 'mies'],
    currentRoute: null,
    ref: null
  }
}
export const getters = {
  currentRoute (state) {
    return state.currentRoute
  },
  getRoutes (state) {
    return state.routes
  }
}

export const actions = {
  async init ({ state }) {

  }
}
export const mutations = {
  async createRoute (state, { poi }) {
    const ref = await fb.db.collection('routes').doc()

    console.log('create', ref)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
