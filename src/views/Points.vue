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
          ref="editPoiRef"
          :display.sync="markerEditDialog"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-list two-line>
        <template v-for="(item, index) in pois">
          <v-list-item
            :key="item.id"
            ripple
            @click="selectPoi(item)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
              <v-list-item-subtitle class="text--primary">
                {{ item.description }}
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-list-item-action>
              <v-list-item-action-text>Click</v-list-item-action-text>
            </v-list-item-action>
          </v-list-item>
          <v-divider
            v-if="index + 1 < pois.length"
            :key="index"
          />
        </template>
      </v-list>
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
    this.$store.commit('setCurrentRouteToNone')
    this.$store.commit('setCurrentPoiToNone')
  },
  computed: {
    ...mapGetters({
      pois: "getPois"
    })
  },
  methods: {

    selectPoi(poi) {
      this.$store.commit("setMapCenter", poi.position);
      // TODO check does this work?
      this.$store.commit("setCurrentPoi", poi);
      this.markerEditDialog = true;
      this.$nextTick(function() {
        const el = this.$refs.editPoiRef.$el;
        el.scrollIntoView({behavior: 'smooth'})
      })
    },
    markerClicked(poi) {
      // marker or poi? make up your mind
      this.$store.commit("setMapCenter", poi.position);
      // TODO check does this work?
      this.$store.commit("setCurrentPoi", poi);

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
