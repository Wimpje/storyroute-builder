//import { fireStore } from 'firebase'

export const state = () => {
  return {
    center:  { lat: 52.5248059, lng: 6.426292600000011 },
    zoom: 12,
    currentRoute: null,
    ref: null,
    showAutocomplete: false,
    pois: []
  }
}
export const getters = {
  mapCenter (state) {
    return state.center
  },
  mapZoom (state) {
    return state.zoom
  },
  mapShowAutocomplete (state) {
    return state.showAutocomplete
  }  
}
const toLatLngObject = (poi) => {
  const isNumber = value => {
    if (typeof value !== "number") {
      return false;
    }
    if (value !== Number(value)) {
      return false;
    }
    if (Number.isFinite(value) === false) {
      return false;
    }

    return true;
  };
  if (isNumber(poi.latitude) && isNumber(poi.longitude)) {
    return { lat: poi.latitude, lng: poi.longitude };
  } else {
    return null;
  }
}

export const mutations = {
  setMapZoom (state, zoom) {
    state.zoom = zoom
  },
  setMapCenter (state, val) {
    const latLng =toLatLngObject(val)
    if(latLng) 
      state.center = latLng
    else 
      console.warn('could not set center to object: ', val)

    
  },
  setMapShowAutocomplete (state, val) {
    state.showAutocomplete = val
  }
}
export default {
  state,
  getters,
  mutations
}
