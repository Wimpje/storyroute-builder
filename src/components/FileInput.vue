<template>
  <div>
    <v-card outline>
      <v-card-title class="headline">
        {{ type }} bestand {{ index + 1 }}
      </v-card-title>

      <v-card-text>
        <v-text-field
          :id="'file' + index + 'title'"
          dense
          :value="file.title"
          name="title"
          :label="$t('file.title')"
          @change.native="update($event)"
        />
        <v-text-field
          :id="'file' + index + 'description'"
          dense
          :value="file.description"
          name="description"
          :label="$t('file.description')"
          @change.native="update($event)"
        />
        <v-select
          v-model="type"
          dense
          :items="contentTypes"
          :label="$t('content.type')"
          @change.native="update($event)"
        />
        <v-file-input
          v-if="type"
          :id="'file'+type+index"
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

        <img
          v-if="(uploadEnd || file.firebaseUrl) && type === 'image'"
          :src="file.firebaseUrl"
          width="20%"
        >
        <video 
          v-if="(uploadEnd || file.firebaseUrl) && type === 'video'"
          :src="file.firebaseUrl"
          width="200"
          controls
        />
        <audio
          v-if="(uploadEnd || file.firebaseUrl) && type === 'audio'"
          :src="file.firebaseUrl"
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
      type:'other',
      progressUpload: 0,
      fileName: "",
      uploadTask: "",
      uploading: false,
      uploadEnd: false,
      firebaseUrl: "",
      localFile: {},
      deleting: false
    };
  },
  computed: {
    value() {
      return this.file.file ? this.file.file : "file.ext";
    },
    label() {
      return this.$i18n.t("content." + (this.type ? this.type : "other"));
    },
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
    },
    accept: {
      get() {
        switch (this.type) {
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
              this.localFile.firebaseUrl = firebaseUrl
              this.$emit("firebaseUrl", firebaseUrl);
              this.$emit('updateFile', {index: this.index, val: this.localFile})
            });
          }
        );
      }
    },
  created() {
    this.type = this.file.type
  },
  methods: {
    deleteFile() {
      const that = this
      if(!this.file.firebaseUrl) {
        that.$emit("deleteFile", {index: that.index, file: that.file});
        console.log('deleting without contacting firesbase (no firebaseUrl found')
        return
      }

      let image = this.$firebase.storage().refFromURL(this.file.firebaseUrl);
      //let image = new Promise(function(resolve, reject){console.log('hi')})
      this.deleting = true
      image.delete().then(function() {
        console.log('file deleted');
        that.$emit("deleteFile", {index: that.index, file: that.file});
        that.deleting = false
      }).catch(function(error) {
        that.$store.commit('setMessage', {title: 'Error', message: error, duration: 15000}, { root: true })
        console.log('an error occurred', error);
        that.deleting = false
      });
      
    },
    onFilePicked(files){
      if(files[0]){
        this.uploading = true
        this.localFile.fileName = this.fileName = files[0].name
        const storageRef = this.$firebase.storage().ref(this.type + '/'+ Math.random() + '_'  + this.localFile.title);
        this.uploadTask  = storageRef.put(files[0]);
      }

    },
    update: function(e) {
      console.log(`setting file ${this.index} from form element ${e.target.name}: ${e.target.value}`, e);
      this.localFile[e.target.name] = e.target.value
      this.$emit('updateFile', {index: this.index, val: this.localFile})
    },
  }
};
</script>

<style>
</style>
