<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <div
          v-if="showAutocomplete"
          class="map-autocomplete"
        >
          {{ $t('marker.searchHint') }}
          <gmap-autocomplete
            :select-first-on-enter="true"
            :options="autocompleteOptions"
            @place_changed="setPlace"
          >
            <template v-slot:input="slotProps">
              <v-text-field
                ref="input" 
                type="text"
                :full-width="false"

                prepend-inner-icon="mdi-map-marker"
                :value="title" 
                :placeholder="$t('search.location')"
                
                @listeners="slotProps.listeners"
                @attrs="slotProps.attrs"
              />
            </template>
          </gmap-autocomplete>
        </div>
        <gmap-map
          ref="mapRef"
          :center="center"
          :zoom="zoom"
          @click="mapClick"
        >
          <gmap-marker
            v-for="(item, index) in pois"
            :id="item.id"
            :key="index"
            :position="toLatLngObject(item.position)"
            :draggable="true"
            @dragend="updateMarkerLatLng"
            @dragstart="setMarkerToCurrent(item)"
            @click="markerClicked(item, index)"
            @mouseover="markerHovered = item"
            @mouseout="markerHovered = null"
          />

          <div
            v-if="markerHovered"
            slot="visible"
          >
            <div
              style="bottom: 0; left: 0; background-color: #0000FF; color: white; position: absolute; z-index: 100"
            >
              {{ $t('marker.current', { 'current': markerHovered.title }) }}
            </div>
          </div>
        </gmap-map>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import { gmapApi } from "vue2-google-maps-withscopedautocomp";

export default {
 props: {
    showAutocomplete: {
      type: Boolean,
      default() {
        return false;
      }
    },
    center: {
      type: Object,
      default() {
        return { lat: 52.5248059, lng: 6.426292600000011 };
      }
    },
    zoom: {
      type: Number,
      default() {
        return 12
      }
    },
    pois: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      title: "",
      markerHovered: null,
      markerEditDialog: false,
      dataLoaded: false
    };
  },

  computed: {
    
    currentPoi: {
      get() {
        return this.$store.state.pois.currentPoi;
      },
      set(value) {
        this.$store.commit("setCurrentPoi", value);
      }
    },
     autocompleteOptions: {
       get() {
        return {
          bounds: {
            north: 52.57177959397309, // this.$refs.mapRef.$mapObject.getBounds().getNorthEast().lat()
            south: 52.47778191849239, //this.$refs.mapRef.$mapObject.getBounds().getSouthWest().lat()
            east: 6.521993817651368, //this.$refs.mapRef.$mapObject.getBounds().getNorthEast().lng()
            west: 6.330591382348634, //this.$refs.mapRef.$mapObject.getBounds().getSouthWest().lng()
          },
          strictBounds: true
        }
      }
    }
  },
  created() {
    console.log("map created");
  },
  methods: {
    setMarkerToCurrent(poi) {
      this.$store.commit("setCurrentPoi", poi);
    },
    updateMarkerLatLng(marker) {
      const position = new this.$firebase.firestore.GeoPoint(
        marker.latLng.lat(),
        marker.latLng.lng()
      )
      const poi = { position };

      const newPoi = Object.assign( {}, this.currentPoi, poi )
      this.$store.dispatch("savePoi", newPoi);
    },
    toLatLngObject: poi => {
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
    },
    mapClick(mapClickEvent) {
      this.$emit('mapClicked', mapClickEvent)
    },
    markerClicked(marker, index) {
      this.center = marker.position
      // TODO check does this work?
      this.$store.commit("setCurrentPoi", marker);

      this.$emit('markerClicked', marker)
      console.log('marker clicked', marker, this)
    },
    setPlace(place) {
      if (!place) {
        return;
      }
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      const position = new this.$firebase.firestore.GeoPoint(
        lat, lng
      );
      this.$store.dispatch("createPoi", {
        title: place.name,
        position
      });
      this.$refs.mapRef.$mapPromise.then((map) => {
        map.panTo({lat, lng})
      })
    }
  }
};
</script>

<style lang="scss" scoped>
.vue-map-container {
  height: 450px;
  width: 100%;
  .vue-map {
    color: black;
  }
}

.map-autocomplete {
  margin-bottom: 10px;
}
</style>
