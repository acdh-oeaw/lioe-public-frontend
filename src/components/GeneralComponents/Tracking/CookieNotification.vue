<template>
  <div class="cookie-notice-container" :class="{active :showCookieNotification}" >
    <p class="mt-4">
      {{ message }} <a @click="$router.push({
        path: '/resources?link=home%2Fdatenschutz%2F',
      });">here</a>.
    </p>
    <v-btn @click="onAccept()">Accept</v-btn>
    <v-btn @click="onDecline()">Decline</v-btn>
  </div>

</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class CookieNotification extends Vue {

  showCookieNotification = true;

  message: string = 'This project uses website tracking and cookies to collect statistical information about our users.'
    + ' This information is only used to enhance the user experience. The information is not shared with any third party. We need your consent to gather this information. For more information click '

  onAccept() {
    this.acceptCookies();
  }

  async mounted() {
    // TODO: Try to await Matomo load through Timeout
    console.log('mounted cookie notification');
    this.showCookieNotification = !this.$matomo || (this.$matomo && this.$matomo.hasRememberedConsent());
  }

  acceptCookies() {
    this.$matomo.rememberConsentGiven(720)


    this.$matomo &&
    this.$matomo.rememberCookieConsentGiven(720)

    this.$matomo &&
    this.$matomo.forgetUserOptOut()

    this.logMatomo();

    this.hidePopUp()
  }

  onDecline() {
    this.rejectCookiesAndTracking();
  }
  rejectCookiesAndTracking () {
    this.$matomo && this.$matomo.optUserOut()

    this.logMatomo();

    this.hidePopUp();
  }

  logMatomo() {
    console.log("🚀 ~ Matomo: ", this.$matomo )
    if(this.$matomo) {
      console.log("🚀 ~ file: CookieNotification.vue:28 ~ CookieNotification ~ mounted ~ this.$matomo.hasRememberedConsent())", this.$matomo.hasRememberedConsent());

    }
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
  animation: 500ms ease-in-out 1 slideOutBottom forwards;

}
.cookie-notice-container.active {
  animation: 500ms ease-out 1s 1 slideInBottom both;
}

@keyframes slideInBottom {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0%);
  }
}

@keyframes slideOutBottom {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(100%);
  }
}

</style>
