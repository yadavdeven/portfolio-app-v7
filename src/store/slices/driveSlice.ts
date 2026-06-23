import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { API_ENDPOINTS } from '../../constants/end-points';
import { ApiEnvelope, Crumb, DriveNode } from '../../types/drive';
import axiosClient from '../../api/axiosClient';

// Initial load: fetch (and lazily bootstrap) the root folder AND its children
// in one go, so the screen can render fully at once. Auth token is attached by
// the axiosClient request interceptor.
export const bootstrapDrive = createAsyncThunk<{
  root: DriveNode;
  items: DriveNode[];
}>('drive/bootstrap', async () => {
  const rootRes = await axiosClient.get<ApiEnvelope<{ item: DriveNode }>>(
    API_ENDPOINTS.DRIVE_ROOT,
  );
  const root = rootRes.data.responseData.item;

  const childRes = await axiosClient.get<ApiEnvelope<{ items: DriveNode[] }>>(
    `${API_ENDPOINTS.DRIVE_FOLDERS}/${root._id}/children`,
  );
  return { root, items: childRes.data.responseData.items };
});

// List the direct children (folders + files) of a folder.
export const fetchChildren = createAsyncThunk<DriveNode[], string>(
  'drive/fetchChildren',
  async folderId => {
    const res = await axiosClient.get<ApiEnvelope<{ items: DriveNode[] }>>(
      `${API_ENDPOINTS.DRIVE_FOLDERS}/${folderId}/children`,
    );
    return res.data.responseData.items;
  },
);

// Create a folder inside the given parent. Returns the new node so we can
// drop it straight into the current listing without a refetch.
export const createFolder = createAsyncThunk<
  DriveNode,
  { parentId: string; name: string }
>('drive/createFolder', async ({ parentId, name }) => {
  const res = await axiosClient.post<ApiEnvelope<{ item: DriveNode }>>(
    API_ENDPOINTS.DRIVE_FOLDERS,
    { parentId, name },
  );
  return res.data.responseData.item;
});

// Rename a folder or file. Returns the updated node so we can swap it in place.
export const renameNode = createAsyncThunk<
  DriveNode,
  { id: string; name: string }
>('drive/renameNode', async ({ id, name }) => {
  const res = await axiosClient.patch<ApiEnvelope<{ item: DriveNode }>>(
    `${API_ENDPOINTS.DRIVE_ITEMS}/${id}`,
    { name },
  );
  return res.data.responseData.item;
});

// Delete a file, or a folder and its whole subtree. Returns the deleted id so
// it can be dropped from the current listing.
export const deleteNode = createAsyncThunk<string, string>(
  'drive/deleteNode',
  async itemId => {
    await axiosClient.delete(`${API_ENDPOINTS.DRIVE_ITEMS}/${itemId}`);
    return itemId;
  },
);

// Folders always before files, then alphabetically (case-insensitive).
const sortItems = (items: DriveNode[]): DriveNode[] =>
  [...items].sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folder' ? -1 : 1;
    }
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

interface DriveState {
  root: DriveNode | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;

  // Contents of the folder currently being viewed.
  items: DriveNode[];
  listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  listError: string | null;

  // Trail from root → current folder. Last entry is the current folder.
  breadcrumb: Crumb[];
}

const initialState: DriveState = {
  root: null,
  status: 'idle',
  error: null,
  items: [],
  listStatus: 'idle',
  listError: null,
  breadcrumb: [],
};

export const driveSlice = createSlice({
  name: 'drive',
  initialState,
  reducers: {
    resetDrive: () => initialState,
    // Descend into a folder: append it to the breadcrumb.
    enterFolder: (state, action: PayloadAction<Crumb>) => {
      state.breadcrumb.push(action.payload);
    },
    // Jump back to a breadcrumb entry: drop everything after it.
    navigateToCrumb: (state, action: PayloadAction<number>) => {
      state.breadcrumb = state.breadcrumb.slice(0, action.payload + 1);
    },
    // Insert a freshly uploaded file into the current listing (folders-first).
    driveItemAdded: (state, action: PayloadAction<DriveNode>) => {
      state.items = sortItems([...state.items, action.payload]);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(bootstrapDrive.pending, state => {
        state.status = 'loading';
        state.error = null;
        // Children arrive together, so the list is "loading" too.
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(bootstrapDrive.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.root = action.payload.root;
        // Start the trail at root the first time we load it.
        if (state.breadcrumb.length === 0) {
          state.breadcrumb = [
            { _id: action.payload.root._id, name: action.payload.root.name },
          ];
        }
        // Root's children are ready in the same pass — render everything at once.
        state.items = sortItems(action.payload.items);
        state.listStatus = 'succeeded';
      })
      .addCase(bootstrapDrive.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load Drive';
      })
      .addCase(fetchChildren.pending, state => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = sortItems(action.payload);
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.error.message ?? 'Failed to load folder';
      })
      .addCase(deleteNode.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i._id !== action.payload);
      })
      .addCase(renameNode.fulfilled, (state, action) => {
        // Swap the renamed node in and re-sort (the new name affects order).
        state.items = sortItems(
          state.items.map(i =>
            i._id === action.payload._id ? action.payload : i,
          ),
        );
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        // Keep folders-first ordering after inserting the new folder.
        state.items = sortItems([...state.items, action.payload]);
      });
  },
});

export const { resetDrive, enterFolder, navigateToCrumb, driveItemAdded } =
  driveSlice.actions;
export default driveSlice.reducer;
