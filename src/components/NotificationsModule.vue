<template>
  <div>
    <v-snackbar
      vertical
      bottom
      right
      :timeout="2000"
      time
      v-model="showNotification"
    >
    
      {{ activeNotivication.message }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="red"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>
<script lang="ts">
import { Notification } from '@src/utilities/notifications';
import { Component, Vue, Watch } from 'vue-property-decorator';


@Component({
  name: 'NotificationModule'
})
export default class NotificationsModule extends Vue {

  pendingNotifications: Notification[] = [];

  activeNotivication: Notification = {message:''};

  showNotification: boolean = false;

  notify(notification: Notification) {
    console.log('Notify', notification.message);
  }

  addNotfication(notification: Notification) {
    this.activeNotivication = notification;
  }

  @Watch('activeNotivication')
  onActiveNotificationChanged() {
    this.showNotification = true;
    this.notify(this.activeNotivication);
  }

  mounted() {
    this.$root.$on('notify', (notification: Notification) => {
      this.addNotfication(notification);
    });
  }
}



</script>

