import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../../constants/Colors';
import Loader from '../../../../components/common/Loader';
import { DriveNode } from '../../../../types/drive';
import FolderSvg from '../../../../assets/svgs/folder_24dp_300.svg';
import MoreVertSvg from '../../../../assets/svgs/more_vert_24dp_300.svg';
import RenameSvg from '../../../../assets/svgs/edit_24dp_300.svg';
import DeleteSvg from '../../../../assets/svgs/delete_24dp_300.svg';
import CloseSvg from '../../../../assets/svgs/cancel_24dp_300.svg';
import { getFileIcon } from './fileIcon';
import CircularProgress from './CircularProgress';
import { styles } from './DriveItemRow.styles';

// Precomputed outside the worklet — moderateScale must not run on the UI thread.
const ACTIONS_SLIDE = moderateScale(16);

interface Props {
  item: DriveNode;
  onPress: (item: DriveNode) => void;
  onRename?: (item: DriveNode) => void;
  onDelete?: (item: DriveNode) => void | Promise<void>;
  // While this file downloads, show the live percentage in place of its icon.
  downloading?: boolean;
  percent?: number; // 0..1
}

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

// One row: folder (tappable to open) or file. The more_vert toggle slides the
// icon left and reveals rename/delete actions, while the name stays in place.
const DriveItemRow = ({
  item,
  onPress,
  onRename,
  onDelete,
  downloading,
  percent = 0,
}: Props) => {
  const isFolder = item.type === 'folder';

  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const progress = useSharedValue(0);

  const setMenu = (next: boolean) => {
    setOpen(next);
    progress.value = withTiming(next ? 1 : 0, { duration: 220 });
  };

  // Tapping the row opens the item — unless actions are showing, then it closes.
  const handleRowPress = () => {
    if (open) {
      setMenu(false);
      return;
    }
    onPress(item);
  };

  const select = (cb?: (item: DriveNode) => void) => {
    setMenu(false);
    cb?.(item);
  };

  // Delete keeps the menu open so the loader shows in place of the icon.
  const handleDeletePress = async () => {
    if (deleting) {
      return;
    }
    setDeleting(true);
    try {
      await onDelete?.(item);
    } finally {
      setDeleting(false);
    }
  };

  // Hide the more_vert icon while the actions are showing.
  const moreStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));

  // Dim the file info so a long name doesn't clash with the actions.
  const infoStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value * 0.7,
  }));

  // Actions fade + slide in from the right.
  const actionsStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateX: (1 - progress.value) * ACTIONS_SLIDE }],
  }));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={handleRowPress}
      >
        <View style={styles.iconSquare}>
          {downloading ? (
            <CircularProgress percent={percent} />
          ) : isFolder ? (
            <FolderSvg
              width={moderateScale(24)}
              height={moderateScale(24)}
              fill={Colors.primary}
            />
          ) : (
            <Image
              source={getFileIcon(item.name, item.contentType)}
              style={styles.fileImage}
              resizeMode="contain"
            />
          )}
        </View>

        <Animated.View style={[styles.info, infoStyle]}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {isFolder ? 'Folder' : formatBytes(item.size)}
          </Text>
        </Animated.View>

        <Animated.View style={moreStyle} pointerEvents={open ? 'none' : 'auto'}>
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => setMenu(!open)}
            hitSlop={moderateScale(6)}
          >
            <MoreVertSvg
              width={moderateScale(22)}
              height={moderateScale(22)}
              fill={Colors.grey_400}
            />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      {/* Rename / delete squares pinned to the right edge. */}
      <Animated.View
        style={[styles.actions, actionsStyle]}
        pointerEvents={open ? 'auto' : 'none'}
      >
        <TouchableOpacity
          style={styles.actionSquare}
          onPress={() => select(onRename)}
        >
          <RenameSvg
            width={moderateScale(22)}
            height={moderateScale(22)}
            fill={Colors.white}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionSquare}
          onPress={handleDeletePress}
          disabled={deleting}
        >
          {deleting ? (
            <Loader size={moderateScale(16)} color={Colors.white} />
          ) : (
            <DeleteSvg
              width={moderateScale(22)}
              height={moderateScale(22)}
              fill={Colors.white}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => setMenu(false)}
          hitSlop={moderateScale(6)}
        >
          <CloseSvg
            width={moderateScale(22)}
            height={moderateScale(22)}
            fill={Colors.grey_500}
          />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default DriveItemRow;
