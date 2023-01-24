<template>
  <div class="cookie-notice-container" :class="{active :showCookieNotification}" >
    <p class="mt-4">
      {{ message }} <a @click="$router.push({
        path: '/resources?link=home%2Fdatenschutz%2F',
      });">hier</a>.
    </p>
    <v-btn @click="onAccept()">Akzeptieren</v-btn>
    <v-btn @click="onDecline()">Ablehnen</v-btn>
  </div>

</template>
<script lang="ts">
import { getTrackingConsent, giveTrackingConsent, rejectTracking } from '@src/utilities/trackingHelpers';
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class CookieNotification extends Vue {

  showCookieNotification = false;


  message: string = 'Dieses Projekt verwendet Cookies & Websitetracking um statistische Informationen über unsere Nutzer zu sammeln. '
  + 'Diese Information wird nur verwendet um das Benutzererlebnis zu verbessern. Die Daten die wir sammeln werden nicht an dritte weitergegeben. '
  + 'Wenn sie damit nicht einverstanden sind klicken sie auf "Ablehnen", um mehr zu erfahren klicken sie '

  onAccept() {
    this.acceptCookies();
  }

  mounted() {
    this.showCookieNotification = (getTrackingConsent() === undefined);
  }

  acceptCookies() {
    giveTrackingConsent();
    this.hidePopUp()
  }

  onDecline() {
    rejectTracking();
    this.hidePopUp();
  }

  logMatomo() {
    console.log("🚀 ~ Matomo: ", this.$matomo )
    if(this.$matomo) {
      console.log("🚀 ~ file: CookieNotification.vue:28 ~ CookieNotification ~ LogMatomo ~ this.$matomo.hasConsent())", this.$matomo.hasConsent());
    }
    console.log('Consent:', getTrackingConsent());
  }

  hidePopUp() {
    this.showCookieNotification = false;
  }
}
</script>
<style>

.cookie-notice-container {
  position: fixed;
  bottom: 0vh;
  left: 0vw;
  width: 100vw;
  transform:translateY(100%);
  height: fit-content;
  background-color: var(--primary);
  padding-left: 4vw;
  padding-right: 4vw;
  background-color: white;
  border-top: 0.2rem solid var(--v-primary-lighten2);
  border-right: 0.2rem solid var(--v-primary-lighten2);
  border-left: 0.2rem solid var(--v-primary-lighten2);
  border-radius: 0.75em 0.75em 0 0;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2.5rem;
  z-index: 10;
  transition: all 500ms ease-in-out;

}

.cookie-notice-container.active {
  transform:translateY(0);
}

</style>
