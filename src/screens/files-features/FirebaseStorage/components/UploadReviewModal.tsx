import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { DEVICE_WIDTH } from '../../../../constants/Dimensions';
import { FONTS } from '../../../../utils/typography';
import Colors from '../../../../constants/Colors';
import ButtonStandard from '../../../../components/common/ButtonStandard';
import Loader from '../../../../components/common/Loader';
import CancelSvg from '../../../../assets/svgs/cancel_24dp_300.svg';
import FolderOpenSvg from '../../../../assets/svgs/folder_open_24dp_300.svg';
import { DriveNode } from '../../../../types/drive';
import { uploadFileWithProgress } from '../uploadFileWithProgress';
import { getFileIcon } from './fileIcon';

export interface PickedFile {
  uri: string;
  name: string;
  type: string | null;
  size: number | null;
}

interface Props {
  isVisible: boolean;
  files: PickedFile[];
  parentId: string;
  destinationName: string;
  onUploaded: (node: DriveNode) => void;
  onClose: () => void;
}

type RowStatus = 'pending' | 'uploading' | 'done' | 'failed';

interface Row {
  id: string;
  file: PickedFile;
  status: RowStatus;
  loaded: number;
  total: number;
}

const formatBytes = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

interface RowProps {
  row: Row;
  locked: boolean;
  onRemove: (id: string) => void;
}

