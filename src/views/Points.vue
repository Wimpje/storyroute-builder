<template>
  <div>
    <google-map
      @mapClicked="mapClicked"
      @markerClicked="markerClicked"
    />
    <EditPoi
      v-if="markerEditDialog"
      :display.sync="markerEditDialog"
    />
  </div>
</template>

<script>
import EditPoi from "@/components/EditPoi.vue";
import GoogleMap from "@/components/GoogleMap.vue";

export default {
  components: {
    EditPoi,
    GoogleMap
  },
  data() {
    return {
      markerEditDialog:false
    }
  },
  created() {
    this.$store.dispatch("initPois");
  },
  methods: {
    markerClicked () {
      this.markerEditDialog = true
    },
    mapClicked() {
      
    }

  }
};
</script>

<style>
</style>
