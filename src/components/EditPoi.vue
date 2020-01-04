/* eslint-disable object-shorthand */
<template>
  <div>
    <v-dialog
      v-model="shouldDisplay"
      scrollable
      max-width="500px"
    >
      <v-form
        :key="key"
        v-model="valid"
        :lazy-validation="lazy"
        @submit.prevent="save"
      >
        <v-card>
          <v-card-title>
            <h2>{{ this.$i18n.t('marker.addEdit') }}</h2>
            <div>{{ this.$i18n.t('marker.select') }}</div>
          </v-card-title>
          <v-divider />
          <v-card-text style="height: 300px;">
            <v-text-field
              id="title"
              name="title"
              :value="currentPoi.title"
              :rules="someText"
              :label="$t('poi.title')"
              required
              @change.native="updatePoi($event);"
            />
            <v-text-field
              id="description"
              :value="currentPoi.description"
              :rules="someText"
              :label="$t('poi.description')"
              required
              name="description"
              @change.native="updatePoi($event);"
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
              @change.native="updatePoi($event);"
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
              :close-on-content-click="true"
              :return-value="date"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              max-width="290px"
              min-width="290px"
            >
              <template v-slot:activator="{ on }">
                <v-text-field
                  id="date"
                  v-model="date"
                  :label="$t('poi.date')"
                  :rules="someDate"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                  @change.native="updatePoi($event);"
                />
              </template>
              <v-date-picker
                v-if="showDatePicker"
                v-model="date"
                :picker-date="picker.date"
                :min="picker.min"
                :max="picker.max"
                @click="selectDate(this)"
              />
            </v-menu>
            <v-file-input
              id="imageFiles"
              :label="$t('poi.filesImage')"
              :value="currentPoi.imageFiles"
              accept="image/*"
              :multiple="true"
              filled
              prepend-icon="mdi-camera"
              @change.native="updatePoi($event);"
            />
            <v-file-input
              id="videoFiles"
              :label="$t('poi.filesVideo')"
              :value="currentPoi.videoFiles"
              :multiple="true"
              accept="video/*"
              filled
              prepend-icon="mdi-video-vintage"
              @change.native="updatePoi($event);"
            />
            <v-file-input
              id="audioFiles"
              :label="$t('poi.filesAudio')"
              :value="currentPoi.audioFiles"
              :multiple="true"
              accept="audio/*"
              filled
              prepend-icon="mdi-volume-high"
              @change.native="updatePoi($event);"
            />
            <v-file-input
              id="otherFiles"
              :label="$t('poi.filesOther')"
              :value="currentPoi.otherFiles"
              :multiple="true"
              accept="audio/*"
              filled
              prepend-icon="mdi-file-multiple"
              @change.native="updatePoi($event);"
            />
            <v-checkbox
              id="convertToVoice"
              :value="currentPoi.convertToVoice"
              :label="$t('marker.convertTextToVoice')"
              @change.native="updatePoi($event);"
            />
          </v-card-text>
          <v-divider />
          <v-card-actions>
            <v-btn
              color="primary"
              class="mr-4"
              @click="changeMarkerLocation"
            >
              {{ this.$i18n.t('marker.changeLocation') }}
            </v-btn>
            <v-btn
              color="primary"
              class="mr-4"
              type="submit"
            >
              {{ this.$i18n.t('marker.save') }}
            </v-btn>
            <v-btn
              color="error"
              class="mr-4"
              @click="reset"
            >
              {{ this.$i18n.t('marker.delete') }}
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
    </v-dialog>
  </div>
</template>

<script>
import { gmapApi } from "vue2-google-maps";
import { mapGetters, mapActions } from "vuex";

import fb from "@/plugins/firebase";

export default {
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
      changeMarkerInput: false,
      picker: {
        min: "1940-01-01",
        max: "1945-12-31",
        date: "1945-04-11"
      }
    };
  },
  computed: {
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
        if (this.currentPoi && this.currentPoi.date) {
          return this.currentPoi.date
            .toDate()
            .toISOString()
            .slice(0, 10);
        } else {
          return "1945-04-11";
        }
      },
      // eslint-disable-next-line object-shorthand
      set: function(date) {
        this.poi.date = fb.fb.firestore.Timestamp.fromDate(new Date(date));
      }
    }
  },
  methods: {
    setDescription(description) {
      this.description = description;
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
      this.shouldDisplay = false;
      this.changeMarkerInput = false;
    },
    reset() {
      this.key++
      this.$refs.poiForm.reset();
      this.$store.dispatch("removeCurrentPoi");
      this.shouldDisplay = false;
      this.changeMarkerInput = false;
    },
    resetValidation() {
      this.$refs.poiForm.resetValidation();
    },
    changeMarkerLocation() {
      // this should communicate to parent somehow that next click is for current poi
      this.changeMarkerInput = true;
      this.$store.commit(
        "setMessage",
        "Click anywhere on map to move to new location"
      );
    }
  }
};
</script>

<style>
</style>
