<template>
  <v-col class="cgrey" v-if="(pubDatePfusch && title && autName) || isRetro">
    <h4>
      Zitation
      <v-btn fab icon>
        <v-icon @click="copyContent">mdi-content-copy</v-icon>
      </v-btn>
    </h4>
    <span v-html="content"></span>
  </v-col>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";
import { format } from "date-fns";

@Component({
  components: {},
})
export default class QuotationSection extends Vue {
  @Prop() autor: any
  @Prop() noteAutor: any
  @Prop() publicationDate: any
  @Prop({ default: "" }) xml: string
  @Prop({ default: "" }) filename: string
  @Prop() article: any
  @Prop() lautung: any
  @Prop() isRetro: boolean
  @Prop({ default: null}) pbFacs: string[];
  get autName() {
    if (!this.autor) return ""
    const ns = this.autor.fullname.split(" ")
    ns.unshift(",")
    ns.unshift(ns[ns.length - 1])
    ns.pop()
    return ns.join(' ').replace(/ , /, ", ")
  }

  get content() {
    let lautungsueberblick = this.noteName && this.lautung && this.lautung.length > 0 && this.lautung[0] && this.lautung[0].orgXmlObj && this.lautung[0].orgXmlObj.getXML() && this.lautung[0].orgXmlObj.getXML().length > 100 ? `Mit einem Lautungsüberblick von ${this.noteName}. ` : ''
    if (this.isRetro) {
      return this.title + '. In: Wörterbuch der bairischen Mundarten in Österreich (WBÖ). Publiziert über das Lexikalische Informationssystem Österreich (LIÖ). ' +
        'URL: <a href="https://lioe.dioe.at/articles/' + (this.filename || this.title).replace('#', '%23') + '">https://lioe.dioe.at/articles/' + (this.filename || this.title).replace('#', '%23') + '</a> [Zugriff: ' + this.date + '] ' +
        '(Originalquelle: Wörterbuch der bairischen Mundarten in Österreich.' + this.facsTxt + ').'
    } else {
      return `
${this.autName} (${this.pubDatePfusch}): <i>${this.title}</i>.
${lautungsueberblick}In: Wörterbuch der bairischen Mundarten in Österreich (WBÖ). Publiziert über das Lexikalische Informationssystem Österreich (LIÖ).
URL: <a href="https://lioe.dioe.at/articles/${this.filename || this.title}">https://lioe.dioe.at/articles/${this.filename || this.title}</a>
[Zugriff: ${this.date}].`;
    }
  }

  get facsTxt() {
    let facsTxt = ''
    if (this.pbFacs) {
      // console.log('yyyyy', (this.pbFacs as any).match(/WBÖ (\d+), (\d+)\./i) || [])
      const facsData = (this.pbFacs as any).match(/WBÖ (\d+), (\d+)\./i) || []
      const baende: any = {
        '1': '1970',
        '2': '1976',
        '3': '1983',
        '4': '1998',
        '5': '2015',
      }
      if (facsData[1]) {
        facsTxt += ' Bd. ' + facsData[1] + '. Herausgegeben im Auftrag der Österreichischen Akademie der Wissenschaften von der Kommission zur Schaffung des Österreichisch-Bayerischen Wörterbuches und zur Erforschung unserer Mundarten. Wien: Kommissionsverlag der Österreichischen Akademie der Wissenschaften.'
        facsTxt += baende[facsData[1]] ? ' ' + baende[facsData[1]] + '.' : ''
        facsTxt += facsData[2] ? ' S. ' + facsData[2] : ''
      }
    }
    return facsTxt
  }

  get quote() {
    if (this.isRetro) {
      return this.title + '. In: Wörterbuch der bairischen Mundarten in Österreich (WBÖ). Publiziert über das Lexikalische Informationssystem Österreich (LIÖ). ' +
        'URL: https://lioe.dioe.at/articles/' + (this.filename || this.title).replace('#', '%23') + ' [Zugriff: ' + this.date + '] ' +
        '(Originalquelle: Wörterbuch der bairischen Mundarten in Österreich.' + this.facsTxt + ').'
    } else {
      let lautungsueberblick = this.noteName && this.lautung && this.lautung.length > 0 && this.lautung[0] && this.lautung[0].orgXmlObj && this.lautung[0].orgXmlObj.getXML() && this.lautung[0].orgXmlObj.getXML().length > 100 ? `Mit einem Lautungsüberblick von ${this.noteName}. ` : ''
      return `${this.autName} (${this.pubDatePfusch}): ${
        this.title
      }. ${lautungsueberblick}In: Wörterbuch der bairischen Mundarten in Österreich (WBÖ). Publiziert über das Lexikalische Informationssystem Österreich (LIÖ). URL: https://lioe.dioe.at/articles/${
        this.filename || this.title
      } [Zugriff: ${this.date}].`;
    }
  }

  copyContent() {
    // @ts-ignore
    navigator.clipboard.writeText(this.quote);
  }

  get title() {
    if (!this.xml) return "";
    if (this.isRetro) {
      let lemma = (this.xml.replace(/\n/g, '').match(/<form type="lemma"(\n|.)*?<\/form>/gm) || [])[0]
      lemma = lemma ? (lemma.match(/<orth[^>]*>(.*)<\/orth>/) || [])[1] : '?'
      return lemma
    } else {
      const w = this.xml
        .replace(/\n/g, "")
        .match(/<form type="lemma"(\n|.)*?<\/form>/gm);
      console.log("w", w);

      const names: any = [];
      (w || []).forEach((a: string) => {
        names.push((a.match(/<orth>(.*)<\/orth>/) || [])[1]);
      });

      return names.join(", ");
    }
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
