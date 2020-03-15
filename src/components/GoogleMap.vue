<template>
  <v-container fluid>
    <v-row>
      <v-col>
        <div
          v-if="showAutoComplete"
          class="map-autocomplete"
        >
          {{ $t('marker.searchHint') }}
          <v-icon>mdi-map-marker</v-icon>
          <!-- in next version of vue-gmaps this works better probably -->
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
          <gmap-polyline
            v-if="currentRoute && path.length > 0"
            ref="polyline"
            :path="path"
            :editable="true"
            @path_changed="updateEdited($event)"
            @rightclick="handleClickForDelete"
          />
          <gmap-marker
            v-for="(item, index) in pois"
            :id="item.id"
            :key="index"
            :position="toLatLngObject(item.position)"
            :draggable="!currentRoute"
            :label="computePoiLabel(item)"
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
              style="bottom: 0; left: 0; background-color: #0000FF; color: white; position: absolute; z-index: 100; padding:4px;"
            >
              {{ $t('marker.current', { 'current': markerHovered.title }) }}
            </div>
          </div>
        </gmap-map>
        <v-dialog
          v-if="currentPoi"
          v-model="moveConfirmDialog"
          persistent
          max-width="290"
        >
          <v-card>
            <v-card-title class="headline">
              {{ this.$i18n.t('marker.moveConfirm') }}
            </v-card-title>
            <v-card-text>{{ this.$i18n.t('marker.moveConfirmText', {title: currentPoi.title}) }}</v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="green darken-1"
                text
                @click="moveConfirmed()"
              >
                Move
              </v-btn>
              <v-btn
                color="green darken-1"
                text
                @click="moveCanceled()"
              >
                Cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import { gmapApi } from "vue2-google-maps";

export default {
  components: {},
  props: {
     path: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      title: "",
      markerHovered: null,
      dataLoaded: false,
      hasPoints: false,
      moveConfirmDialog: false,
      tempNewPoi: {} // for drag/drop confirmation
    };
  },

  computed: {
    ...mapGetters({
      zoom: "mapZoom",
      center: "mapCenter",
      showAutoComplete: "mapShowAutocomplete",
      pois: "getPois",
      currentRoute: "currentRoute"
    }),
    currentPoi: {
      get() {
        return this.$store.state.pois.currentPoi;
      },
      set(value) {
        this.$store.commit("setCurrentPoi", value);
      }
    },

    poisWrong: {
      get() {
        const pois = Array.from(this.$store.state.pois.pois);
        let ret = [];
        if (
          this.$store.state.routes.currentRoute &&
          this.$store.state.routes.currentRoute.pois &&
          this.$store.state.routes.currentRoute.pois.length
        ) {
          for (
            let i = 0;
            i < this.$store.state.routes.currentRoute.pois.length;
            i++
          ) {
            const routePoi = this.$store.state.routes.currentRoute.pois[i];
            pois.forEach(p => {
              if (p.label) return;
              if (p.id === routePoi.id) {
                p.label = "R";
              } else {
                p.label = p.saved
                  ? { text: "✓", backgroundColor: "blue" }
                  : { text: "╳" };
              }
            });
          }
        } else {
          pois.forEach(
            p =>
              (p.label = p.saved
                ? { text: "✓", backgroundColor: "blue" }
                : { text: "╳" })
          );
        }

        return pois;
      }
    },
    autocompleteOptions: {
      get() {
        return {
          bounds: {
            north: 52.57177959397309, // this.$refs.mapRef.$mapObject.getBounds().getNorthEast().lat()
            south: 52.47778191849239, //this.$refs.mapRef.$mapObject.getBounds().getSouthWest().lat()
            east: 6.521993817651368, //this.$refs.mapRef.$mapObject.getBounds().getNorthEast().lng()
            west: 6.330591382348634 //this.$refs.mapRef.$mapObject.getBounds().getSouthWest().lng()
          },
          strictBounds: true
        };
      }
    }
  },
  created() {
    console.log("map created");
  },
  methods: {
    computePoiLabel(poi) {
      if (
        this.$store.state.routes.currentRoute &&
        this.$store.state.routes.currentRoute.pois &&
        this.$store.state.routes.currentRoute.pois.length
      ) {
        const idx = this.$store.state.routes.currentRoute.pois.findIndex(
          p => p.id === poi.id
        );
        if (idx > -1) return { text: idx + 1 + "", backgroundColor: "blue" };
        else
          return poi.saved
            ? { text: "✓", backgroundColor: "blue" }
            : { text: "╳" };
      } else if (
        this.$store.state.pois.currentPoi &&
        poi.id === this.$store.state.pois.currentPoi.id
      ) {
        if (poi.saved) return { text: "⨀", backgroundColor: "blue" };
        else return { text: "⨂", backgroundColor: "blue" };
      } else {
        return poi.saved
          ? { text: "✓", backgroundColor: "blue" }
          : { text: "╳" };
      }
    },
    setMarkerToCurrent(poi) {
      this.$store.commit("setCurrentPoi", poi);
    },
    updateMarkerLatLng(marker) {
      const position = new this.$firebase.firestore.GeoPoint(
        marker.latLng.lat(),
        marker.latLng.lng()
      );
      const poi = { position };

      // open confirmation dialog
      this.moveConfirmDialog = true;
      this.tempNewPoi = Object.assign({}, this.currentPoi, poi);
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
      const lat = mapClickEvent.latLng.lat();
      const lng = mapClickEvent.latLng.lng();

      this.$refs.mapRef.$mapPromise.then(map => {
        // a bit annoying, user can do it themselves
        // map.panTo({lat, lng})
      });
      this.$emit("mapClicked", mapClickEvent);
    },
    markerClicked(marker, index) {
      this.$emit("markerClicked", marker);
      if (marker && "id" in marker)
        console.log("marker clicked - ID:", marker.id);
      else console.log("marker clicked - No ID found: ", marker);
    },
    moveConfirmed() {
      this.$store.dispatch("savePoi", this.tempNewPoi);
      this.tempNewPoi = {};
      this.moveConfirmDialog = false;
    },
    moveCanceled() {
      this.tempNewPoi = {};
      this.moveConfirmDialog = false;
    },
    handleClickForDelete($event) {
      if ($event.vertex) {
        this.$refs.polyline.$polylineObject
          .getPath()
          .removeAt($event.vertex);
      }
    },
    updateEdited: function (mvcPath) {
      this.$emit('pathEdited', mvcPath.getArray())
    },
    setPlace(place) {
      if (!place) {
        return;
      }
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const position = new this.$firebase.firestore.GeoPoint(lat, lng);
      this.$store.dispatch("createPoi", {
        title: place.name,
        position
      });
      this.$refs.mapRef.$mapPromise.then(map => {
        map.panTo({ lat, lng });
      });
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
