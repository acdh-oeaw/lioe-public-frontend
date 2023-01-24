import { loadFromLocalStorage, safeToLocalStorage } from "./helper-functions";

const trackingConsentKey = 'trackingConsent';

export const trackingConsentChangedEvenKey = 'lioe-tracking-consent-changed'
export function giveTrackingConsent() {
  // @ts-ignore
  window._paq.push(['rememberConsentGiven']);

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
  if( getTrackingConsent() === false) {
    return false;
  }

  // @ts-ignore
  window._paq.push(['trackPageView']);

  // @ts-ignore
  window._paq.push(['enableLinkTracking']);
  return true;
}
