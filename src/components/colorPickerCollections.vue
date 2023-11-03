<template>
  <div
        :color="borderColor"
        style="width: 18px; height: 18px"
    >
        <v-menu :close-on-content-click="false" offset-y top>
        <template v-slot:activator="{ on }">
            <v-btn
                v-on="on"
                :color="baseBorderColor"
                elevation="1"
                fab
                style="
                    width: 18px;
                    height: 18px;
                    margin-bottom: 20px;
                "
            >
                <v-btn
                    :color="baseFillColor"
                    elevation="1"
                    fab
                    style="width: 15px; height: 15px"
                ></v-btn>
            </v-btn>
        </template>
        <div id="menuItem" style="background:white">
            Farbe des Rahmens
            <v-color-picker
            mode="hexa"

            v-on:update:color="updateBc($event)"
            v-model="baseBorderColor"
            ></v-color-picker>
            Farbe des Inhalts
            <v-color-picker
            mode="hexa"

            v-on:update:color="updateFc($event)"
            v-model="baseFillColor"
            ></v-color-picker>
        </div>
        </v-menu>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class colorPickerCollections extends Vue {
    @Prop({ default: "#000" }) borderColor: string;
    @Prop({ default: "#111" }) fillColor: string;

    baseFillColor = "#FFDDDD92";
    baseBorderColor = "#000000FF";


    @Watch('borderColor')
    updateBorderColor() {
        this.baseBorderColor = this.borderColor;
    }

    @Watch('fillColor')
    updateFillColor() {
        this.baseFillColor = this.fillColor;
    }

    updateFc(event?: any) {
        this.$emit('update:fillColor', event.hexa);
    }

    updateBc(event?: any) {
        this.$emit('update:borderColor', event.hexa);
    }

    mounted() {
        this.baseFillColor = this.fillColor;
        this.baseBorderColor = this.borderColor;
    }
}
</script>
