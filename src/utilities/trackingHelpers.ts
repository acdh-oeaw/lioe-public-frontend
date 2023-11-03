import { loadFromLocalStorage, safeToLocalStorage } from "@/utilities/helper-functions";

const trackingConsentKey = 'trackingConsent';

export const trackingConsentChangedEvenKey = 'lioe-tracking-consent-changed'
export function giveTrackingConsent() {
  startTracking();

  safeToLocalStorage<boolean|undefined>(trackingConsentKey, true);
  dispatchTrackingChangedEvent(getTrackingConsent());
}

export function rejectTracking() {
  // @ts-ignore
  window._paq.push(['forgetConsentGiven']);

  safeToLocalStorage<boolean|undefined>(trackingConsentKey, false);
  dispatchTrackingChangedEvent(getTrackingConsent());
}

export function forgetTrackingConsent() {
  // @ts-ignore
  window._paq.push(['forgetConsentGiven']);

  safeToLocalStorage<boolean|undefined>(trackingConsentKey, undefined);
  dispatchTrackingChangedEvent(getTrackingConsent());
}

function dispatchTrackingChangedEvent(consent: boolean | undefined) {
  window.dispatchEvent(new CustomEvent(trackingConsentChangedEvenKey, {
    detail: {
      consent: consent
    }
  }));
}

export function getTrackingConsent() : boolean | undefined {
  return loadFromLocalStorage<boolean>(trackingConsentKey);
}

export function initMatomoTracking() : boolean | undefined {
  if(!getTrackingConsent()) {
    // require user tracking consent before processing data
    // @ts-ignore
    _paq.push(['requireConsent']);

    return false;
  }

  startTracking();
  return true;
}


function startTracking() {
  // @ts-ignore
  window._paq.push(['trackPageView']);

  // @ts-ignore
  window._paq.push(['enableLinkTracking']);

  // @ts-ignore
  window._paq.push(['setConsentGiven']);

}
