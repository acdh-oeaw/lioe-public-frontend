<template>
  <v-snackbar
      bottom
      right
      :max-width="notificationMaxWidth"
      :timeout="notificationTimeout"
      v-model="showNotification"
    >
      {{ activeNotivication.message }}
      <v-btn
        color="red"
        text
        v-bind="attrs"
        @click="showNotification = false"
      >
        Dismiss
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

  activeNotivication: Notification = {message:''};

  showNotification: boolean = false;

  notificationMaxWidth = 10;
   

  get notificationTimeout(){
      return this.activeNotivication.timeout || 4000;
  }

  notify(notification: Notification) {
    this.showNotification = true;
  }

  addNotfication(notification: Notification) {
    this.activeNotivication = notification;
  }

  @Watch('activeNotivication')
  onActiveNotificationChanged() {
    this.notify(this.activeNotivication);
  }

  mounted() {
    $bus.$on('notify', (notification: Notification) => {
      this.addNotfication(notification);
    });
  }
}



</script>

