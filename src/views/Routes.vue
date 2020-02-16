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
   
    <google-map
      :directions-result="directionsResult"
      @mapClicked="mapClicked"
      @markerClicked="markerClicked"
    />
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

export default {
  components: {
    GoogleMap,
    EditRoutes
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
    })
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
