<template>
  <div>
    <slot />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

@Component
export default class LoadMoreItems extends Vue {

  mounted() {
    this.$emit('render');
  }
}
</script>
<style lang="scss" scoped>
</style>
