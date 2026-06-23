// Client-side mirror of the backend DriveNode model. A node is either a folder
// or a file in the user's tree.
export type DriveNodeType = 'folder' | 'file';
export type DriveNodeStatus = 'pending' | 'ready';

export interface DriveNode {
  _id: string;
  userId: string;
  type: DriveNodeType;
  name: string;
  parentId: string | null; // null only for the root folder
  path: string;
  ancestors: string[];

  // File-only fields
  storageKey?: string;
  size?: number;
  contentType?: string;
  downloadUrl?: string;
  status: DriveNodeStatus;

  createdAt: string;
  updatedAt: string;
}

// One hop in the breadcrumb trail (root → … → current folder).
export interface Crumb {
  _id: string;
  name: string;
}

// Ticket returned by POST /drive/uploads/request: the pending node plus a
// short-lived signed PUT URL the client uploads the bytes to directly.
export interface UploadTicket {
  item: DriveNode;
  upload: {
    url: string;
    headers: Record<string, string>;
    expiresAt: number;
  };
}

// Standard backend envelope: { isSuccess, message, responseData }.
export interface ApiEnvelope<T> {
  isSuccess: boolean;
  message: string;
  responseData: T;
}
