import Vue from 'vue';
import VueI18n from 'vue-i18n';
import messages from '@/localization.json'

Vue.use(VueI18n)

const i18n = new VueI18n({
  locale: 'nl', // set locale
  messages, // set locale messages
})
export default i18n;
