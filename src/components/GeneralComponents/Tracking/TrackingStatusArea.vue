<template>
  <div>
    <p class="text-center">
      Tracking Status: {{ trackingStatus }}
      <v-btn x-small @click="rejectCookiesAndTracking" class="mx-3" v-if="trackingStatus === 'Active'">Zustimmung zurücknehmen</v-btn>
    </p>
  </div>
</template>

<script lang="ts">
import { getTrackingConsent, rejectTracking, trackingConsentChangedEvenKey } from '@/utilities/trackingHelpers'
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class TrackingStatusArea extends Vue{

  consent?: boolean = true;

  rejectCookiesAndTracking() {
    rejectTracking();
  }

  get tackingConsent() {
    return this.consent;
  }

  get trackingStatus() : string {
    let status: string = 'Active';

    if(this.tackingConsent === false) {
      status = 'Opted out';
    }

    return status;
  }

  mounted() {
    this.consent = getTrackingConsent();

    // @ts-ignore
    window.addEventListener(trackingConsentChangedEvenKey, e => {
      // @ts-ignore
      this.consent = e.detail.consent;
    });
  }
}
</script>
