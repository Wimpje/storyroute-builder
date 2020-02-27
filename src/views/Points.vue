<template>
  <v-container>
    <v-row>
      <v-col>
        <google-map
          :pois="pois"
          @markerClicked="markerClicked"
          @mapClicked="mapClicked"
        />
      </v-col>
      <v-col>
        <EditPoi
          v-if="markerEditDialog"
          :display.sync="markerEditDialog"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import EditPoi from "@/components/EditPoi.vue";
import GoogleMap from "@/components/GoogleMap.vue";
import { mapGetters } from "vuex";

export default {
  components: {
    EditPoi,
    GoogleMap
  },
  data() {
    return {
      markerEditDialog: false
    };
  },
  created() {
    this.$store.commit("setMapShowAutocomplete", true);
  },
  computed: {
    ...mapGetters({
      pois: "getPois"
    })
  },
  methods: {
    markerClicked(marker) {
      this.markerEditDialog = true;
    },
    mapClicked(mapClickEvent) {
      const lat = mapClickEvent.latLng.lat();
      const lng = mapClickEvent.latLng.lng();

      const position = new this.$firebase.firestore.GeoPoint(lat, lng);
      const poi = { title: "New from map " + this.pois.length, position };
      this.$store.dispatch("createPoi", poi);

      // open edit dialog
      this.markerEditDialog = true;
    }
  }
};
</script>

<style>
</style>
