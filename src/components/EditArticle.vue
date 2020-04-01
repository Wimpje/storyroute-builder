<template>
  <div>
    <v-card flat>
      <v-toolbar dense>
        <v-toolbar-title>{{ this.$i18n.t('articles.addEdit') }}</v-toolbar-title>

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
        ref="articleForm"
        v-model="valid"
        :lazy-validation="lazy"
        @submit.prevent="save"
      >
        <v-card>
          <v-card-text>
            <v-text-field
              id="title"
              name="title"
              :value="currentArticle.title"
              :rules="someText"
              :label="$t('articles.title')"
              required
              @input.native="updateArticle($event);"
            />
            <v-text-field
              id="subTitle"
              name="subTitle"
              :value="currentArticle.subTitle"
              :label="$t('articles.subTitle')"
              @input.native="updateArticle($event);"
            />
            <v-textarea
              id="text"
              auto-grow
              outlined
              :value="currentArticle.text"
              :rules="someText"
              :label="$t('articles.text')"
              required
              name="text"
              @input.native="updateArticle($event);"
            />
            <v-text-field
              id="publishedDate"
              name="publishedDate"
              :value="currentArticle.publishedDate"
              :rules="someDate"
              :label="$t('articles.date') + ' : YYYY-MM-dd HH:mm'"
              required
              @input.native="updateArticle($event);"
            />
            <v-select
              v-model="category"
              dense
              :items="categories"
              :label="$t('articles.category')"
            />
            <v-text-field
              v-if="showEventDates"
              id="eventDateStart"
              name="eventDateStart"
              :value="currentArticle.eventDateStart"
              :rules="someDate"
              :label="$t('articles.eventDateStart') + ' : YYYY-MM-dd HH:mm'"
              :required="showEventDates"
              @input.native="updateArticle($event);"
            />
            <v-text-field
              v-if="showEventDates"
              id="eventDateStop"
              name="eventDateStop"
              :value="currentArticle.eventDateStop"
              :rules="someDate"
              :label="$t('articles.eventDateStop') + ' : YYYY-MM-dd HH:mm'"
              :required="showEventDates"
              @input.native="updateArticle($event);"
            />
           
            <div
              v-for="(url, index) in currentArticle.urls"
              :key="`url${index}`"
            >
              <url-input
                id="url"
                class="my-4"
                :url.sync="url"
                :index.sync="index"
                @deleteUrl="deleteUrlFromArticle"
                @updateUrl="updateUrlFromArticle"
              />
            </div>
            <v-btn @click="addNewUrlToArticle">
              {{ urlAddLabel }}
            </v-btn>

            <div
              v-for="(file, index) in currentArticle.files"
              :key="`file${index}`"
            >
              <file-input
                :file.sync="file"
                :index.sync="index"
                class="my-4"
                @deleteFile="deleteFileFromArticle"
                @updateFile="updateFileFromArticle"
              />
            </div>
            <v-btn @click="addNewFileToArticle">
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
          <v-card-text>{{ this.$i18n.t('articles.deleteDialogText', {title: currentArticle.title}) }}</v-card-text>
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
import { mapGetters, mapActions } from "vuex";
import { Categories } from "@/store/modules/articles.js";


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
  computed: {
    ...mapGetters(["currentArticle"]),
    showEventDates() {
        if(this.article.category) {
          return this.article.category === 'event'
        }
        else {
          return this.currentArticle.category === 'event'
        }
    },
    urlAddLabel() {
      if (this.currentArticle.urls && this.currentArticle.urls.length > 0)
        return "Add another url";
      else return "Add url";
    },
    fileAddLabel() {
      if (this.currentArticle.files && this.currentArticle.files.length > 0)
        return "Add another file";
      else return "Add file";
    },
    convertToVoice: {
      get() {
        return this.currentArticle.convertToVoice;
      },
      set(value) {
        if (this.article) {
          if (typeof value !== "undefined") {
            this.$set(this.article, "convertToVoice", value);
          }
        }
      }     
    },
     category: {
        get() {
          return this.currentArticle.category;
        },
        set(value) {
          if (this.article) {
            this.$set(this.article, "category", value);
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
      someDate: [
        v => !!v || this.$i18n.t("validation.someDateRequired"),
        v =>
          (v && /^\d{4}\-\d{2}\-\d{2}\s\d{2}:\d{2}$/.test(v)) ||
          this.$i18n.t("validation.matchDateFormat")
      ],
      categories: Categories,
      lazy: true,
      article: {},
      saved: true,
      deleteConfirmDialog: false
    };
  },
  watch: {
    currentArticle: function(newVal, oldVal) {
      if (newVal.id !== oldVal.id) this.resetForm();
    }
  },
  mounted() {
    this.saved = false;
  },
  methods: {
    ...mapActions([
      "addNewFileToArticle",
      "addNewUrlToArticle",
      "deleteFileFromArticle",
      "deleteUrlFromArticle",
      "updateFileFromArticle",
      "updateUrlFromArticle"
    ]),
    articleChanged: function(updatedItem) {
      // emitted from form, set save to false
      this.saved = false;
    },
    validate() {
      if (this.$refs.articleForm.validate()) {
        this.snackbar = true;
      }
    },
    updateArticle(e) {
      console.log("setting article from form element", e);
      this.$set(this.article, e.target.id, e.target.value);
      this.$emit("articleChanged", this.article);
    },
    
    save(e) {
      if (this.$refs.articleForm.validate()) {
        const newObject = Object.assign({}, this.currentArticle, this.article);
        this.$store.dispatch("saveArticle", newObject);
      } else {
        this.$store.commit(
          "setMessage",
          { title: "Check of alles goed is ingevuld" },
          { root: true }
        );
      }
    },
    resetForm() {
      this.key++;
      this.$refs.articleForm.reset();
      this.date = "";
      this.article = {};
      console.log("resetting article form");
      this.$emit("articleChanged", null);
    },
    reset() {
      this.resetForm();
      this.$store.dispatch("removeCurrentArticle");
      this.shouldDisplay = false;
    },
    resetValidation() {
      this.$refs.articleForm.resetValidation();
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
