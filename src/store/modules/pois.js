//import { fireStore, Timestamp } from 'firestore'
import i18n from '@/plugins/i18n';
import { deepCopy } from '@/plugins/utils'

export const state = () => {
  return {
    pois: [],
    tags: [],
    currentPoi: null
  }
}
export const getters = {
  currentPoi(state) {
    return state.currentPoi
  },
  getPois(state) {
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
  type: 'other', // one of ContentTypes
  lead: false // use by default if set
}

export const UrlSchema = {
  url: '',
  title: '',
  description: '',
  type: 'other' // one of ContentTypes
}

export const Schema = {
  id: '',
  title: '',
  description: '',
  tags: [], // array of strings
  date: '', // firestore.Timestamp
  leadImage: '', // image for display
  urls: [],
  files: [], // {file: '', title: '', description: '', date: '', copyright: '', type:''}
  author: '', // name of point creator
  convertToVoice: false // read aloud with google voice 
}
const PoiSchema = {
  routeIds: [], // this will be filled when this poi is assigned to a route, data is stored in route object & poi (using cloud function to update this)
  position: {}, // firestore.GeoPoint 
}


export const actions = {
  initPois: async function ({state, commit }) {
    if(state.unsubscribe)
      state.unsubscribe() // unsubscribe

    const ref = await this.$app.$firebase.firestore().collection('pois')
    // empty points
    commit('setPois', [])

    // TODO not efficient! Think about this (it does make collaborative editing sort of possible...)
    // causes lots of read/writes for points... 
    const unsubscribe = ref.onSnapshot((snapShot) => {
      snapShot.docChanges().forEach((change) => {
        console.log(`FB:${change.type}:poi`, change.doc.id)
        if(change.type !== "removed") {
          const p = change.doc.data()
          p.id = change.doc.id
          
          commit('updatePoi', p)
        }
      })
    })
    commit('addPoiUnsubscribe', unsubscribe)
  },
  addNewFileToPoi({ commit }) {
    commit('addNewFileToPoi', Object.assign({}, deepCopy(FileSchema)))
  },
  addNewUrlToPoi({ commit }) {
    commit('addNewUrlToPoi', Object.assign({}, deepCopy(UrlSchema)))
  },
  addTagToPoi({ commit }, payload) {
    commit('addTagToPoi', payload)
  },
  deleteFileFromPoi({ commit }, payload) {
    commit('deleteFileFromPoi', payload)
  },
  deleteUrlFromPoi({ commit }, payload) {
    commit('deleteUrlFromPoi', payload)
  },
  updateUrlFromPoi({ commit }, payload) {
    commit('updateUrlFromPoi', payload)
  },
  updateFileFromPoi({ commit }, payload) {
    commit('updateFileFromPoi', payload)
  },
  getPois({ state }) {
    return state.pois
  },
  async getPoiTags({ state }) {
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
  async createPoi({ commit, state }, poi) {
    const ref = await this.$app.$firebase.firestore().collection('pois').doc()
    const date = this.$app.$firebase.firestore.Timestamp.fromDate(new Date('1945-04-11'))
    const newPoi = Object.assign({}, deepCopy(Schema), deepCopy(PoiSchema), {
      id: ref.id,
      position: poi.position,
      date: date,
      title: poi.title == null ? i18n.t('marker.title', { 'length': state.pois.length }) : poi.title,
      description: poi.description == null ? i18n.t('marker.description', { 'length': state.pois.length }) : poi.description
    })
    
    commit('addPoi', newPoi)
    commit("setCurrentPoi", newPoi)
  },
  async savePoi({ commit }, poi) {
    // if updated, save updated-date
    if (!poi.savedDate) {
      poi.updatedDate = this.$app.$firebase.firestore.FieldValue.serverTimestamp()
      if (poi.updateCnt != null)
        poi.updateCnt = poi.updateCnt++
      else
        poi.updateCnt = 1
    }
    else {
      poi.savedDate = this.$app.$firebase.firestore.FieldValue.serverTimestamp() 
    }
    const user = (this.$app.$store.state.auth || {}).user
    poi.author = user.email ? user.email : ''
    // console.log('saving poi: (NOT REALLY, commented out in dev mode)', poi)
    try {
      await this.$app.$firebase.firestore().collection('pois').doc(poi.id).set({ ...poi, saved: true})
      commit('savePoi', poi)
      // TODO i18n
      commit('setMessage', { title: 'Point Saved', message: `The point ${poi.title} has been saved` })
    }
    catch (e) {
      commit('setMessage', { title: 'ERROR saving point', message: `The point was not save: ${e.message}` })
    }
  },
  saveCurrentPoi({ dispatch, state }) {
    dispatch('savePoi', state.currentPoi)
  },

  async removeCurrentPoi({ commit, state }) {
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
  addPoi(state, poi) {
    console.log('added poi', poi.title)
    state.pois.push(poi)
  },
  addPoiUnsubscribe(state, s) {
    state.unsubscribe = s
  },
  addNewFileToPoi(state, fileObject) {
    if (state.currentPoi.files)
      state.currentPoi.files.push(fileObject)
    else
      state.currentPoi.files = [fileObject]
  },
  addNewUrlToPoi(state, urlObject) {
    if (state.currentPoi.urls)
      state.currentPoi.urls.push(urlObject)
    else
      state.currentPoi.urls = [urlObject]
  },
  deleteFileFromPoi(state, payload) {
    console.log('MUTATION: deleting file', payload)
    state.currentPoi.files.splice(payload.index, 1)
  },
  deleteUrlFromPoi(state, payload) {
    console.log('MUTATION: deleting url', payload)
    state.currentPoi.urls.splice(payload.index, 1)
  },
  updateUrlFromPoi(state, payload) {
    console.log('MUTATION: updating url', payload)
    state.currentPoi.urls[payload.index] = Object.assign({}, state.currentPoi.urls[payload.index], payload.val)
  },
  updateFileFromPoi(state, payload) {
    console.log('MUTATION: updating file', payload)
    state.currentPoi.files[payload.index] = Object.assign({}, state.currentPoi.files[payload.index], payload.val)
  },
  addTagToPoi(state, payload) {
    console.log('MUTATION: updating tags', payload)
    state.currentPoi.tags = payload
  },
  savePoi(state, { poi }) {
    console.log('empty save poi function', poi)
  },
  saveCurrentPoi(state, { poi }) {
    state.currentPoi = poi
  },
  removeCurrentPoi(state) {
    if (state.currentPoi === null) { return }
    state.pois = state.pois.filter(p => p.id !== state.currentPoi.id)
    state.currentPoi = null
  },
  updatePoi(state, poi) {
    if (state.pois.findIndex(p => p.id === poi.id) > -1) {
      // update it
     state.pois.forEach(p => {
        if(p.id === poi.id) {
            Object.assign(p, poi)
        }
      })
    }
    else {
      // add it
      state.pois.push(poi)
    }
  },
  setCurrentPoi(state, poi) {
    // validate poi
    console.log('setcurrent', poi.title)
    state.currentPoi = poi
  },
  setCurrentPoiToNone(state, poi) {
    state.currentPoi = null
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
  FileSchema,
  PoiSchema
}
