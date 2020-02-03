<template>
  <div>
    <google-map
      :show-autocomplete="false"
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

export default {
 components: {
    GoogleMap,
    EditRoutes
  },
   data() {
    return {
      showRoutes: false
    }
  },
  created() {
    this.$store.dispatch('initRoutes')
  },
  methods: {
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
