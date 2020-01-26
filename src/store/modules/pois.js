//import { fireStore, Timestamp } from 'firestore'
import fb from '@/plugins/firebase'
import i18n from '@/plugins/i18n';

const firestore = fb.fb.firestore

export const state = () => {
  return {
    pois: [],
    tags: [],
    currentPoi: null
  }
}
export const getters = {
  currentPoi (state) {
    return state.currentPoi
  },
  getPois (state) {
    return state.pois
  }
}

export const actions = {
  async initPois ({ commit }) {
    const ref = await fb.db.collection('pois')
    // TODO not efficient! Think about this (it does make collaborative editing sort of possible...)
    // causes lots of read/writes for points... 
    ref.onSnapshot((snapShot) => {
      commit('setPois', [])
      snapShot.forEach((poi) => {
        const p = poi.data()
        p.id = poi.id
        commit('createPoi', p)
      })
    })
  },
  getPois ({ state }) {
    return state.pois
  },
  async getPoiTags ({ state }) {
    if (state.tags.length) {
      const tagsRef = await fb.db.collection('tags').doc('SJIGrgJX3Vto0lWOPzLo')
      console.log(tagsRef)
      const tags = await tagsRef.get()
      if (tags.exists) {
        state.tags = tags.data()
        console.log(state.tags)
      }
    }
    return state.tags
  },
  async createPoi ({ commit, state }, poi) {
    const ref = await fb.db.collection('pois').doc()
    const date = firestore.Timestamp.fromDate(new Date('1945-04-11'))
    const newPoi = {
      id: ref.id,
      routeIds: [], // this will be filled when this poi is assigned to a route, data is stored in route object & poi (using cloud function to update this)
      position: poi.position,
      tags: [],
      date: date,
      title: poi.title == null ? i18n.t('marker.title', { 'length': state.pois.length }) : poi.title,
      description: poi.description == null ? i18n.t('marker.description', { 'length': state.pois.length }) : poi.description
    }
    commit('createPoi', newPoi)
  },
  async savePoi ({ commit }, poi) {
    // if updated, save updated-date
    if (!poi.currentDate) {
      poi.updatedDate = firestore.FieldValue.serverTimestamp()
      if(poi.updateCnt)
        poi.updateCnt = poi.updateCnt++
      else
        poi.updateCnt = 1
    }
    console.log('saving poi: (NOT REALLY, commented out)', poi)
   // await fb.db.collection('pois').doc(poi.id).set({ ...poi, saved: true, currentDate: firestore.FieldValue.serverTimestamp()})
    commit('savePoi', poi)
  },
  saveCurrentPoi ({ dispatch, state }) {
    dispatch('savePoi', state.currentPoi)
  },
  async removeCurrentPoi ({ commit, state }) {
    if (state.currentPoi === null) { return }
    const poi = state.currentPoi
    if (state.currentPoi.saved) {
      // delete from firebase too
      const ref = await fb.db.collection('pois').doc(poi.id).delete()
      console.log(ref)
    }
    commit('removeCurrentPoi')
  }
}

export const mutations = {
  createPoi (state, poi) {
    state.pois.push(poi)
    console.log('created poi', poi)
  },
  savePoi (state, { poi }) {
    console.log('empty save poi function')
  },
  saveCurrentPoi (state, { poi }) {
    state.currentPoi = poi
  },
  removeCurrentPoi (state) {
    if (state.currentPoi === null) { return }
    state.pois = state.pois.filter(p => p.id !== state.currentPoi.id)
    state.currentPoi = null
  },
  setCurrentPoi (state, poi) {
    // validate poi
    console.log('setcurrent', poi)
    state.currentPoi = poi
  },
  setPois(state, pois) {
    state.pois = pois
  }

}
export default {
  state,
  getters,
  actions,
  mutations
}
