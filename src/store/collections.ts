// not yet in use
import { createModule, mutation, action, extractVuexModule } from "vuex-class-component";

const VuexModule = createModule({
    namespaced: "user",
    strict: false,
    target: "nuxt",
}) 

export class Collection extends VuexModule{

}
  