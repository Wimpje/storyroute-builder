<template>
  <v-container>
    <v-row>
      <v-col>
        <v-select
          v-model="currentRouteId"
          dense
          :items="routes"
          name="route"
          item-text="title"
          item-value="id"
          :loading="!routes"
          :label="$t('routes.choose')"
          return-object
        />
      
        <!--<v-chip
          v-if="currentRoute && !saved"
          class="ma-2"
          color="red"
          text-color="white"
        >
          unsaved
        </v-chip>-->
      </v-col>
      <v-col>
        <v-btn @click="createRoute">
          <v-icon>mdi-map-plus</v-icon>Nieuwe route toevoegen
        </v-btn>
      </v-col>
      <v-col>
        <v-btn @click="editRoute">
          <v-icon>mdi-map-check</v-icon>Bewerk Route
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="7"
      >
        <google-map
          :path="currentPath"
          @mapClicked="mapClicked"
          @markerClicked="markerClicked"
          @pathEdited="onPathEdited"
        />
      </v-col>
      <v-col
        cols="5"
      >
        <v-switch
          v-if="currentRoute"
          id="drawingSwitch"
          v-model="drawingRoute"
          :label="$t('routes.drawingMode')"
        />
        <RouteDraw
          v-if="currentRoute && drawingRoute"
          :show-save-button="pathEdited"
          @save="save"
          @removePath="removePath"
        />
        <RouteOrder
          v-if="currentRoute && !drawingRoute"
          :show-poi-save-button="showPoiSaveButton"
          @save="save"
          @contentChanged="routeChanged"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <EditRoutes
          v-if="currentRoute && showRoutes"
          ref="editRouteRef" 
          :display.sync="showRoutes"
          @setCurrentRouteToNone="setCurrentRouteToNone"
          @routeChanged="routeChanged"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import GoogleMap from "@/components/GoogleMap.vue";
import EditRoutes from "@/components/EditRoutes.vue";
import { mapActions, mapGetters } from "vuex";
import RouteOrder from "@/components/RouteOrder.vue"
import RouteDraw from "@/components/RouteDraw.vue"
import { deepCopy } from '@/plugins/utils.js'

export default {
  components: {
    GoogleMap,
    EditRoutes,
    RouteOrder,
    RouteDraw
  },
  data() {
    return {
      showRoutes: false,
      newTitle: '',
      drawingRoute: false,
      someText: [
        v => !!v || this.$i18n.t("validation.someTextRequired"),
        v => (v && v.length > 1) || this.$i18n.t("validation.atLeastChars", 1)
      ],
      isDragging: false,
      pathEdited: false,
      delayedDragging: false,
      saved: this.currentRoute ? (typeof this.currentRoute.saved === 'undefined' ? false : this.currentRoute.saved) : false
    }
  },
  computed: {
    ...mapGetters({
      routes: "getRoutes",
      currentRoute: "currentRoute"
    }),
    showPoiSaveButton() {
      console.log('should showPoiSavebutton')
      return !this.saved
    },
    currentPath() {
      if (this.drawingRoute) {
        if (this.currentRoute.path.length) {
          // return a copy so we don't modify store
          return deepCopy(this.currentRoute.path.map(geoPoint => {
            return {lat: geoPoint.latitude, lng: geoPoint.longitude }
          }))
        }
        else {
          // create path between points
          const pathFromPoints =  this.currentRoute.pois.map(poi => {
            return {lat: poi.position.latitude, lng: poi.position.longitude}
          })
          console.log('created path', pathFromPoints)
          return pathFromPoints
        }
      }
      return []
    },
    
    currentRouteId: {
        get() {
          console.log('currentRouteId changed', this.currentRoute)
          if (this.currentRoute) 
            return this.currentRoute.id
          else
            return ''
      },
      set(value) {
         this.$store.commit('setCurrentRoute', value)
      }
    }
  },
  watch: {
    drawingRoute: function(isDrawingMode) {
      if (isDrawingMode) {
        console.log('starting drawing mode')
      }
    },
    currentRoute: function() {
      console.log("currentRouteChanged")
      this.pathEdited = false
      
      if (this.currentRoute) {
        this.showRoutes = true
        this.saved = (typeof this.currentRoute.saved === 'undefined' ? false : this.currentRoute.saved)
      }
      else {
        this.showRoutes = false
        this.saved = false
      }
    },
    isDragging(newValue) {
      if (newValue) {
        this.delayedDragging = true;
        return;
      }
      this.$nextTick(() => {
        this.delayedDragging = false;
      });
    }
  },
  created() {
    this.$store.commit('setMapShowAutocomplete', false)
    this.$store.commit('setCurrentRouteToNone')
    this.$store.commit('setCurrentPoiToNone')
  },
  methods: {
    removePath() {
      // thjis is a bit funky, since path is a computed value, modifiying the store will update the path

      // create a path from all the points, then store it
       const pathFromPoints =  this.currentRoute.pois.map(poi => {
        return new this.$firebase.firestore.GeoPoint(poi.position.latitude, poi.position.longitude)
      })
      this.$store.commit('setPathToCurrentRoute',  pathFromPoints)
    },
    routeChanged: function(updatedRoute) {
      // emitted from form, set save to false
      console.log('route changed, setting saved to false')
      this.saved = false
    },
    //...mapActions(['createRoute']),
    createRoute(event) {
      const route = {
        title: this.$i18n.t("route.newTitle"),
      }
      this.$store.dispatch("createRoute", route)
    },
    editRoute() {
      this.showRoutes = true;
      this.$nextTick(function() {
        const el = this.$refs.editRouteRef.$el;
        el.scrollIntoView({behavior: 'smooth'})
      })
    },
    centerToPoi(poi) {

    },
    hoverPoi(poi) {
      
    },
    markerClicked(poi) {
      if (this.drawingRoute) {
        return
      }
      if (this.currentRoute)
        this.showRoutes = true;
   
      // marker or poi? make up your mind
      this.$store.commit("setMapCenter", poi.position);
      // this.$store.commit("setCurrentPoi", poi);

      this.$store.commit('addPoiToRoute', poi)
      this.saved = false
    },
    mapClicked(args) {
      if (this.currentRoute)
        this.showRoutes = true;
      
      if(this.drawingRoute) {
        // OK
      }
    },

    save() {
      const updatedRoute = Object.assign( {}, this.currentRoute)
      this.$store.dispatch("saveRoute", updatedRoute);
      this.pathEdited = false
      this.saved = true
    },
    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    },
    editPoi(poi) {
      
    },
    onPathEdited(path) {
      this.pathEdited = true
      const pathToPointsArray = path.map(p => new this.$firebase.firestore.GeoPoint(p.lat(), p.lng()))
      this.$store.commit('setPathToCurrentRoute', pathToPointsArray)
    },

    setCurrentRouteToNone() {
      this.$store.commit('setCurrentRouteToNone')
    }
  }
};
</script>

<style>
</style>
