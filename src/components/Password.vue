<template>
  <div class="pa-5 text-center fill-height">
    <h1 class="text-light mt-5 mb-5">Zugriffsgeschützter Bereich</h1>
    <v-form @submit.prevent="submit">
      <v-layout>
        <v-flex xs12>
          <v-text-field
            class="mx-auto"
            style="max-width: 550px"
            :error-messages="wrong ? 'Passwort falsch.' : []"
            autofocus
            v-model="entered"
            placeholder="Password"
            type="password"
            required
            solo>
            <v-btn @click="submit" depressed color="accent" dark slot="append">ok</v-btn>
          </v-text-field>
        </v-flex>
        <v-flex>
        </v-flex>
      </v-layout>
    </v-form>
    <p class="grey--text">
      Bitte geben Sie das Ihnen zugewiesene Passwort an.<br>
      Hinweise zu unserem Forschungsdatenmanagement finden Sie <a href="https://lioe-cms.acdh-dev.oeaw.ac.at/lioetxt/wboe-artikel/hinweise-zum-forschungsdatenmanagement/" target="_blank" @click.prevent="subDialog = true">hier</a>.<br>
      Bei Fragen wenden sie sich bitte an <a href="mailto:philipp.stoeckle@oeaw.ac.at">Dr. Philipp Stöckle</a>.
    </p>
    <v-dialog v-model="subDialog" max-width="1000" color="#2b2735" scrollable>
      <v-card text class="fill-height pl-4 pt-4 pr-4 pb-3">
        <div class="close-btn">
          <v-btn @click="subDialog = false" text icon><v-icon dark>close</v-icon></v-btn>
        </div>
        <v-card-text class="pa-0 fill-height">
          <info-text class="pa-4 white fill-height" path="wboe-artikel/hinweise-zum-forschungsdatenmanagement/" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { userStore } from '../store/user'
import InfoText from '@components/InfoText.vue'
import InfoBox from '@components/InfoBox.vue'

@Component({
  components: {
    InfoBox,
    InfoText
  }
})
export default class Password extends Vue {

  @Prop() initial_url: string
  regular = 'ZmxpZW5zY2hlbG4='
  advanced = 'ZmV1cmV0emVu'
  master = 'ZnJpc2NoZW4='
  entered: string|null = null
  wrong = false
  userStore = userStore
  subDialog = false
  submit() {
    // tslint:disable-next-line:max-line-length
    if (
      this.entered !== null &&
      (
        btoa(this.entered) === this.regular
        || btoa(this.entered) === this.advanced
        || btoa(this.entered) === this.master
      )
      ) {
      this.userStore.isLoggedIn = true
      this.userStore.showComment = false
      this.userStore.articleStatus = ['proofed']
      if (btoa(this.entered) === this.master) {
        this.userStore.showPdfPrintButton = true
        this.userStore.showComment = true
        this.userStore.articleStatus = [''] // all
      } else if (btoa(this.entered) === this.advanced) {
        this.userStore.showPdfPrintButton = true
        this.userStore.showComment = true
        this.userStore.articleStatus = [
          'peer correction',
          'internal correction',
          'external correction',
          'finished'
        ]
      } else if (btoa(this.entered) === this.regular){
        this.userStore.showPdfPrintButton = false
        this.userStore.showComment = false
        this.userStore.articleStatus = [ 'finished' ]
      }
      if (this.initial_url) {
        this.$router.replace(this.initial_url)
      } else {
        this.$router.push('/')
      }
    } else {
      this.wrong = true
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
