<template>
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
</template>

<script>
import draggable from 'vuedraggable'
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    draggable
  },
  props: [ 'showPoiSaveButton', 'pois'],
  computed: {
    ...mapGetters({
      currentRoute: "currentRoute"
    })
  },
  methods: {
    save() {
      this.$emit('save')
    }
  }
}
</script>

<style>

</style>
