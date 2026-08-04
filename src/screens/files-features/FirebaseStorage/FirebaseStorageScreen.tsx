import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { moderateScale } from 'react-native-size-matters';
import {
  pick,
  types,
  isErrorWithCode,
  errorCodes,
} from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { requestCameraPermission } from '../../../utils/permissions';
import FileViewer from 'react-native-file-viewer';

// Provided by React Native's runtime but not in this project's TS lib config.
declare const requestIdleCallback: (
  callback: () => void,
  options?: { timeout?: number },
) => number;
import {
  bootstrapDrive,
  createFolder,
  deleteNode,
  driveItemAdded,
  enterFolder,
  fetchChildren,
  navigateToCrumb,
  renameNode,
} from '../../../store/slices/driveSlice';
import UploadReviewModal, { PickedFile } from './components/UploadReviewModal';
import FolderOpenSvg from '../../../assets/svgs/folder_open_24dp_300.svg';
import MoreVertSvg from '../../../assets/svgs/more_vert_24dp_300.svg';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import SearchSvg from '../../../assets/svgs/search_24dp_300.svg';
import CreateFolderModal from './components/CreateFolderModal';
import MediaPickerSheet from './components/MediaPickerSheet';
import { useToast } from '../../../providers/ToastProvider';
import Wrapper from '../../../components/common/Wrapper';
import { downloadDriveFile } from './downloadDriveFile';
import { styles } from './FirebaseStorageScreen.styles';
import DriveItemRow from './components/DriveItemRow';
import RenameModal from './components/RenameModal';
import Breadcrumb from './components/Breadcrumb';
import { DriveNode } from '../../../types/drive';
import Colors from '../../../constants/Colors';
import Controls from './components/Controls';
import FabMenu from './components/FabMenu';

