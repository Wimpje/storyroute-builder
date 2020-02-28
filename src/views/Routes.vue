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
          :directions-result="directionsResult"
          @mapClicked="mapClicked"
          @markerClicked="markerClicked"
        />
      </v-col>
      <v-col
        cols="5"
      >
        <v-card
          outline
        >
          <v-card-title class="headline">
            {{ this.$i18n.t('routes.order') }}
            <v-tooltip
              bottom
              max-width="150"
            >
              <template v-slot:activator="{ on }">
                <v-btn
                  icon
                  v-on="on"
                >
                  <v-icon color="grey lighten-1">
                    mdi-help
                  </v-icon>
                </v-btn>
              </template>
              <span>Klik op een punt om hem toe te voegen aan de route. Daarna kun je de punten omhoog en omlaag slepen om de volgorde te veranderen.</span>
            </v-tooltip>
          </v-card-title>
          <v-card-text v-if="currentRoute && currentRoute.pois.length">
            <v-list>
              <draggable
                v-model="pois"
                element="div"
              >
                <transition-group
                  type="transition"
                >
                  <div
                    v-for="(poi, idx) in pois"
                    :key="poi.id"
                  >
                    <v-list-item
                      @click="centerToPoi(poi)"
                    >
                      {{ idx + 1 }} - {{ poi.title }}
                      <v-btn
                        icon
                        color="warning" 
                        @click="removePoiFromRoute(poi)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                      <v-btn
                        v-if="false"
                        icon
                        @click="editPoi(poi.id)"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </v-list-item>
                  </div>
                </transition-group>
              </draggable>
            </v-list>
            <v-btn
              v-if="showPoiSaveButton"
              right
              @click="save()"
            >
              {{ this.$i18n.t('routes.save') }}
            </v-btn>
          </v-card-text>
          <v-card-text v-else>
            Selecteer eerst een route, en klik dan op een punt om hem toe te voegen aan de route. Daarna kun je de punten omhoog en omlaag slepen om de volgorde te veranderen.
          </v-card-text>
        </v-card>
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
      isDragging: false,
      delayedDragging: false,
      showPoiSaveButton: false,
      saved: this.currentRoute ? (typeof this.currentRoute.saved === 'undefined' ? false : this.currentRoute.saved) : false
    }
  },
  computed: {
    ...mapGetters({
      routes: "getRoutes",
      currentRoute: "currentRoute"
    }),
    pois: {
      get() {
          let ret = []
          if (this.$store.state.routes.currentRoute && this.$store.state.routes.currentRoute.pois && this.$store.state.routes.currentRoute.pois.length)
            ret =  this.$store.state.routes.currentRoute.pois
          else 
            ret = []
          console.log('routes.vue pois getter: ', ret)
          return ret
      },
      set(value) {
        this.showPoiSaveButton = true
        this.saved = false
        this.$store.commit('updateCurrentRoutePois', value)
      }
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
    currentRoute: function() {
      console.log("currentRouteChanged")
      this.showPoiSaveButton = false
      
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
    routeChanged: function(updatedRoute) {
      // emitted from form, set save to false
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
      if (this.currentRoute)
        this.showRoutes = true;
   
      this.$store.commit('addPoiToRoute', poi)
      this.showPoiSaveButton = true
      this.saved = false
    },
    mapClicked() {
      if (this.currentRoute)
        this.showRoutes = true;
    },
    save() {
      const updatedRoute = Object.assign( {}, this.currentRoute)
      this.$store.dispatch("saveRoute", updatedRoute);
      this.showPoiSaveButton = false
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
    removePoiFromRoute(poi) {
      this.$store.commit('removePoiFromRoute', poi)
    },
    setCurrentRouteToNone() {
      this.$store.commit('setCurrentRouteToNone')
    }
  }
};
</script>

<style>
</style>
