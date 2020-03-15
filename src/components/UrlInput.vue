<template>
  <div>
    <v-card outline>
      <v-card-title class="headline">
        URL {{ index + 1 }} - {{ type }}
      </v-card-title>

      <v-card-text>
        <v-text-field
          :id="'url' + index + 'title'"
          dense
          :value="url.title"
          name="title"
          :label="$t('poi.urlTitle')"
          @change.native="update($event)"
        />

        <v-text-field
          id="url"
          :value="url.url"
          :label="$t('poi.url')"
          required
          dense
          name="url"
          :prepend-icon="icon"
          @change.native="update($event)"
        />

        <v-select
          v-model="type"
          dense
          name="type"
          :items="contentTypes"
          :label="$t('content.type')"
          @change.native="update($event)"
        />
        <v-textarea
          :id="'url' + index + 'description'"
          auto-grow
          dense
          :value="url.description"
          name="description"
          :label="$t('poi.urlDescription')"
          @change.native="update($event)"
        />
      </v-card-text>
      <v-card-actions>
        <v-row
          align="center"
          justify="end"
        >
          <v-btn
            icon
            right
            color="warning"
            @click="deleteUrl"
          >
            <v-icon>mdi-delete</v-icon>delete
          </v-btn>
        </v-row>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import { Schema, ContentTypes } from "@/store/modules/pois.js";
export default {
  props: {
    url: {
      type: Object,
      default() {
        return Schema;
      }
    },
    index: {
      type: Number,
      default() {
        return 0;
      }
    }
  },
  data() {
    return {
      type: "other",
      localUrl: {}
    };
  },
  computed: {
    contentTypes() {
      return ContentTypes;
    },
    icon: {
      get() {
        switch (this.type) {
          case "audio":
            return "mdi-volume-high";
          case "video":
            return "mdi-video-vintage";
          case "image":
            return "mdi-camera";
          default:
            return "mdi-file-multiple";
        }
      }
    }
  },
  methods: {
    deleteUrl() {
      this.$emit("deleteUrl", { index: this.index, url: this.url });
    },
    update: function(e) {
      console.log(
        `setting url ${this.index} from form element ${e.target.name}: ${e.target.value}`,
        e
      );
      this.localUrl[e.target.name] = e.target.value;
      this.$emit("updateUrl", { index: this.index, val: this.localUrl });
    }
  }
};
</script>

<style>
</style>
