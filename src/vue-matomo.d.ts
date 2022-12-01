import { PluginObject } from "vue";

declare module 'vue/types/vue' {
    interface Vue {
      $matomo: any
    }
}
export interface VueLazyMatomoOptions {}
export interface VueLazyMatomoPluginObject extends PluginObject<VueLazyMatomoOptions> {}
declare var VueMatomo: VueLazyMatomoPluginObject;

export default VueMatomo;