// One file row. The bar fill is driven by a shared value so each progress
// update eases smoothly (hooks can't live inside the parent's .map).
const FileProgressRow = ({ row, locked, onRemove }: RowProps) => {
  const progress = useSharedValue(0);

  const showBar = row.status === 'uploading' || row.status === 'done';
  const target =
    row.status === 'done'
      ? 1
      : row.total > 0
      ? Math.min(1, row.loaded / row.total)
      : 0;

  useEffect(() => {
    progress.value = withTiming(target, { duration: 200 });
  }, [target, progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  const pct = Math.round(target * 100);

  return (
    <Animated.View style={styles.fileRow} layout={LinearTransition}>
      <Image
        source={getFileIcon(row.file.name, row.file.type)}
        style={styles.fileIcon}
        resizeMode="contain"
      />
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {row.file.name}
        </Text>

        {showBar ? (
          <Animated.View entering={FadeIn} layout={LinearTransition}>
            <View style={styles.track}>
              <Animated.View style={[styles.fill, fillStyle]} />
            </View>
            <View style={styles.progressMeta}>
              <Text style={styles.metaLeft}>
                {formatBytes(row.loaded)} of {formatBytes(row.total)}
              </Text>
              {row.status === 'done' ? (
                <Text style={styles.metaDone}>Done</Text>
              ) : (
                <Text style={styles.metaRight}>{pct}%</Text>
              )}
            </View>
          </Animated.View>
        ) : row.status === 'failed' ? (
          <Text style={styles.failedText}>Failed — tap upload to retry</Text>
        ) : (
          !!row.file.size && (
            <Text style={styles.fileSize}>{formatBytes(row.file.size)}</Text>
          )
        )}
      </View>

      {!locked && (
        <TouchableOpacity
          style={styles.removeBtn}
          hitSlop={moderateScale(8)}
          onPress={() => onRemove(row.id)}
        >
          <CancelSvg
            width={moderateScale(18)}
            height={moderateScale(18)}
            fill={Colors.grey_400}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default function UploadReviewModal({
  isVisible,
  files,
  parentId,
  destinationName,
  onUploaded,
  onClose,
}: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  // Set when the user cancels mid-upload so the loop stops after the current file.
  const cancelRef = useRef(false);

  // Seed the internal list each time the modal opens.
  useEffect(() => {
    if (isVisible) {
      setRows(
        files.map((f, i) => ({
          id: `${i}-${f.uri}`,
          file: f,
          status: 'pending',
          loaded: 0,
          total: f.size ?? 0,
        })),
      );
      setUploading(false);
      setDone(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const patchRow = (id: string, patch: Partial<Row>) =>
    setRows(prev => prev.map(r => (r.id === id ? { ...r, ...patch } : r)));

  const removeRow = (id: string) =>
    setRows(prev => prev.filter(r => r.id !== id));

  const startUpload = async () => {
    if (uploading) {
      return;
    }
    // Only upload rows not already uploaded (so retry skips finished ones).
    const pending = rows.filter(r => r.status !== 'done');
    if (pending.length === 0) {
      return;
    }
    cancelRef.current = false;
    setUploading(true);
    let failed = 0;

    for (const row of pending) {
      if (cancelRef.current) {
        break; // user cancelled — stop starting new uploads
      }
      patchRow(row.id, { status: 'uploading', loaded: 0 });
      try {
        const node = await uploadFileWithProgress(
          {
            parentId,
            uri: row.file.uri,
            name: row.file.name,
            type: row.file.type,
            size: row.file.size,
          },
          ({ loaded, total }) => patchRow(row.id, { loaded, total }),
        );
        onUploaded(node);
        patchRow(row.id, { status: 'done' });
      } catch {
        patchRow(row.id, { status: 'failed' });
        failed++;
      }
    }

    setUploading(false);
    if (cancelRef.current) {
      return; // cancelled — the modal is already closing
    }
    // All done → success state; partial failure leaves failed rows shown for
    // retry. Either way the modal shows the result, so no toast.
    if (failed === 0) {
      setDone(true);
    }
  };

  // Cancel: allowed while idle or uploading (stops the batch + closes).
  const handleCancel = () => {
    cancelRef.current = true;
    onClose();
  };

  // Backdrop dismissal is blocked while uploading and after success.
  const dismiss = () => {
    if (!uploading && !done) {
      onClose();
    }
  };

  const count = rows.length;
  const title = done
    ? `${count} ${count > 1 ? 'files' : 'file'} uploaded`
    : count > 1
    ? `${count} files selected`
    : 'Upload file';

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={dismiss}
      onBackButtonPress={dismiss}
      backdropOpacity={0.4}
      animationIn="zoomIn"
      animationOut="zoomOut"
      animationInTiming={250}
      animationOutTiming={200}
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
    >
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.info}>Uploading to</Text>
          <FolderOpenSvg
            width={moderateScale(16)}
            height={moderateScale(16)}
            fill={Colors.primary}
          />
          <Text style={styles.infoStrong} numberOfLines={1}>
            {destinationName}
          </Text>
        </View>

        <ScrollView
          style={styles.list}
          nestedScrollEnabled
          showsVerticalScrollIndicator
          bounces={false}
        >
          {rows.map(row => (
            <FileProgressRow
              key={row.id}
              row={row}
              locked={uploading || done}
              onRemove={removeRow}
            />
          ))}
        </ScrollView>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.cancelBtn,
              (uploading || done) && styles.btnDisabled,
            ]}
            activeOpacity={0.7}
            disabled={uploading || done}
            onPress={handleCancel}
          >
            <Text style={styles.cancelText}>Cancel upload</Text>
          </TouchableOpacity>

          <View
            style={styles.uploadBtnWrap}
            pointerEvents={uploading ? 'none' : 'auto'}
          >
            {uploading ? (
              <View style={styles.uploadingBtn}>
                <Text style={styles.uploadingText}>Uploading</Text>
                <Loader size={moderateScale(12)} color={Colors.white} />
              </View>
            ) : done ? (
              <ButtonStandard
                btnLabel="OK"
                btnWidth="100%"
                marginTop={0}
                onPress={onClose}
              />
            ) : (
              <ButtonStandard
                btnLabel="Upload files"
                btnWidth="100%"
                marginTop={0}
                onPress={startUpload}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    width: DEVICE_WIDTH * 0.92,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(12),
    paddingTop: moderateScale(20),
    paddingHorizontal: moderateScale(18),
    paddingBottom: moderateScale(20),
  },
  title: {
    color: Colors.grey_primary,
    fontSize: moderateScale(17),
    fontFamily: FONTS.lato_bold,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(6),
  },
  info: {
    color: Colors.grey_400,
    fontSize: moderateScale(12.5),
    fontFamily: FONTS.lato_regular,
    marginRight: moderateScale(6),
  },
  infoStrong: {
    flex: 1,
    marginLeft: moderateScale(4),
    color: Colors.grey_200,
    fontSize: moderateScale(12.5),
    fontFamily: FONTS.lato_bold,
  },
  list: {
    marginTop: moderateScale(16),
    maxHeight: moderateScale(300),
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg_500,
  },
  fileIcon: {
    width: moderateScale(22),
    height: moderateScale(22),
    marginRight: moderateScale(12),
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    maxWidth: '90%',
    fontSize: moderateScale(12.5),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_100,
  },
  fileSize: {
    marginTop: moderateScale(2),
    fontSize: moderateScale(11, 0.3),
    fontFamily: FONTS.lato_regular,
    color: Colors.grey_400,
  },
  track: {
    marginTop: moderateScale(7),
    height: moderateScale(5),
    borderRadius: moderateScale(3),
    backgroundColor: Colors.bg_500,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: moderateScale(3),
    backgroundColor: Colors.primary,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: moderateScale(4),
  },
  metaLeft: {
    fontSize: moderateScale(10.5, 0.3),
    fontFamily: FONTS.lato_regular,
    color: Colors.grey_400,
  },
  metaRight: {
    fontSize: moderateScale(10.5, 0.3),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_200,
  },
  metaDone: {
    fontSize: moderateScale(10.5, 0.3),
    fontFamily: FONTS.lato_bold,
    color: Colors.green_shade,
  },
  failedText: {
    marginTop: moderateScale(3),
    fontSize: moderateScale(10.5, 0.3),
    fontFamily: FONTS.lato_bold,
    color: Colors.error,
  },
  removeBtn: {
    padding: moderateScale(4),
    marginLeft: moderateScale(8),
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: moderateScale(16),
    marginTop: moderateScale(18),
  },
  uploadBtnWrap: {
    flex: 1,
  },
  // Mirrors ButtonStandard's look, but keeps the loader right next to the text.
  uploadingBtn: {
    width: '100%',
    height: moderateScale(40, 0.4),
    borderRadius: 7,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: moderateScale(8),
    borderWidth: 1,
    borderColor: Colors.bg_600,
    opacity: 0.6,
  },
  uploadingText: {
    fontSize: moderateScale(14, 0.3),
    fontFamily: FONTS.open_sans_semi_bold,
    color: Colors.white,
  },
  cancelBtn: {
    flex: 1,
    height: moderateScale(40),
    borderRadius: moderateScale(7),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: moderateScale(1),
    borderColor: Colors.bg_300,
  },
  cancelText: {
    fontSize: moderateScale(13.5),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_200,
  },
  btnDisabled: {
    opacity: 0.4,
  },
});
