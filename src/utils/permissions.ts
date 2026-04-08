import { Platform } from 'react-native';
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';

export async function requestGallerySavePermission() {
  // ✅ Android 13+ → no permission needed to SAVE images
  if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
    return RESULTS.GRANTED;
  }

  const permission =
    Platform.OS === 'ios'
      ? PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY // ✅ write-only on iOS
      : PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE; // ✅ Android ≤12

  const status = await check(permission);

  if (status === RESULTS.DENIED) {
    return await request(permission);
  }

  return status;
}
