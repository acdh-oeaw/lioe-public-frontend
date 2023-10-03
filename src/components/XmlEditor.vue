<template>
  <CodeMirror
    ref="codemirror"
    :value="value"
    @input="$emit('input', $event)"
    :options="editorOptions"
  />
</template>

<script lang="ts">
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/duotone-dark.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/dialog/dialog.css';

import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import CodeMirror from "@/components/codemirror.vue";

import "codemirror/addon/edit/matchbrackets.js";
import "codemirror/mode/xml/xml.js";
import "codemirror/addon/search/search.js";
import "codemirror/addon/search/searchcursor.js";
import "codemirror/addon/search/jump-to-line.js";
import "codemirror/addon/dialog/dialog.js";
import "codemirror/addon/edit/closetag.js";
import "codemirror/addon/fold/xml-fold.js";
import "codemirror/addon/fold/foldcode.js";
import "codemirror/addon/hint/xml-hint.js";
import "codemirror/addon/hint/show-hint.js";

@Component({
  components: {
    CodeMirror,
  },
})
export default class XmlEditor extends Vue {
  @Prop() value: string;
  editorOptions = {
    mode: "application/xml",
    styleActiveLine: true,
    lineNumbers: true,
    lineWrapping: true,
    tabSize: 2,
    line: true,
    extraKeys: { "Ctrl-Space": "autocomplete" },
    theme: "duotone-dark",
    height: "auto",
    width: "100%",
    viewportMargin: Infinity,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    hintOptions: {},
    autoCloseTags: true,
    foldGutter: true,
    autoCloseBrackets: true,
    matchBrackets: true,
  };
  @Watch("show")
  update() {
    const editor = (this.$refs.codemirror as any).editor;
    editor.refresh();
  }
  async mounted() {
    await this.$nextTick();
    this.update();
  }
}
</script>

<style>
.CodeMirror {
  height: auto;
  font-size: 12px;
}
</style>
