/* eslint-disable object-shorthand */
<template>
  <div>
    <v-card
      flat
    >
      <v-toolbar dense>
        <v-toolbar-title>
          {{ this.$i18n.t('routes.addEdit') }}
        </v-toolbar-title>

        <v-spacer />

        <v-btn
          icon
          color="warning" 
          @click="deleteConfirmDialog = true"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
        
        <v-btn
          icon
          @click="shouldDisplay = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-form
        :key="key"
        ref="routeForm"
        v-model="valid"
        :lazy-validation="lazy"
        @submit.prevent="save"
      >
        <v-card>
          <v-card-text>
            <v-text-field
              id="title"
              name="title"
              :value="currentRoute.title"
              :rules="someText"
              :label="$t('route.title')"
              required
              @input.native="updateRoute($event);"
            />
            <v-text-field
              id="description"
              :value="currentroute.description"
              :rules="someText"
              :label="$t('route.description')"
              required
              name="description"
              @input.native="updateRoute($event);"
            />
            
            <div
              v-for="(url, index) in currentroute.urls"
              :key="`url${index}`"
            >
              <url-input
                id="url"
                class="my-4"
                :url.sync="url"
                :index.sync="index"
                @deleteUrl="deleteUrl"
                @updateUrl="updateUrl"
              />
            </div>
            <v-btn
              @click="addNewUrlToRoute"
            >
              {{ urlAddLabel }}
            </v-btn>
          
            <div
              v-for="(file, index) in currentroute.files"
              :key="`file${index}`"
            >
              <file-input
                :file.sync="file"
                :index.sync="index"
                class="my-4"
                @deleteFile="deleteFile"
                @updateFile="updateFile"
              />     
            </div>
            <v-btn
              @click="addNewFileToRoute"
            >
              {{ fileAddLabel }}
            </v-btn>
            <v-checkbox
              id="convertToVoice"
              :value="currentroute.convertToVoice"
              :label="$t('marker.convertTextToVoice')"
              @input.native="updateRoute($event)"
            />
          </v-card-text>
        
          <v-card-actions>
            <v-btn
              color="primary"
              class="mr-4"
              type="submit"
            >
              {{ this.$i18n.t('marker.save') }}
            </v-btn>
            <v-btn
              class="mr-4"
              @click="shouldDisplay = false"
            >
              {{ this.$i18n.t('marker.cancel') }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-card>
    <v-row justify="center">
      <v-dialog
        v-model="deleteConfirmDialog"
        persistent
        max-width="290"
      >
        <v-card>
          <v-card-title class="headline">
            {{ this.$i18n.t('marker.deleteDialogTitle') }} 
          </v-card-title>
          <v-card-text>{{ this.$i18n.t('marker.deleteDialogText', {title: currentroute.title}) }}</v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="green darken-1"
              text
              @click="reset"
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
    </v-row>
  </div>
</template>

<script>
import { gmapApi } from "vue2-google-maps";
import { mapGetters, mapActions } from "vuex";
import FileInput from "@/components/FileInput.vue";
import UrlInput from "@/components/UrlInput.vue";

export default {
  components: {
    FileInput, UrlInput
  },
  props: {
    display: {
      type: Boolean,
      default() {
        return false;
      }
    }
  },
  data() {
    return {
      key: 1,
      valid: true,
      title: "",
      someText: [
        v => !!v || this.$i18n.t("validation.someTextRequired"),
        v => (v && v.length > 1) || this.$i18n.t("validation.atLeastChars", 1)
      ],
   
      lazy: true,
    
      route: {},
      deleteConfirmDialog: false,
      directionsService: {},
      directionsDisplay: {},
      travelModes: ['BICYCLING', 'DRIVING', 'WALKING'],
      travelMode: 'BICYCLING'
    };
  },
  computed: {
    urlAddLabel() {
      if(this.currentroute.urls && this.currentroute.urls.length > 0 )
        return 'Add another url'
      else 
        return 'Add url'
    },
    fileAddLabel() {
      if(this.currentroute.files && this.currentroute.files.length > 0 )
          return 'Add another file'
      else 
        return 'Add file'
    }
    ,
    shouldDisplay: {
      get() {
        return this.display;
      },
      set(value) {
        this.$emit("update:display", value);
      }
    },
    ...mapGetters(["currentRoute"]),
    google: gmapApi
    // eslint-disable-next-line object-shorthand
    
  },
  created() {
    this.displayDate = this.date
  },
  methods: {
    ...mapActions(["addNewFileToRoute", "addNewUrlToRoute","deleteFileFromRoute", "deleteUrlFromRoute", "updateFileFromRoute", "updateUrlFromRoute"]),
    setDescription(description) {
      this.description = description;
    },
    setDate(date) {
      this.date = date
    },
    updateRoute(e) {
      console.log('setting local route from form element', e)
      this.$set(this.route, e.target.id, e.target.value);
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true;
      }
    },
    save(e) {
      // merge objects
      const updated = {
        date: this.date
      };

      const newObject = Object.assign({}, this.currentRoute, updated, this.route)
      this.$store.dispatch("saveRoute", newObject);
    },
    reset() {
      this.key++
      this.$refs.routeForm.reset();
      this.$store.dispatch("removeCurrentRoute");
      this.shouldDisplay = false;
    },
    resetValidation() {
      this.$refs.routeForm.resetValidation();
    },
    getRoute: function (start, destination, mapRef) {
      this.directionsService = new google.maps.DirectionsService()
      this.directionsDisplay = new google.maps.DirectionsRenderer()
      this.directionsDisplay.setMap(mapRef.$mapObject)
      var vm = this
      vm.directionsService.route({
        origin: start, // Can be coord or also a search query
        destination: destination,
        travelMode: this.travelMode
      }, function (response, status) {
        if (status === 'OK') {
          vm.directionsDisplay.setDirections(response) // draws the polygon to the map
        } else {
          console.log('Directions request failed due to ' + status)
        }
      })
    }
  }
};
</script>

<style>
</style>
