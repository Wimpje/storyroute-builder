// <template>
  //   <div>
    //     <h1>Editor</h1>
    //     <div class="map-autocomplete">
      //       {{ $t('marker.searchHint') }}
      //       <gmap-autocomplete
//         style="border:1px solid white"
//         :value="title"
//         :placeholder="$t('search.location')"
//         :select-first-on-enter="true"
//         @place_changed="setPlace"
//       />
      //
    </div>
    //     <gmap-map
//       :center="center"
//       :zoom="zoom"
//       @click="mapClick"
//     >
      //       <gmap-marker
//         v-for="(item, index) in pois"
//         :key="index"
//         :position="toLatLngObject(item.position)"
//         @click="markerClicked(item, index)"
//         @mouseover="markerHovered = item"
//         @mouseout="markerHovered = null"
//       />

      //       <div
//         v-if="markerHovered"
//         slot="visible"
//       >
        //         <div
//           style="bottom: 0; left: 0; background-color: #0000FF; color: white; position: absolute; z-index: 100"
//         >
          //           {{ $t('marker.current', { 'current': markerHovered.title }) }}
          //
        </div>
        //
      </div>
      //
    </gmap-map>
    //     <EditPoi
//       v-if="markerEditDialog"
//       :poi="currentPoi"
//     />
    //
  </div>
  //
</template>

// <script>
// import { mapGetters } from "vuex";
// import EditPoi from "@/components/EditPoi.vue";
// import fb from "@/plugins/firebase";

// export default {
//   components: {
//     EditPoi
//   },
//   data() {
//     return {
//       center: { lat: 52.5248059, lng: 6.426292600000011 },
//       zoom: 12,
//       title: "",
//       markerHovered: null,
//       markerEditDialog: false,
//       dataLoaded: false
//     };
//   },
//   computed: {
//     ...mapGetters({
//       pois: "getPois"
//     }),
//     currentPoi: {
//       get() {
//         return this.$store.state.pois.currentPoi;
//       },
//       set(value) {
//         this.$store.commit("setCurrentPoi", value);
//       }
//     }
//   },
//   created() {
//     console.log("map created");
//   },
//   methods: {
//     fb,
//     toLatLngObject: poi => {
//       const isNumber = value => {
//         if (typeof value !== "number") {
//           return false;
//         }
//         if (value !== Number(value)) {
//           return false;
//         }
//         if (Number.isFinite(value) === false) {
//           return false;
//         }

//         return true;
//       };
//       if (isNumber(poi.latitude) && isNumber(poi.longitude)) {
//         return { lat: poi.latitude, lng: poi.longitude };
//       } else {
//         return null;
//       }
//     },
//     mapClick(mapClickEvent) {
//       const position = new fb.firestore.GeoPoint(
//         mapClickEvent.latLng.lat(),
//         mapClickEvent.latLng.lng()
//       );
//       const poi = { title: "New from map " + this.pois.length, position };
//       this.$store.dispatch("createPoi", poi);
//     },
//     markerClicked(marker, index) {
//       // this.center = marker.position
//       this.$store.commit("setCurrentPoi", marker);
//       this.markerEditDialog = true;
//       console.log('marker clicked', this.markerEditDialog)
//     },
//     setPlace(place) {
//       if (!place) {
//         return;
//       }
//       const position = new fb.firestore.GeoPoint(
//         place.geometry.location.lat(),
//         place.geometry.location.lng()
//       );
//       this.$store.dispatch("createPoi", { title: place.name, position });
//     }
//   }
// };
// </script>

// <style lang="scss" scoped>
// .vue-map-container {
//   height: 450px;
//   width: 100%;
//   .vue-map {
//     color: black;
//   }
// }

// .map-autocomplete {
//   margin-bottom: 10px;
// }
// </style>
