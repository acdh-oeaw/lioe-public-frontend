<template>
  <div @scroll="onScrollFakeScrollbar" class="fake-scrollbar">
    <div :style="{height: '10px', width: width + 'px'}" class="fake-scrollbar-inner" />
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import ResizeObserver from '../resizeobserver'

@Component
export default class FakeScrollbar extends Vue {
  @Prop() forElement: string
  width: number = 1000

  async mounted() {
    // to be extra safe
    await Vue.nextTick()
    await Vue.nextTick()
    const el = document.querySelector(this.forElement)
    if (el instanceof HTMLElement) {
      el.addEventListener('scroll', (e) => {
        if (e.target instanceof HTMLElement) {
          this.$el.scrollLeft = e.target.scrollLeft
        }
      })
      const observer = new ResizeObserver((ml) => {
        if (ml[0]) {
          this.width = ml[0].target.scrollWidth
        }
      })
      observer.observe(el, { box: 'content-box' })
    }
  }

  // when the fake scrollbar scrolls, scroll the table
  onScrollFakeScrollbar(e: Event) {
    const dt = document.querySelector(this.forElement)
    const x = (e.target as HTMLElement).scrollLeft
    if (dt instanceof HTMLElement) {
      dt.scrollLeft = x
    }
  }
}
</script>
<style lang="scss" scoped>
.fake-scrollbar {
  height: 20px;
  width: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
}
</style>
