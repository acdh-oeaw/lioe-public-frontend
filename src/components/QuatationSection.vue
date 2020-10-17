<template>
  <v-col class="cgrey" v-if="pubDatePfusch && title && autName && noteName">
    <h4>
      Zitation
      <v-btn fab icon>
        <v-icon @click="copyContent">mdi mdi-content-copy</v-icon>
      </v-btn>
    </h4>
    <span v-html="content"></span>
  </v-col>
</template>
<script lang="ts">
// tslint:disable:max-line-length
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import * as _ from "lodash";
import { userStore } from "../store/user";
import { format } from "date-fns";

@Component({
  components: {},
})
export default class QuatationSection extends Vue {
  @Prop() autor: any;
  @Prop() noteAutor: any;
  @Prop() publicationDate: any;
  @Prop({ default: "" }) xml: string;
  @Prop({ default: "" }) filename: string;
  @Prop() article: any;
  get autName() {
    if (!this.autor) return "";
    const ns = this.autor.fullname.split(" ");
    ns.unshift(",");
    ns.unshift(ns[ns.length - 1]);
    ns.pop();
    return ns.join(" ").replace(/ , /, ", ");
  }

  get content() {
    return `
${this.autName} (${this.pubDatePfusch}): <i>${this.title}</i>.
Mit einem Lautungsüberblick von ${this.noteName}. In: Wörterbuch der bairischen
Mundarten in Österreich (WBÖ). Publiziert über das Lexikalische
Informationssystem Österreich (LIÖ).
URL: <a href="https://lioe.dioe.at/articles/${
      this.filename || this.title
    }">https://lioe.dioe.at/articles/${this.title}</a>
[Zugriff: ${this.date}].`;
  }

  get quote() {
    return `
${this.autName} (${this.pubDatePfusch}): ${
      this.title
    }. Mit einem Lautungsüberblick von ${
      this.noteName
    }. In: Wörterbuch der bairischen Mundarten in Österreich (WBÖ). Publiziert über das Lexikalische Informationssystem Österreich (LIÖ). URL: https://lioe.dioe.at/articles/${
      this.filename || this.title
    } [Zugriff: ${this.date}].`;
  }

  copyContent() {
    // @ts-ignore
    navigator.clipboard.writeText(this.quote);
  }

  get title() {
    if (!this.xml) return "";
    const a = this.xml.match(/<title>(.*)<\/title>/);
    return (a || [])[1] || "";
  }

  get noteName() {
    if (!this.noteAutor || !this.noteAutor.name) return "";

    return this.noteAutor.name;
  }

  get date() {
    return format(new Date(), "DD.MM.YYYY");
  }
  get pubDatePfusch() {
    if (!this.xml) return "";
    const dates = this.xml.match(/\d{4}(-\d{2}){2}/g) || [];
    console.log("dates", dates);
    let d: any = dates
      .map((a) => new Date(a))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return !!new Date(d).getTime() ? format(new Date(d), "DD.MM.YYYY") : "";
  }
}
</script>

<style lang="scss">
.cgrey {
  padding-top: 0%;
  background-color: #e1eff4;
  top: 100px;
  width: 80%;
  margin: auto;
  border-radius: 5px;
}
</style>
