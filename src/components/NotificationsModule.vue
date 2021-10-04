<template>
  <v-snackbar
      :max-width="notificationMaxWidth"
      :timeout="notificationTimeout"
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
        v-bind="attrs"
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
    this.showNotification = false;
    this.showNotification = true;
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

