import i18n from '@/plugins/i18n';

import { deepCopy } from '@/plugins/utils'
import { UrlSchema, FileSchema, ContentTypes } from "@/store/modules/pois.js";

export const Schema = {
  id: '',
  title: '',
  subTitle: '',
  text: '',
  date: '',
  publishedDate: '', // YYYY-MM-dd HH:mm
  eventDateStart: '', // YYYY-MM-dd HH:mm
  eventDateStop: '', // YYYY-MM-dd HH:mm
  author: '', // name of creator
  convertToVoice: false, // read aloud with google voice 
  tags: [], // array of strings
  files: [],
  urls: [],
}


export const state = () => {
  return {
    items: [],
    currentArticle: null

  }
}

export const getters = {
  currentArticle (state) {
    return state.currentArticle
  },
  articles (state) {
    return state.items
  }  
}

export const actions = {
  initArticles: async function ({ state, commit }) {
    commit('setArticles', [])

    const documents = []
    const snapShot = await this.$app.$firebase.firestore().collection('articles').get()
    snapShot.forEach((document) => {
      const doc = document.data()
      doc.id = document.id
      documents.push(doc)
    })

    commit('setArticles', documents)
    
  },

  async createArticle({ commit, state }, item) {
    const ref = await this.$app.$firebase.firestore().collection('articles').doc()
    const date = this.$app.$firebase.firestore.Timestamp.fromDate(new Date())
    const curdate = new Date();
    const pad = (v) => {
      if(typeof v === 'undefined')
        return v

      if (v.toString().length === 1) {
        return '0' + v
      }
      return v
    }
    const newItem = Object.assign({}, deepCopy(Schema), {
      id: ref.id,
      date: date,
      publishedDate: `${curdate.getFullYear()}-${pad(curdate.getMonth())}-${pad(curdate.getDate())} ${pad(curdate.getHours())}:${pad(curdate.getMinutes())}`,
      title: item.title == null ? i18n.t('articles.title', { 'length': state.items.length }) : item.title,
      text: item.text == null ? i18n.t('articles.text', { 'length': state.items.length }) : item.text
    })

    commit('addArticle', newItem)
    commit("setCurrentArticle", newItem)
  },
  async saveArticle({ commit, dispatch }, item) {
    // if updated, save updated-date
    if (!item.savedDate) {
      item.updatedDate = this.$app.$firebase.firestore.FieldValue.serverTimestamp()
      if (item.updateCnt != null)
        item.updateCnt = item.updateCnt + 1
      else
        item.updateCnt = 1
    }
    else {
      item.savedDate = this.$app.$firebase.firestore.FieldValue.serverTimestamp()
    }
    const user = (this.$app.$store.state.auth || {}).user
    item.author = user.email ? user.email : ''
    // console.log('saving news: (NOT REALLY, commented out in dev mode)', item)
    try {
      await this.$app.$firebase.firestore().collection('articles').doc(item.id).set({ ...item, saved: true })
      // TODO i18n
      commit('setMessage', { title: 'Article Saved', message: `The item '${item.title}' has been saved` })
      dispatch('initArticles')
    }
    catch (e) {
      commit('setMessage', { title: 'ERROR saving item', message: `The item was not save: ${e.message}` })
    }
  },
  saveCurrentArticle({ dispatch, state }) {
    dispatch('saveArticle', state.currentArticle)
  },
  async removeCurrentArticle({ commit, state }) {
    if (state.currentArticle === null) { return }
    const item = state.currentArticle
    if (state.currentArticle.saved) {
      // delete from firebase too
      const ref = await this.$app.$firebase.firestore().collection('articles').doc(item.id).delete()
      console.log(ref)
    }
    commit('removeCurrentArticle')
  },
  addNewFileToArticle({ commit }) {
    commit('addNewFileToArticle', Object.assign({}, deepCopy(FileSchema)))
  },
  addNewUrlToArticle({ commit }) {
    commit('addNewUrlToArticle', Object.assign({}, deepCopy(UrlSchema)))
  },
  addTagToArticle({ commit }, payload) {
    commit('addTagToArticle', payload)
  },
  deleteFileFromArticle({ commit }, payload) {
    commit('deleteFileFromArticle', payload)
  },
  deleteUrlFromArticle({ commit }, payload) {
    commit('deleteUrlFromArticle', payload)
  },
  updateUrlFromArticle({ commit }, payload) {
    commit('updateUrlFromArticle', payload)
  },
  updateFileFromArticle({ commit }, payload) {
    commit('updateFileFromArticle', payload)
  },
}

export const mutations = {
  setCurrentArticle (state, item) {
    state.currentArticle = item
  },
  removeCurrentArticle(state) {
    if (state.currentArticle === null) { return }
    state.items = state.items.filter(n => n.id !== state.currentArticle.id)
    state.currentArticle = null
  },
  setArticles(state, n) {
    state.items = n
  },
  addArticle(state, n) {
    console.log('added article', n.title)
    state.items.push(n)
  },
  setCurrentArticleToNone(state) {
    state.currentArticle = null
  },
  addNewFileToArticle(state, fileObject) {
    if (state.currentArticle.files)
      state.currentArticle.files.push(fileObject)
    else
      state.currentArticle.files = [fileObject]
  },
  addNewUrlToArticle(state, urlObject) {
    if (state.currentArticle.urls)
      state.currentArticle.urls.push(urlObject)
    else
      state.currentArticle.urls = [urlObject]
  },
  deleteFileFromArticle(state, payload) {
    console.log('MUTATION: deleting file', payload)
    state.currentArticle.files.splice(payload.index, 1)
  },
  deleteUrlFromArticle(state, payload) {
    console.log('MUTATION: deleting url', payload)
    state.currentArticle.urls.splice(payload.index, 1)
  },
  updateUrlFromArticle(state, payload) {
    console.log('MUTATION: updating url', payload)
    state.currentArticle.urls[payload.index] = Object.assign({}, state.currentArticle.urls[payload.index], payload.val)
  },
  updateFileFromArticle(state, payload) {
    console.log('MUTATION: updating file', payload)
    state.currentArticle.files[payload.index] = Object.assign({}, state.currentArticle.files[payload.index], payload.val)
  },
  addTagToArticle(state, payload) {
    console.log('MUTATION: updating tags', payload)
    state.currentArticle.tags = payload
  },
}
export default {
  state,
  Schema,
  getters,
  actions,
  mutations
}
