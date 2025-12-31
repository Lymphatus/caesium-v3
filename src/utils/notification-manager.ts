import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import useSettingsStore from '@/stores/settings.store.ts';
import { warn } from '@tauri-apps/plugin-log';

export async function askForNotificationPermission() {
  const permissionGranted = await isPermissionGranted();

  if (!permissionGranted) {
    return await requestPermission();
  }
}

export async function showNotification({ title, body }: { title: string; body?: string }) {
  const permissionGranted = await isPermissionGranted();
  const notificationsAllowed = useSettingsStore.getState().allowNotifications;
  if (permissionGranted && useSettingsStore.getState().allowNotifications) {
    sendNotification({ title, body });
    return;
  }
  if (!permissionGranted) {
    await warn(
      "Notification permission wasn't granted, can't send notifications. Please check your system settings and allow notifications for this app.",
    );
  }
  if (!notificationsAllowed) {
    await warn("Notifications are disabled in the app settings, can't send notifications.");
  }
}
