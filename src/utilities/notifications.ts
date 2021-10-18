import { $bus } from "..";

export function $addNotification( notification:Notification) {
    $bus.$emit('notify', notification);
  }
  
  export interface Notification {
      message: String;
      type?: String;
      timeout?: number;
  };
  