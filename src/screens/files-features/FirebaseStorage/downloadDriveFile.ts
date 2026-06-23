import RNFS from 'react-native-fs';
import axiosClient from '../../../api/axiosClient';
import { API_ENDPOINTS } from '../../../constants/end-points';
import { ApiEnvelope, DriveNode } from '../../../types/drive';

interface DownloadResponse {
  url: string;
  expiresAt: number;
  item: DriveNode;
}

// Keep filenames filesystem-safe (the signed URL already names the file; this is
// just the local cache copy).
const safeName = (name: string) => name.replace(/[/\\?%*:|"<>]/g, '_');

// Fetch a short-lived signed GET URL and download the file's bytes to the app
// cache, reporting progress as 0..1. Returns the local file path. Opening the
// file is done separately (after the blocking modal is dismissed) so the native
// viewer isn't presented underneath our modal.
export async function downloadDriveFile(
  item: DriveNode,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const res = await axiosClient.get<ApiEnvelope<DownloadResponse>>(
    `${API_ENDPOINTS.DRIVE_FILES}/${item._id}/download-url`,
  );
  const { url } = res.data.responseData;

  // Namespace by id so two files with the same name don't collide.
  const localPath = `${RNFS.CachesDirectoryPath}/${item._id}-${safeName(
    item.name,
  )}`;

  let total = 0;

  const { statusCode } = await RNFS.downloadFile({
    fromUrl: url,
    toFile: localPath,
    // `begin` is needed on iOS for progress events to fire; it also gives us a
    // reliable content length up front.
    begin: ({ contentLength }) => {
      total = contentLength;
    },
    progressInterval: 100, // throttle JS callbacks to every 100ms
    progress: ({ bytesWritten, contentLength }) => {
      const len = contentLength > 0 ? contentLength : total;
      if (len > 0) {
        onProgress?.(Math.min(1, bytesWritten / len));
      }
    },
  }).promise;

  if (statusCode < 200 || statusCode >= 300) {
    throw new Error(`Download failed (${statusCode})`);
  }

  onProgress?.(1);
  return localPath;
}
