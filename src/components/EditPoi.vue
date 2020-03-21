/* eslint-disable object-shorthand */
<template>
  <div>
    <v-card flat>
      <v-toolbar dense>
        <v-toolbar-title>{{ this.$i18n.t('marker.addEdit') }}</v-toolbar-title>

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
            <v-textarea
              id="description"
              auto-grow
              outlined
              :value="currentPoi.description"
              :rules="someText"
              :label="$t('poi.description')"
              required
              name="description"
              @input.native="updatePoi($event);"
            />
            <v-combobox
              id="tags"
              v-model="tags"
              :items="getTags"
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
                  v-model="displayDate"
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
                @input="updateDate($event);showDatePicker = false"
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
                @deleteUrl="deleteUrlFromPoi"
                @updateUrl="updateUrlFromPoi"
              />
            </div>
            <v-btn @click="addNewUrlToPoi">
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
                @deleteFile="deleteFileFromPoi"
                @updateFile="updateFileFromPoi"
              />
            </div>
            <v-btn @click="addNewFileToPoi">
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
import { gmapApi } from "vue2-google-maps";
import { mapGetters, mapActions } from "vuex";
import FileInput from "@/components/FileInput.vue";
import UrlInput from "@/components/UrlInput.vue";

export default {
  components: {
    FileInput,
    UrlInput
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
      date: "",
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
      // the poi currently edited, and which will be saved when done.
      poi: {},
      deleteConfirmDialog: false,
      displayDate: "",
      picker: {
        min: "1940-01-01",
        max: "1945-12-31",
        date: "1945-04-11"
      }
    };
  },
  watch: {
    currentPoi: function() {
      this.resetForm();
      if (
        this.currentPoi.date &&
        typeof this.currentPoi.date !== "string" &&
        "toDate" in this.currentPoi.date
      ) {
        this.displayDate = this.currentPoi.date
          .toDate()
          .toISOString()
          .slice(0, 10);
        console.log(
          `converted currentPoiDate ${this.currentPoi.date.toDate()} to date ${
            this.displayDate
          }`
        );
      }
    }
  },
  computed: {
    urlAddLabel() {
      if (this.currentPoi.urls && this.currentPoi.urls.length > 0)
        return "Add another url";
      else return "Add url";
    },
    fileAddLabel() {
      if (this.currentPoi.files && this.currentPoi.files.length > 0)
        return "Add another file";
      else return "Add file";
    },
    
    tags: {
      get() {
        if (
          this.$store.state.pois.currentPoi &&
          this.$store.state.pois.currentPoi.tags &&
          this.$store.state.pois.currentPoi.tags.length
        )
          return this.$store.state.pois.currentPoi.tags;
        else return [];
      },
      set(value) {
        if (this.poi) {
          if (value && value.length > 0) this.$set(this.poi, "tags", value);
          else this.$set(this.poi, "tags", []);
        }
      }
    },

    convertToVoice: {
      get() {
        return this.currentPoi.convertToVoice;
      },
      set(value) {
        if (this.poi) {
          if (typeof value !== "undefined") {
            this.$set(this.poi, "convertToVoice", value);
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
    ...mapGetters(["currentPoi", "getTags"]),
    google: gmapApi
    // eslint-disable-next-line object-shorthand
  },
  created() {
    console.log("Created");
    this.$store.dispatch('getPoiTags')
  },
  methods: {
    ...mapActions([
      "addNewFileToPoi",
      "addNewUrlToPoi",
      "deleteFileFromPoi",
      "deleteUrlFromPoi",
      "updateFileFromPoi",
      "updateUrlFromPoi"
    ]),
    updatePoi(e) {
      console.log("setting local poi from form element", e);
      this.$set(this.poi, e.target.id, e.target.value);
    },
    updateDate(date) {
      const convertedDate = this.$firebase.firestore.Timestamp.fromDate(
        new Date(date)
      );
      console.log(`setting date ${date} to ${convertedDate}`);
      this.$set(this.poi, "date", convertedDate);
      this.displayDate = date;
    },
    validate() {
      if (this.$refs.poiForm.validate()) {
        this.snackbar = true;
      }
    },
    save(e) {
      // merge objects
      const updatedPoi = {
        date: this.date
      };

      const newPoi = Object.assign({}, this.currentPoi, updatedPoi, this.poi);
      this.$store.dispatch("savePoi", newPoi);
    },
    resetForm() {
      this.key++;
      this.$refs.poiForm.reset();
      this.date = "";
      this.poi = {};
    },
    reset() {
      this.resetForm();
      this.$store.dispatch("removeCurrentPoi");
      this.shouldDisplay = false;
    },
    resetValidation() {
      this.$refs.poiForm.resetValidation();
    },
    close() {
      this.shouldDisplay = false;
      this.resetForm();
    }
  }
};
</script>

<style>
</style>
