<template>
  <div>
    <v-select
      dense
      :items="routes"
      name="route"
      item-text="title"
      :label="$t('routes.choose')"
      @change.native="update($event)"
    /> <v-btn
      @click="createRoute"
    >
      <v-icon>mdi-new</v-icon>Add Route
    </v-btn>
    <google-map
      :directions-result="directionsResult"
      @mapClicked="mapClicked"
      @markerClicked="markerClicked"
    /> 
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
      directionsResult: {}
    }
  },
   watch: {
    currentRoute: function(oldRoute, newRoute) {
      if (newRoute != null) {
        this.showRoutes = true
      }
    }
  },
  computed: {
    ...mapGetters({
      routes: "getRoutes"
    })
  },
  created() {
    this.$store.dispatch('initPois')
    this.$store.dispatch('initRoutes')
  },
  methods: {
    //...mapActions(['createRoute']),
    createRoute (event) {
      const route = {}
      this.$store.dispatch("createRoute", route);

    },
    markerClicked (mapClickEvent) {
      this.showRoutes = true
    },
    mapClicked() {
      this.showRoutes = true
    }

  }
}
</script>

<style>

</style>
