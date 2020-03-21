<template>
  <v-container>
    <h1>Nieuws</h1>
    <v-row>
      <v-btn @click="createArticle">
        <v-icon>mdi-pencil</v-icon>Nieuw artikel
      </v-btn>
    </v-row>
    <v-row>
      <v-col>
        <v-list two-line>
          <template v-for="(item, index) in articles">
            <v-list-item
              :key="item.id"
              ripple
              @click="selectArticle(item)"
            >
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
                <v-list-item-subtitle class="text--primary">
                  {{ item.text }}
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action>
                <v-list-item-action-text><v-icon>mdi-edit</v-icon></v-list-item-action-text>
              </v-list-item-action>
            </v-list-item>
            <v-divider
              v-if="index + 1 < articles.length"
              :key="index"
            />
          </template>
        </v-list>
      </v-col>
      <v-col>
        <EditArticle
          v-if="showEditDialog"      
          :display.sync="showEditDialog"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import EditArticle from "@/components/EditArticle.vue";
import { mapGetters } from "vuex";

export default {
  components: {
    EditArticle
  },
  data() {
    return {
      showEditDialog: false,
    };
  },
  created() {

  },
  mounted() {
    this.$store.commit("setCurrentArticleToNone");
    this.$store.dispatch("initArticles");
  },
  methods: {
    selectArticle(n) {
      console.log("selecting article", n);
      this.showEditDialog = true
      this.$store.commit('setCurrentArticle', n)
    },
    createArticle() {
      const n = {
        title: 'Nieuw artikel!'
      }
      this.$store.dispatch("createArticle", n)
      this.showEditDialog = true
    }
  },
  computed: {
    ...mapGetters(["articles"])
  }
};
</script>

<style>
</style>
