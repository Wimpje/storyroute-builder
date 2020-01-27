<template>
  <div>
    <v-row>
      <v-col> 
        <v-text-field
          :id="'file' + index + 'title'"
          dense
          :value="file.title"
          :name="'file' + index + 'title'"
          :label="$t('file.title')"
        />
      </v-col>
      <v-col>
        <v-select
          v-model="type"
          dense
          :items="fileTypes"
          :label="$t('file.type')"
        />
      </v-col>
      <v-col
        md="1"
      >
        <v-btn
          icon
          color="warning" 
          @click="deleteFile"
        >
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-file-input
          v-if="type"
          :id="'file'+type+index"
          :label="label"
          :full-width="true"
          :accept="accept"
          filled
          :prepend-icon="icon"
          
          :hint="$t('file.uploadHint')"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {Schema, FileTypes} from '@/store/modules/pois.js'
export default {
 props: {
    file: {
      type: Object,
      default() {
        return Schema
      }
    },
    index: {
      type: Number,
      default() {
        return 0
      }
    }
  },
  data() {
    return {
      type:''
    }
 },
  computed: {    
    value() {
      return this.file.file ? this.file.file : 'file.ext'
    },
    label ()  {
      return this.$i18n.t('file.' + (this.type ? this.type : 'other'))
    },
    fileTypes () {
      return FileTypes
    },
    icon: {
        get() {
          switch (this.file.type) {
            case 'audio':
              return 'mdi-volume-high'
            case 'video':
              return 'mdi-video-vintage'
            case 'image':
              return 'mdi-camera'
            default:
              return 'mdi-file-multiple'
          }
        }
      },
      accept: {
        get() {
          switch (this.file.type) {
            case 'audio':
              return 'audio/*'
            case 'video':
              return 'video/*'
            case 'image':
              return 'image/*'
            default:
              return '*'
          }
        }
      }
  },
 methods: {
   deleteFile() {
     this.$emit('delete')
   }
 }
}
</script>

<style>

</style>
