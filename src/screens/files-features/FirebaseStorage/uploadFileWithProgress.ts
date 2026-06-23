import axiosClient from '../../../api/axiosClient';
import { API_ENDPOINTS } from '../../../constants/end-points';
import { ApiEnvelope, DriveNode, UploadTicket } from '../../../types/drive';

export interface UploadProgress {
  loaded: number;
  total: number;
}

export interface UploadParams {
  parentId: string;
  uri: string;
  name: string;
  type: string | null;
  size: number | null;
}

// Enterprise upload with real byte progress: request a signed URL, PUT the
// bytes via XHR (fetch can't report upload progress), then confirm.
export async function uploadFileWithProgress(
  { parentId, uri, name, type, size }: UploadParams,
  onProgress: (p: UploadProgress) => void,
): Promise<DriveNode> {
  const blob = await (await fetch(uri)).blob();
  const contentType = type || blob.type || 'application/octet-stream';
  const byteSize = size && size > 0 ? size : blob.size;

  const reqRes = await axiosClient.post<ApiEnvelope<UploadTicket>>(
    API_ENDPOINTS.DRIVE_UPLOADS_REQUEST,
    { parentId, name, contentType, size: byteSize },
  );
  const { item, upload } = reqRes.data.responseData;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', upload.url);
    Object.entries(upload.headers).forEach(([k, v]) =>
      xhr.setRequestHeader(k, String(v)),
    );
    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        onProgress({ loaded: e.loaded, total: e.total });
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.send(blob);
  });

  const confirmRes = await axiosClient.post<ApiEnvelope<{ item: DriveNode }>>(
    API_ENDPOINTS.DRIVE_UPLOADS_CONFIRM,
    { itemId: item._id },
  );
  return confirmRes.data.responseData.item;
}
