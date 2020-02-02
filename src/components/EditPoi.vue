/* eslint-disable object-shorthand */
<template>
  <div>
    <v-card
      flat
    >
      <v-toolbar dense>
        <v-toolbar-title>
          {{ this.$i18n.t('marker.addEdit') }}
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
        ref="poiForm"
        v-model="valid"
        :lazy-validation="lazy"
        @submit.prevent="save"
      >
        <v-card>
          <v-card-text>
            <v-text-field
              id="title"
              name="title"
              :value="currentPoi.title"
              :rules="someText"
              :label="$t('poi.title')"
              required
              @input.native="updatePoi($event);"
            />
            <v-text-field
              id="description"
              :value="currentPoi.description"
              :rules="someText"
              :label="$t('poi.description')"
              required
              name="description"
              @input.native="updatePoi($event);"
            />
            <v-combobox
              id="tags"
              :items="currentPoi.tags"
              :search-input.sync="tagSearch"
              hide-selected
              :hint="$t('poi.tagsHint')"
              :label="$t('poi.tags')"
              multiple
              persistent-hint
              small-chips
              @input.native="updatePoi($event);"
            >
              <template v-slot:no-data>
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title>
                      No results matching "
                      <strong>{{ tagSearch }}</strong>". Press
                      <kbd>enter</kbd> to create a new one
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-combobox>
            <v-menu
              ref="datePickerMenu"
              v-model="showDatePicker"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  id="date"
                  :value="displayDate"
                  :label="$t('poi.date')"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                />
              </template>
              <v-date-picker
                v-model="date"
                :picker-date="picker.date"
                :min="picker.min"
                :max="picker.max"
                @input="showDatePicker = false"
              />
            </v-menu>
            <div
              v-for="(url, index) in currentPoi.urls"
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
              @click="addNewUrlToPoi"
            >
              {{ urlAddLabel }}
            </v-btn>
          
            <div
              v-for="(file, index) in currentPoi.files"
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
              @click="addNewFileToPoi"
            >
              {{ fileAddLabel }}
            </v-btn>
            <v-checkbox
              id="convertToVoice"
              :value="currentPoi.convertToVoice"
              :label="$t('marker.convertTextToVoice')"
              @input.native="updatePoi($event)"
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
          <v-card-text>{{ this.$i18n.t('marker.deleteDialogText', {title:currentPoi.title}) }}</v-card-text>
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
import { gmapApi } from "vue2-google-maps-withscopedautocomp";
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
      someDate: [v => !!v || this.$i18n.t("validation.someDateRequired")],
      lazy: true,
      showDatePicker: false,
      tagSearch: null,
      tags: [],
      // the poi currently edited, and which will be saved when done.
      poi: {},
      deleteConfirmDialog:false,
      displayDate:'',
      picker: {
        min: "1940-01-01",
        max: "1945-12-31",
        date: "1945-04-11"
      }
    };
  },
  computed: {
    urlAddLabel() {
      if(this.currentPoi.urls && this.currentPoi.urls.length > 0 )
        return 'Add another url'
      else 
        return 'Add url'
    },
    fileAddLabel() {
      if(this.currentPoi.files && this.currentPoi.files.length > 0 )
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
    ...mapGetters(["currentPoi"]),
    google: gmapApi,
    // eslint-disable-next-line object-shorthand
    date: {
      get: function() {
        // this is not 100% perfect, but since we're not messing with timezones it'll do the trick
        if (this.poi && this.poi.date) {
          const date = this.poi.date
            .toDate()
            .toISOString()
            .slice(0, 10);
            console.log('converted to date', date)
            return date
        } else {
          console.warn('using default date of 11 april 1945')
          return "1945-04-11";
        }
      },
      // eslint-disable-next-line object-shorthand
      set: function(date) {
        console.log('setting date to  date', date)
        this.poi.date = this.$firebase.firestore.Timestamp.fromDate(new Date(date))
        this.displayDate = date
        //this.$set(this.poi, 'date', this.$firebase.firestore.Timestamp.fromDate(new Date(date)));

      }
    }
  },
  created() {
    this.displayDate = this.date
  },
  methods: {
    ...mapActions(["addNewFileToPoi","addNewUrlToPoi","deleteFile", "deleteUrl", "updateFile", "updateUrl"]),
    setDescription(description) {
      this.description = description;
    },
    setDate(date) {
      this.date = date
    },
    updatePoi(e) {
      console.log('setting local poi from form element', e)
      this.$set(this.poi, e.target.id, e.target.value);
    },
    validate() {
      if (this.$refs.form.validate()) {
        this.snackbar = true;
      }
    },
    save(e) {
      // merge objects
      const updatedPoi = {
        date: this.date
      };

      const newPoi = Object.assign( {}, this.currentPoi, updatedPoi, this.poi)
      this.$store.dispatch("savePoi", newPoi);
    },
    reset() {
      this.key++
      this.$refs.poiForm.reset();
      this.$store.dispatch("removeCurrentPoi");
      this.shouldDisplay = false;
    },
    resetValidation() {
      this.$refs.poiForm.resetValidation();
    }
  }
};
</script>

<style>
</style>
