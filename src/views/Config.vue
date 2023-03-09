<template>
  <v-container>
    <h1>Config</h1>
    <v-btn @click="exportEverythingToJson">
      export        
    </v-btn>
    <v-progress-circular
      v-if="uploading"
      :rotate="360"
      :value="progressUpload"
    />
    <a
      v-if="firebaseUrl"
      :href="firebaseUrl"
    >{{ firebaseUrl }}</a>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      progressUpload: 0,
      uploadTask: "",
      uploading: false,
      uploadEnd: false,
      firebaseUrl: "",
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
            console.log("Finished uploading, firebase URL", firebaseUrl);
          });
        }
      );
    }
  },
  mounted() {
    this.$store.dispatch("initArticles");
  },
  methods: {
    exportEverythingToJson() {
      const storageRef = this.$firebase
          .storage()
          .ref("json/content.json");
        var message = 'data:text/plain;base64,5b6p5Y+344GX44G+44GX44Gf77yB44GK44KB44Gn44Go44GG77yB';
        const toUpload = {
          routes: this.routes,
          pois: this.pois,
          articles : this.articles
        }
        console.log(JSON.stringify(toUpload))
        
        this.uploadTask = storageRef.putString('data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(toUpload)))), 'data_url');
        //this.uploadTask = storageRef.putString(JSON.stringify(toUpload));
        this.uploadTask.catch(err => console.error(err))

    }
  },
  computed: {
    ...mapGetters({
      routes: "getRoutes",
      pois: "getPois",
      articles: "articles"
    })
  }
}
</script>

<style>

</style>
