<template>
  <v-card outline>
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
      <v-expansion-panels flat>
        <draggable
          v-model="pois"
          element="div"
        >
          <transition-group type="transition">
            <div
              v-for="(poi, idx) in pois"
              :key="poi.id"
            >
              <v-expansion-panel>
                <v-expansion-panel-header
                  disable-icon-rotate
                  @click="centerToPoi(poi)"
                >
                  {{ idx + 1 }} - {{ poi.title }}
                  <div class="float-right">
                    <v-btn
                      icon
                      color="warning"
                      @click="deleteConfirmDialog = poi"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                  <template v-slot:actions>
                    <v-icon>mdi-pencil</v-icon>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-textarea
                    id="routeDescription"
                    :value="poi.routeDescription"
                    auto-grow
                    outlined
                    :label="$t('route.routeDescription')"
                    name="routeDescription"
                    @input.native="updatePoiRouteDescription($event, poi);"
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </div>
          </transition-group>
        </draggable>
      </v-expansion-panels>
      <v-btn
        v-if="showPoiSaveButton"
        right
        @click="save()"
      >
        {{ this.$i18n.t('routes.save') }}
      </v-btn>
    </v-card-text>
    <v-card-text
      v-else
    >
      Selecteer eerst een route, en klik dan op een punt om hem toe te voegen aan de route. Daarna kun je de punten omhoog en omlaag slepen om de volgorde te veranderen.
    </v-card-text>
    <v-dialog
      v-model="deleteConfirmDialog"
      persistent
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          {{ this.$i18n.t('marker.deleteDialogTitle') }}
        </v-card-title>
        <v-card-text>Delete point?</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="green darken-1"
            text
            @click="removePoiFromRoute(deleteConfirmDialog);deleteConfirmDialog = false;"
          >
            Delete
          </v-btn>
          <v-btn
            color="green darken-1"
            text
            @click="deleteConfirmDialog = false"
          >
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import draggable from "vuedraggable";
import { mapActions, mapGetters } from "vuex";
import { deepCopy } from '@/plugins/utils'

export default {
  components: {
    draggable
  },
  props: ["showPoiSaveButton"],
  data() {
    return {
      poisEditing: [],
       someText: [
        v => !!v || this.$i18n.t("validation.someTextRequired"),
        v => (v && v.length > 1) || this.$i18n.t("validation.atLeastChars", 1)
      ],
      deleteConfirmDialog: false,

      lazy: true,
    }
  },
  computed: {
    ...mapGetters({
      currentRoute: "currentRoute"
    }),
    pois: {
      get() {
          let ret = []
          if (this.currentRoute && this.currentRoute.pois && this.currentRoute.pois.length)
            ret =  this.currentRoute.pois.map(p => Object.assign({}, p))
          else 
            ret = []
          console.log('routes.vue pois getter: ', ret)
          return ret
      },
      set(value) {
        this.$emit('contentChanged', true)
        this.$store.commit('updateCurrentRoutePois', value)
      }
    },
  },
  methods: {
    shouldDisplayEdit(poi) {
      const exists = this.poisEditing.filter(p => p === poi.id)
      return exists && exists.length > 0
    },
    updatePoiRouteDescription(event, poi) {
      this.$emit('contentChanged', true)
      const poiFound = this.pois.filter(p => p.id === poi.id)
      if(poiFound && poiFound.length == 1) {
        const poiToChange = poiFound[0]
        poiToChange.routeDescription = event.target.value
        this.$store.commit('updatePoiInRoute', poiToChange)
      }
      else {
        console.error('could not find a poi to add routeDescription to :S')
      }
      
    },
    removePoiFromRoute(poi) {
      this.$emit('contentChanged', true)
      this.$store.commit('removePoiFromRoute', poi)
    },
    centerToPoi(poi) {
      this.$store.commit("setMapCenter", poi.position);
    },

    save() {
      this.$emit("save");
    }
  }
};
</script>

<style>
</style>
