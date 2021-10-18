<template>
  <v-snackbar
      :max-width="notificationMaxWidth"
      :timeout="0"
      v-model="showNotification"

      bottom
      right
      outlined
      elevation="4"
      :color="notificationStyle.color"
    >
      {{ activeNotification.message }}
      <v-btn
        text
        @click="showNotification = false"
      >
        <v-icon>close</v-icon>
      </v-btn>

    </v-snackbar>
</template>
<script lang="ts">
import { Notification } from '@src/utilities/notifications';
import { Component, Vue, Watch } from 'vue-property-decorator';
import { $bus } from '..';

@Component({
  name: 'NotificationModule'
})
export default class NotificationsModule extends Vue {

  pendingNotifications: Notification[] = [];

  activeNotification: Notification = {message:''};

  showNotification: boolean = false;

  notificationMaxWidth = 10;
   
  activeNotificationStyle: NotificationStyle = {
    color: 'success',
  }

  timeouts: boolean[] = []

  

  get notificationTimeout(){
      return this.activeNotification.timeout || 4000;
  }

  get notificationStyle(){
    switch (this.activeNotification.type) {
      case 'success':
        this.activeNotificationStyle.color = 'success'
        break;
      case 'error':
        this.activeNotificationStyle.color = 'error'
        break;
      default:
        this.activeNotificationStyle.color = 'grey'
        break;
    }
    return this.activeNotificationStyle;
  }

  notify(notification: Notification) {
    this.showNotification = true;
    this.timeouts.push(true);
    setTimeout(() => { this.timeouts.pop();}, this.notificationTimeout);
  }

  @Watch('timeouts')
  timeoutWatcher() {
    this.timeouts.length > 0 
      ? this.showNotification = true 
      : this.showNotification = false;
  }

  onClose() {
    this.timeouts.length = 0;
  }

  addNotfication(notification: Notification) {
    this.activeNotification = notification;
  }

  @Watch('activeNotification')
  onActiveNotificationChanged() {
    this.notify(this.activeNotification);
  }

  mounted() {
    $bus.$on('notify', (notification: Notification) => {
      this.addNotfication(notification);
    });
  }
}

interface NotificationStyle {
  color: string;
  
}


</script>

