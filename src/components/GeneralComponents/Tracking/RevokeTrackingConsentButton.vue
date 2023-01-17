<template>

</template>
<script lang="ts">

export default class RevokeTrackingConsentButton {

  revokeCookieAndTrackingConsent() {
    this.$matomo && this.$matomo.forgetConsentGiven() && this.$matomo.orgetCookieConsentGiven() && this.$matomo.optUserOut()
  }
}

</script>
