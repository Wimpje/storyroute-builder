<template>
  <div>
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
          v-if="currentRoute"
          outline
        >
          <v-card-title class="headline">
            {{ this.$i18n.t('routes.order') }}
          </v-card-title>
          <v-card-text>
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
              v-if="orderChanged"
              right
              @click="save()"
            >
              {{ this.$i18n.t('routes.save') }}
            </v-btn>
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
      v-if="currentRoute && showRoutes" 
      :display.sync="showRoutes"
      @setCurrentRouteToNone="setCurrentRouteToNone"
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
      isDragging: false,
      delayedDragging: false,
      orderChanged: false
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
        this.orderChanged = true
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
      this.newTitle = ''
      this.orderChanged = false

      if (this.currentRoute) {
        this.showRoutes = true
      }
      else {
        this.showRoutes = false
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
    this.$store.dispatch("initPois")
    this.$store.dispatch("initRoutes")
    this.$store.commit('setMapShowAutocomplete', false)
    // ? this.$store.commit('setCurrentRouteToNone')
  },
  methods: {
    //...mapActions(['createRoute']),
    createRoute(event) {
      const route = {
        title: this.newTitle
      }
      this.$store.dispatch("createRoute", route)
    },
    centerToPoi(poi) {

    },
    hoverPoi(poi) {
      
    },
    markerClicked(poi) {
      if (this.currentRoute)
        this.showRoutes = true;
   
      this.$store.commit('addPoiToRoute', poi)
    },
    mapClicked() {
      if (this.currentRoute)
        this.showRoutes = true;
    },
    save() {
      this.$store.dispatch("saveRoute", this.currentRoute);
      this.orderChanged = false
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
