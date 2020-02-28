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
          @click="close()"
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
            <v-textarea
              id="description"
              auto-grow
              outlined
              :value="currentRoute.description"
              :rules="someText"
              :label="$t('route.description')"
              required
              name="description"
              @input.native="updateRoute($event);"
            />
            
            <div
              v-for="(url, index) in currentRoute.urls"
              :key="`url${index}`"
            >
              <url-input
                id="url"
                class="my-4"
                :url.sync="url"
                :index.sync="index"
                @deleteUrl="deleteUrlFromRoute"
                @updateUrl="updateUrlFromRoute"
              />
            </div>
            <v-btn
              @click="addNewUrlToRoute"
            >
              {{ urlAddLabel }}
            </v-btn>
          
            <div
              v-for="(file, index) in currentRoute.files"
              :key="`file${index}`"
            >
              <file-input
                :file.sync="file"
                :index.sync="index"
                class="my-4"
                @deleteFile="deleteFileFromRoute"
                @updateFile="updateFileFromRoute"
              />     
            </div>
            <v-btn
              @click="addNewFileToRoute"
            >
              {{ fileAddLabel }}
            </v-btn>
            <v-switch
              id="convertToVoice"
              v-model="convertToVoice"
              :label="$t('marker.convertTextToVoice')"
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
              @click="close()"
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
          <v-card-text>{{ this.$i18n.t('route.deleteDialogText', {title: currentRoute.title}) }}</v-card-text>
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
  watch: {
    currentRoute: function(newVal, oldVal) {
      if(newVal.id !== oldVal.id)
        this.resetForm();
    }
  },
  computed: {
    urlAddLabel() {
      if(this.currentRoute.urls && this.currentRoute.urls.length > 0 )
        return 'Add another url'
      else 
        return 'Add url'
    },
    fileAddLabel() {
      if(this.currentRoute.files && this.currentRoute.files.length > 0 )
          return 'Add another file'
      else 
        return 'Add file'
    },
    convertToVoice: {
      get() {
        return this.currentRoute.convertToVoice
      },
      set(value) {
        if (this.route) {
          if(typeof value !== 'undefined') {
            this.$set(this.route, "convertToVoice", value);
          }
        }
      }
    },
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
  },
  created() {
  },
  methods: {
    ...mapActions(["addNewFileToRoute", "addNewUrlToRoute","deleteFileFromRoute", "deleteUrlFromRoute", "updateFileFromRoute", "updateUrlFromRoute"]),
    updateRoute(e) {
      console.log('setting local route from form element', e)
      this.$set(this.route, e.target.id, e.target.value);
      this.$emit('routeChanged', this.route)
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true;
      }
    },
    save(e) {
      // merge objects
      const newObject = Object.assign({}, this.currentRoute, this.route)
      this.$store.dispatch("saveRoute", newObject);
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
    },
    resetForm() {
      this.key++;
      this.$refs.routeForm.reset();
      this.date = ''
      this.route = {}
      console.log('resetting route form')
      this.$emit('routeChanged', null)
    },
    reset() {
      this.resetForm()
      this.$store.dispatch("removeCurrentRoute");
      this.shouldDisplay = false;
    },
    resetValidation() {
      this.$refs.routeForm.resetValidation();
    },
    close() {
      this.shouldDisplay = false
      this.resetForm()
    }
  }
};
</script>

<style>
</style>