const FirebaseStorageScreen = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { root, status, error, items, listStatus, listError, breadcrumb } =
    useAppSelector(state => state.drive);

  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renameTarget, setRenameTarget] = useState<DriveNode | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [mediaSheetOpen, setMediaSheetOpen] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<'camera' | 'gallery' | null>(
    null,
  );
  // Files chosen by a picker, awaiting confirmation in the review modal.
  const [pickedFiles, setPickedFiles] = useState<PickedFile[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  // Download-and-open state: the modal is shown while `downloadingFile` is set.
  const [downloadingFile, setDownloadingFile] = useState<DriveNode | null>(
    null,
  );
  const [downloadPercent, setDownloadPercent] = useState(0);
  // Toast queued to fire only once the modal has fully closed.
  const [pendingToast, setPendingToast] = useState<{
    text: string;
    type: 'default' | 'error';
  } | null>(null);

  const currentCrumb = breadcrumb[breadcrumb.length - 1];
  const currentFolderId = currentCrumb?._id;
  const currentName = currentCrumb?.name ?? root?.name ?? '';

  // Bootstrap loads root + its children together; skip the reactive child
  // fetch for that first folder so we don't double-request.
  const skipNextChildFetch = useRef(false);

  // Initial load: fetch root AND its children in one pass (render at once).
  useEffect(() => {
    if (!root) {
      skipNextChildFetch.current = true;
      dispatch(bootstrapDrive());
    }
  }, [root, dispatch]);

  // Always re-enter the screen at the root folder.
  useFocusEffect(
    useCallback(() => {
      dispatch(navigateToCrumb(0));
    }, [dispatch]),
  );

  // Reload contents whenever the current folder changes (navigation).
  useEffect(() => {
    if (!currentFolderId) {
      return;
    }
    if (skipNextChildFetch.current) {
      // Bootstrap already loaded this folder's children.
      skipNextChildFetch.current = false;
      return;
    }
    dispatch(fetchChildren(currentFolderId));
  }, [currentFolderId, dispatch]);

  const handleOpenItem = async (item: DriveNode) => {
    if (item.type === 'folder') {
      dispatch(enterFolder({ _id: item._id, name: item.name }));
      return;
    }
    // File: download to cache then open in the device's default app.
    if (downloadingFile) {
      return; // one at a time
    }
    setDownloadPercent(0);
    setDownloadingFile(item);
    try {
      const localPath = await downloadDriveFile(item, setDownloadPercent);
      // Download finished. Force the ring to 100% and let it visually fill
      // (matches the 200ms withTiming in CircularProgress) before clearing the
      // indicator and handing off to the native viewer.
      setDownloadPercent(1);
      await new Promise<void>(resolve => setTimeout(resolve, 250));
      setDownloadingFile(null);
      await FileViewer.open(localPath, { showOpenWithDialog: true });
    } catch (e: any) {
      showToast(e?.message ?? 'Could not open the file', 'error');
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleRename = (item: DriveNode) => {
    setRenameTarget(item);
  };

  const handleConfirmRename = async (name: string) => {
    if (!renameTarget) {
      return;
    }
    setRenaming(true);
    try {
      await dispatch(renameNode({ id: renameTarget._id, name })).unwrap();
      setRenameTarget(null);
      setPendingToast({ text: `Renamed to "${name}"`, type: 'default' });
    } catch (e: any) {
      showToast(e?.message ?? 'Could not rename', 'error');
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = async (item: DriveNode) => {
    try {
      await dispatch(deleteNode(item._id)).unwrap();
      showToast(`Deleted "${item.name}"`, 'default');
    } catch (e: any) {
      showToast(e?.message ?? 'Could not delete', 'error');
    }
  };

  // FAB → Upload file: pick one or more documents, then show the review modal.
  const handleUpload = async () => {
    if (!currentFolderId) {
      return;
    }
    try {
      const picked = await pick({
        type: [types.allFiles],
        allowMultiSelection: true,
      });
      const files: PickedFile[] = picked.map(f => ({
        uri: f.uri,
        name: f.name ?? 'file',
        type: f.type,
        size: f.size,
      }));
      if (files.length) {
        setPickedFiles(files);
        setReviewOpen(true);
      }
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      showToast('Could not open the file picker', 'error');
    }
  };

  // Pick photo(s)/video(s) from the camera or gallery → review modal.
  const pickMedia = async (from: 'camera' | 'gallery') => {
    if (!currentFolderId) {
      return;
    }
    // Gallery is permission-less; camera needs a runtime grant.
    if (from === 'camera') {
      const granted = await requestCameraPermission();
      if (!granted) {
        showToast('Camera permission is required to take a photo', 'error');
        return;
      }
    }

    const res =
      from === 'camera'
        ? await launchCamera({ mediaType: 'mixed' })
        : await launchImageLibrary({ mediaType: 'mixed', selectionLimit: 0 });

    if (res.didCancel) {
      return;
    }
    if (res.errorCode) {
      showToast(res.errorMessage ?? 'Could not open ' + from, 'error');
      return;
    }
    const files: PickedFile[] = (res.assets ?? [])
      .filter(a => !!a.uri)
      .map(a => ({
        uri: a.uri as string,
        name: a.fileName ?? `media_${Date.now()}`,
        type: a.type ?? null,
        size: a.fileSize ?? null,
      }));
    if (files.length) {
      setPickedFiles(files);
      setReviewOpen(true);
    }
  };

  // FAB → Camera: open the custom action sheet. The actual picker launches from
  // the sheet's onModalHide so it doesn't fight the closing animation.
  const handleMedia = () => setMediaSheetOpen(true);

  const onSelectMedia = (from: 'camera' | 'gallery') => {
    setPendingMedia(from);
    setMediaSheetOpen(false);
  };

  const closeReview = () => {
    setReviewOpen(false);
    setPickedFiles([]);
  };

  const handleCreateFolder = async (name: string) => {
    if (!currentFolderId) {
      return;
    }
    setCreating(true);
    try {
      await dispatch(
        createFolder({ parentId: currentFolderId, name }),
      ).unwrap();
      // Close the modal first; the toast fires from onModalHide so they
      // don't overlap.
      setFolderModalOpen(false);
      setPendingToast({ text: `Folder "${name}" created`, type: 'default' });
    } catch (e: any) {
      showToast(e?.message ?? 'Could not create folder', 'error');
    } finally {
      setCreating(false);
    }
  };

  const retryRoot = () => {
    skipNextChildFetch.current = true;
    dispatch(bootstrapDrive());
  };

  const retryList = () => {
    if (currentFolderId) {
      dispatch(fetchChildren(currentFolderId));
    }
  };

  const rootLoading = status === 'loading' || status === 'idle';

  return (
    <View style={styles.fill}>
      <Wrapper
        headerTitle="Firebase Storage"
        scrollView={false}
        containerStyle={styles.content}
      >
        {rootLoading && (
          <ActivityIndicator
            size="large"
            color={Colors.primary}
            style={styles.center}
          />
        )}

        {status === 'failed' && (
          <View style={styles.center}>
            <Text style={[styles.message, styles.error]}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={retryRoot}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'succeeded' && (
          <Animated.View style={styles.fill} entering={FadeIn.duration(300)}>
            {/* Active (current) folder row, above the breadcrumb. */}
            <View style={styles.folderHeader}>
              <View style={styles.accentBar} />
              <FolderOpenSvg
                width={moderateScale(24)}
                height={moderateScale(24)}
                fill={Colors.grey_primary}
              />
              <Text style={styles.activeFolder} numberOfLines={1}>
                {currentName}
              </Text>
              <TouchableOpacity style={styles.headerIconBtn}>
                <SearchSvg
                  width={moderateScale(25)}
                  height={moderateScale(25)}
                  fill={Colors.black}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerIconBtn}>
                <MoreVertSvg
                  width={moderateScale(25)}
                  height={moderateScale(25)}
                  fill={Colors.black}
                />
              </TouchableOpacity>
            </View>

            <Breadcrumb
              crumbs={breadcrumb}
              onCrumbPress={index => dispatch(navigateToCrumb(index))}
            />
            <Controls />

            {listStatus === 'loading' && (
              <ActivityIndicator
                size="large"
                color={Colors.primary}
                style={styles.center}
              />
            )}

            {listStatus === 'failed' && (
              <View style={styles.center}>
                <Text style={[styles.message, styles.error]}>{listError}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={retryList}>
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {listStatus === 'succeeded' && (
              <FlatList
                data={items}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <DriveItemRow
                    item={item}
                    onPress={handleOpenItem}
                    onRename={handleRename}
                    onDelete={handleDelete}
                    downloading={downloadingFile?._id === item._id}
                    percent={downloadPercent}
                  />
                )}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyTitle}>No files or folders</Text>
                    <Text style={styles.emptySubtitle}>
                      Tap + to create a folder or upload a file
                    </Text>
                  </View>
                }
              />
            )}
          </Animated.View>
        )}
      </Wrapper>

      <FabMenu
        onUpload={handleUpload}
        onCreateFolder={() => setFolderModalOpen(true)}
        onCamera={handleMedia}
      />

      <MediaPickerSheet
        isVisible={mediaSheetOpen}
        onSelect={onSelectMedia}
        onClose={() => setMediaSheetOpen(false)}
        onModalHide={() => {
          if (pendingMedia) {
            const from = pendingMedia;
            setPendingMedia(null);
            // onModalHide = sheet fully hidden; requestIdleCallback then waits
            // for the JS thread to go idle (native dismissal tick settled)
            // before the picker presents — adapts to device speed, with a
            // timeout as a safety cap so it always fires.
            requestIdleCallback(() => pickMedia(from), { timeout: 500 });
          }
        }}
      />

      {currentFolderId && (
        <UploadReviewModal
          isVisible={reviewOpen}
          files={pickedFiles}
          parentId={currentFolderId}
          destinationName={currentName}
          onUploaded={node => dispatch(driveItemAdded(node))}
          onClose={closeReview}
        />
      )}

      <CreateFolderModal
        isVisible={folderModalOpen}
        parentName={currentName}
        loading={creating}
        onCreate={handleCreateFolder}
        onCancel={() => setFolderModalOpen(false)}
        onModalHide={() => {
          if (pendingToast) {
            showToast(pendingToast.text, pendingToast.type);
            setPendingToast(null);
          }
        }}
      />

      <RenameModal
        isVisible={!!renameTarget}
        currentName={renameTarget?.name ?? ''}
        itemType={renameTarget?.type ?? 'file'}
        loading={renaming}
        onRename={handleConfirmRename}
        onCancel={() => setRenameTarget(null)}
        onModalHide={() => {
          if (pendingToast) {
            showToast(pendingToast.text, pendingToast.type);
            setPendingToast(null);
          }
        }}
      />
    </View>
  );
};

export default FirebaseStorageScreen;
