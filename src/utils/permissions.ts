import { Platform } from 'react-native';
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';

// Camera capture needs runtime permission on Android (we declared CAMERA in the
// manifest). On iOS, react-native-image-picker auto-prompts via the Info.plist
// usage string, so nothing to do here. Gallery picking needs no permission at
// all (iOS PHPicker / Android Photo Picker run out-of-process).
export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }
  let status = await check(PERMISSIONS.ANDROID.CAMERA);
  if (status === RESULTS.DENIED) {
    status = await request(PERMISSIONS.ANDROID.CAMERA);
  }
  return status === RESULTS.GRANTED;
}

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
