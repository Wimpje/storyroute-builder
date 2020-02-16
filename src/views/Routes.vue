<template>
  <div>
    <v-select
      dense
      :items="routes"
      name="route"
      item-text="title"
      :label="$t('routes.choose')"
      return-object
      @change="update($event)"
    />
    <v-layout row>
      <v-flex
        grow
        pa-1
      >
        <google-map
          :directions-result="directionsResult"
          @mapClicked="mapClicked"
          @markerClicked="markerClicked"
        />
      </v-flex>
      <v-flex
        shrink
        pa-1
      >
        <v-card
          outline
        >
          <v-card-title class="headline">
            Drag the points in order
          </v-card-title>
          <v-card-text>
            <draggable v-model="pois" />
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <div v-if="!showRoutes">
      <v-text-field
        id="title"
        v-model="newTitle"
        name="title"
        :rules="someText"
        :label="$t('route.title')"
        required
      />
      <v-btn @click="createRoute">
        <v-icon>mdi-new</v-icon>Add Route
      </v-btn>
    </div>
    <EditRoutes
      v-if="showRoutes" 
      :display.sync="showRoutes"
    />
  </div>
</template>

<script>
import GoogleMap from "@/components/GoogleMap.vue";
import EditRoutes from "@/components/EditRoutes.vue";
import { mapActions, mapGetters } from "vuex";
  import draggable from 'vuedraggable'

export default {
  components: {
    GoogleMap,
    EditRoutes,
    draggable
  },
  data() {
    return {
      showRoutes: false,
      newTitle: '',
      directionsResult: {},
      someText: [
        v => !!v || this.$i18n.t("validation.someTextRequired"),
        v => (v && v.length > 1) || this.$i18n.t("validation.atLeastChars", 1)
      ],
    };
  },
  computed: {
    ...mapGetters({
      routes: "getRoutes",
      currentRoute: "currentRoute"
    }),
    pois: {
        get() {
            return this.$store.currentRoutes.pois
        },
        set(value) {
            this.$store.commit('updateCurrentRoutePois', value)
        }
    }
  },
  watch: {
    currentRoute: function(oldRoute, newRoute) {
      console.log("currentRouteChanged")
      this.showRoutes = true
      this.newTitle = ''
    }
  },
  created() {
    this.$store.dispatch("initPois")
    this.$store.dispatch("initRoutes")
  },
  methods: {
    //...mapActions(['createRoute']),
    createRoute(event) {
      const route = {
        title: this.newTitle
      }
      this.$store.dispatch("createRoute", route)
      this.$store.commit('setCurrentRoute', route)
    },
    update(route) {
      this.$store.commit('setCurrentRoute', route)
    },
    markerClicked(mapClickEvent) {
      if (this.currentRoute)
        this.showRoutes = true;
  debugger
      //this.$store.commit('addPoiToRoute', mapClickEvent)
    },
    mapClicked() {
      if (this.currentRoute)
        this.showRoutes = true;
    }
  }
};
</script>

<style>
</style>
