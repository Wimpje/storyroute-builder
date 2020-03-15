<template>
  <div>
    <v-card outline>
      <v-card-title class="headline">
        {{ contentType }} bestand {{ index + 1 }}
      </v-card-title>

      <v-card-text>
        <v-text-field
          :id="'file' + index + 'title'"
          v-model="localFile.title"
          dense
          name="title"
          :label="$t('file.title')"
        />
        <v-textarea
          :id="'file' + index + 'description'"
          v-model="localFile.description"
          auto-grow
          dense
          name="description"
          :label="$t('file.description')"
        />
        <v-select
          v-model="localFile.type"
          dense
          :items="contentTypes"
          :label="$t('content.type')"
        />
        <v-file-input
          v-if="contentType"
          :id="'file'+contentType+index"
          :multiple="false"
          :label="label"
          :full-width="true"
          :accept="accept"
          filled
          :loading="uploading"
          :prepend-icon="icon"
          :hint="$t('file.uploadHint')"
          @change="onFilePicked"
        />
        <v-progress-circular
          v-if="uploading"
          :rotate="360"
          :value="progressUpload"
        />
        <v-switch
          v-if="localFile.firebaseUrl && contentType == 'image'"
          v-model="localFile.lead"
          label="Toon deze afbeelding bij punt"
        />
        <a
          v-if="localFile.firebaseUrl"
          :href="localFile.firebaseUrl"
        >{{ localFile.firebaseUrl }}</a>
        <img
          v-if="(uploadEnd || localFile.firebaseUrl) && contentType === 'image'"
          :src="localFile.firebaseUrl"
          width="20%"
        >
        <video
          v-if="(uploadEnd || localFile.firebaseUrl) && contentType === 'video'"
          :src="localFile.firebaseUrl"
          width="200"
          controls
        />
        <audio
          v-if="(uploadEnd || localFile.firebaseUrl) && contentType === 'audio'"
          :src="localFile.firebaseUrl"
          controls
          width="200"
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
            :loading="deleting"
            :disabled="deleting"
            color="warning"
            @click="deleteFile"
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
    file: {
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
      progressUpload: 0,
      fileName: "",
      uploadTask: "",
      uploading: false,
      uploadEnd: false,
      firebaseUrl: "",
      // copy of file to be able to 'v-model' it. On save pass it back with emit
      localFile: Object.assign({}, this.file),
      deleting: false
    };
  },
  computed: {
    contentType: {
      get() {
        return this.localFile.type;
      }
    },
    value() {
      return this.localFile.file ? this.localFile.file : "file.ext";
    },
    label() {
      return this.$i18n.t(
        "content." + (this.contentType ? this.contentType : "other")
      );
    },
    contentTypes() {
      return ContentTypes;
    },
    icon: {
      get() {
        switch (this.contentType) {
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
    },
    accept: {
      get() {
        switch (this.contentType) {
          case "audio":
            return "audio/*";
          case "video":
            return "video/*";
          case "image":
            return "image/*";
          default:
            return "*";
        }
      }
    }
  },
  watch: {
    localFile: {
      handler(oldVal, newVal) {
        this.$emit("updateFile", { index: this.index, val: newVal });
      },
      deep: true
    },
    uploadTask: function() {
      this.uploadTask.on(
        "state_changed",
        sp => {
          this.progressUpload = Math.floor(
            (sp.bytesTransferred / sp.totalBytes) * 100
          );
        },
        null,
        () => {
          this.uploadTask.snapshot.ref.getDownloadURL().then(firebaseUrl => {
            this.uploadEnd = true;
            this.uploading = false;
            this.firebaseUrl = firebaseUrl;
            this.localFile.firebaseUrl = firebaseUrl;
            console.log("Finished uploading, firebase URL", firebaseUrl);
          });
        }
      );
    }
  },
  methods: {
    deleteFile() {
      const that = this;
      const firebaseUrl = this.localFile.firebaseUrl;
      if (!firebaseUrl) {
        that.$emit("deleteFile", { index: that.index, file: that.localFile });
        console.log(
          "deleting without contacting firebase (no firebaseUrl found"
        );
        that.deleting = false;
        return;
      }

      let image = this.$firebase.storage().refFromURL(firebaseUrl);
      //let image = new Promise(function(resolve, reject){console.log('hi')})
      this.deleting = true;
      image
        .delete()
        .then(function() {
          console.log("file deleted");
          that.$emit("deleteFile", { index: that.index, file: that.localFile });
          that.deleting = false;
        })
        .catch(function(error) {
          console.log("an error occurred", error);
          if (error.code === "storage/object-not-found") {
            // go ahead, the image was not there
            console.log("still removing it, file was not there");
            that.$emit("deleteFile", {
              index: that.index,
              file: that.localFile
            });
          } else {
            that.$store.commit(
              "setMessage",
              { title: "Error", message: error, duration: 15000 },
              { root: true }
            );
          }
          that.deleting = false;
        });
    },
    onFilePicked(files) {
      if (files[0]) {
        this.uploading = true;
        this.localFile.fileName = this.fileName = files[0].name;
        const storageRef = this.$firebase
          .storage()
          .ref(
            this.contentType + "/" + Math.random() + "_" + this.localFile.title
          );
        this.uploadTask = storageRef.put(files[0]);
      }
    }
  }
};
</script>

<style>
</style>
