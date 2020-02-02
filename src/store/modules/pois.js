//import { fireStore, Timestamp } from 'firestore'
import i18n from '@/plugins/i18n';

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

export const ContentTypes = [
  'other', 'image', 'video', 'audio'
]

export const FileSchema = {
  file: '', 
  title: '', 
  description: '', 
  date: '', 
  copyright: '', 
  firebaseUrl: '',
  type: 'other' // one of ContentTypes
}

export const UrlSchema = {
  url: '', 
  title: '', 
  description: '',
  type: 'other' // one of ContentTypes
}

export const Schema = {
  id:'',
  title: '',
  description: '',
  position: {}, // firestore.GeoPoint
  tags: [], // string
  date: '', // firestore.Timestamp
  leadImage: '', // image for display
  urls: [],
  files:[], // {file: '', title: '', description: '', date: '', copyright: '', type:''}
  routeIds: [], // this will be filled when this poi is assigned to a route, data is stored in route object & poi (using cloud function to update this)
  author:'', // name of point creator
  googleVoice: false // read aloud with google voice 
}


export const actions = {
   initPois: async function ({ commit }) {
    const ref = await this.$app.$firebase.firestore().collection('pois')
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
  addNewFileToPoi({commit}) {
   commit('addNewFile', Object.assign({}, FileSchema))
  },
  addNewUrlToPoi({commit}) {
   commit('addNewUrl', Object.assign({}, UrlSchema))
  },
  deleteFile({commit}, payload){
    commit('deleteFile', payload)
  },
  deleteUrl({commit}, payload){
    commit('deleteUrl', payload)
  }, 
  updateUrl({commit}, payload){
    commit('updateUrl', payload)
  },
  updateFile({commit}, payload){
    commit('updateFile', payload)
  },
  getPois ({ state }) {
    return state.pois
  },
  async getPoiTags ({ state }) {
    if (state.tags.length) {
      const tagsRef = await this.$app.$firebase.firestore().collection('tags').doc('SJIGrgJX3Vto0lWOPzLo')
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
    const ref = await this.$app.$firebase.firestore().collection('pois').doc()
    const date = this.$app.$firebase.firestore.Timestamp.fromDate(new Date('1945-04-11'))
    const newPoi = {
      id: ref.id,
      position: poi.position,
      date: date,
      title: poi.title == null ? i18n.t('marker.title', { 'length': state.pois.length }) : poi.title,
      description: poi.description == null ? i18n.t('marker.description', { 'length': state.pois.length }) : poi.description
    }

    commit('createPoi', newPoi)
  },
  async savePoi ({ commit }, poi) {
    // if updated, save updated-date
    if (!poi.currentDate) {
      poi.updatedDate = this.$app.$firestore.FieldValue.serverTimestamp()
      if(poi.updateCnt)
        poi.updateCnt = poi.updateCnt++
      else
        poi.updateCnt = 1
    }
    console.log('saving poi: (NOT REALLY, commented out in dev mode)', poi)
    // await this.$app.$firebase.firestore().collection('pois').doc(poi.id).set({ ...poi, saved: true, currentDate: firestore.FieldValue.serverTimestamp()})
 
    commit('savePoi', poi)
    // TODO i18n
    commit('setMessage', {title: 'Point Saved', message:`The point ${poi.title} has been saved`})
  },
  saveCurrentPoi ({ dispatch, state }) {
    dispatch('savePoi', state.currentPoi)
  },
  async removeCurrentPoi ({ commit, state }) {
    if (state.currentPoi === null) { return }
    const poi = state.currentPoi
    if (state.currentPoi.saved) {
      // delete from firebase too
      const ref = await this.$app.$firebase.firestore().collection('pois').doc(poi.id).delete()
      console.log(ref)
    }
    commit('removeCurrentPoi')
  }
}

export const mutations = {
  createPoi (state, poi) {
    state.poi = Object.assign({}, Schema, poi)
    console.log('created poi', state.poi)
    state.pois.push(state.poi)
  },
  addNewFile (state, fileObject) {
    if (state.currentPoi.files)
      state.currentPoi.files.push(fileObject)
    else 
      state.currentPoi.files = [fileObject]
  },
  addNewUrl (state, urlObject) {
    if(state.currentPoi.urls)
      state.currentPoi.urls.push(urlObject)
    else 
      state.currentPoi.urls = [urlObject]
  },
  deleteFile(state, payload) {
    console.log('MUTATION: deleting file', payload)
    state.currentPoi.files.splice(payload.index, 1)
  },
  deleteUrl(state, payload) {
    console.log('MUTATION: deleting url', payload)
    state.currentPoi.urls.splice(payload.index, 1)
  },
  updateUrl(state, payload) {
    console.log('MUTATION: updating url', payload)
    state.currentPoi.urls[payload.index] = Object.assign({}, state.currentPoi.urls[payload.index], payload.val)
  },
  updateFile(state, payload) {
    console.log('MUTATION: updating file', payload)
    state.currentPoi.files[payload.index] = Object.assign({}, state.currentPoi.files[payload.index], payload.val)
  },
  savePoi (state, { poi }) {
    console.log('empty save poi function', poi)
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
  mutations,
  Schema,
  ContentTypes,
  UrlSchema,
  FileSchema
}
