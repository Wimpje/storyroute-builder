
export const state = () => ({
  message: null,
  duration: 5000
})

// mutations
export const mutations = {
  setMessage (state, data) {
    state.message = data
    state.duration = 5000
  },
  clearMessage (state) {
    state.message = null
  },
  setMessageObject (state, data) {
    state.message = data.message
    state.duration = data.duration
  }
}

export default {
  state,
  mutations
}
