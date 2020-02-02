<template>
  <div>
    <google-map
      @mapClicked="mapClicked"
      @markerClicked="markerClicked"
    />
  </div>
</template>

<script>
import GoogleMap from "@/components/GoogleMap.vue";

export default {
 components: {
    GoogleMap
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
    markerClicked () {
      this.showRoutes = true
    },
    mapClicked() {
      
    }

  }
}
</script>

<style>

</style>
