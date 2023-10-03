import { $bus } from "@/main";

export function $addNotification( notification:Notification) {
    $bus.$emit('notify', notification);
}

export interface Notification {
    message: String;
    type?: String;
    timeout?: number;
};
  