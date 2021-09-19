export function $addNotification(context:any, notification:Notification) {
    context.$root.$emit('notify', notification);
  }
  
  export interface Notification {
      message: String;
      type?: String;
  };
  