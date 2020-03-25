<template>
  <v-card
    outline
  >
    <v-card-title class="headline">
      {{ this.$i18n.t('routes.drawRoute') }}
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
        <span>Klik op de kaart om de route te tekenen, klik op een punt om hem toe te voegen aan de route.</span>
      </v-tooltip>
    </v-card-title>
    <v-card-text>
      <v-btn
       
        right
        @click="deleteConfirmDialog = true"
      >
        reset
      </v-btn>
      <v-btn
        v-if="showSaveButton"
        right
        @click="save()"
      >
        {{ this.$i18n.t('routes.save') }}
      </v-btn>
    </v-card-text>
    <v-card-text v-if="!showSaveButton">
      Klik op de kaart een lijn te tekenen die de route vormt. Rechtemuisknop verwijderd een punt. Je kunt de bolletjes in het midden tussen de punten omhoog en omlaag slepen om de punten toe te voegen / te veranderen.
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
        <v-card-text>Delete path</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            color="green darken-1"
            text
            @click="removePath"
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
import { mapActions, mapGetters } from "vuex";

export default {
  components: {
    
  },
  props: [ 'pois', 'showSaveButton' ],
  data () {
    return {
      deleteConfirmDialog: false,
    }
  },
  computed: {
    ...mapGetters({
      currentRoute: "currentRoute"
    })
  },
  methods: {
    removePath() {
      this.deleteConfirmDialog = false
      this.$emit('removePath')
    },
    save() {
      this.$emit('save')
    }
  }
}
</script>

<style>

</style>
