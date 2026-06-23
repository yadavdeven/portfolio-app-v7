import React, { useState } from 'react';
import { Pressable, Text, TouchableOpacity } from 'react-native';
import Animated, {
  interpolateColor,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../../constants/Colors';
import UploadFileSvg from '../../../../assets/svgs/upload_file_24dp_300.svg';
import CreateNewFolderSvg from '../../../../assets/svgs/create_new_folder_24dp_300.svg';
import AddPhotoSvg from '../../../../assets/svgs/add_a_photo_24dp_300.svg';
import { styles } from './FabMenu.styles';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
// Springy open/close shared by the background, options and the + icon.
const SPRING = { damping: 12, stiffness: 130, mass: 0.7 };

const RADIUS = moderateScale(96);

type SvgIcon = React.FC<{ width: number; height: number; fill: string }>;

interface Props {
  onUpload?: () => void;
  onCreateFolder?: () => void;
  onCamera?: () => void;
}

// The 3 options fan out along a quarter arc: straight up → up-left → left.
// Create folder sits at the top.
const OPTIONS: { key: string; Icon: SvgIcon; angleDeg: number; label: string }[] =
  [
    {
      key: 'folder',
      Icon: CreateNewFolderSvg,
      angleDeg: 90,
      label: 'Create folder',
    },
    {
      key: 'upload',
      Icon: UploadFileSvg,
      angleDeg: 135,
      label: 'Upload files',
    },
    {
      key: 'camera',
      Icon: AddPhotoSvg,
      angleDeg: 180,
      label: 'Camera / Gallery',
    },
  ];

interface OptionProps {
  progress: SharedValue<number>;
  open: boolean;
  tx: number;
  ty: number;
  Icon: SvgIcon;
  label: string;
  onPress: () => void;
}

const FabOption = ({
  progress,
  open,
  tx,
  ty,
  Icon,
  label,
  onPress,
}: OptionProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const t = progress.value;
    return {
      opacity: Math.max(0, t),
      transform: [
        { translateX: tx * t },
        { translateY: ty * t },
        { scale: 0.4 + 0.6 * Math.max(0, t) },
      ],
    };
  });

  return (
    <Animated.View
      style={[styles.option, animatedStyle]}
      pointerEvents={open ? 'auto' : 'none'}
    >
      <TouchableOpacity style={styles.optionBtn} onPress={onPress}>
        <Icon
          width={moderateScale(26)}
          height={moderateScale(26)}
          fill={Colors.white}
        />
      </TouchableOpacity>
      <Text style={styles.optionLabel} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
};

const FabMenu = ({ onUpload, onCreateFolder, onCamera }: Props) => {
  const progress = useSharedValue(0);
  const [open, setOpen] = useState(false);

  const setMenu = (next: boolean, onDone?: () => void) => {
    setOpen(next);
    progress.value = withSpring(next ? 1 : 0, SPRING, finished => {
      if (finished && onDone) {
        runOnJS(onDone)();
      }
    });
  };

  // Run the action only after the close animation settles, so the next
  // modal/sheet opens once the FAB menu has finished closing.
  const select = (cb?: () => void) => {
    setMenu(false, cb);
  };

  const handlerFor = (key: string) => {
    switch (key) {
      case 'folder':
        return () => select(onCreateFolder);
      case 'upload':
        return () => select(onUpload);
      default:
        return () => select(onCamera);
    }
  };

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 45}deg` }],
  }));

  const bgStyle = useAnimatedStyle(() => {
    const t = Math.max(0, progress.value);
    return { opacity: t, transform: [{ scale: t }] };
  });

  // When open, the FAB circle blends into the background (translucent overlay).
  const fabBgStyle = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, progress.value));
    return {
      backgroundColor: interpolateColor(
        t,
        [0, 1],
        [Colors.primary, 'rgba(255,255,255,0.22)'],
      ),
    };
  });

  return (
    <>
      {open && (
        <Pressable style={styles.backdrop} onPress={() => setMenu(false)} />
      )}

      <Animated.View style={[styles.bgCircle, bgStyle]} pointerEvents="none" />

      {OPTIONS.map(option => {
        const rad = (option.angleDeg * Math.PI) / 180;
        return (
          <FabOption
            key={option.key}
            progress={progress}
            open={open}
            tx={RADIUS * Math.cos(rad)}
            ty={-RADIUS * Math.sin(rad)}
            Icon={option.Icon}
            label={option.label}
            onPress={handlerFor(option.key)}
          />
        );
      })}

      <AnimatedTouchable
        style={[styles.fab, fabBgStyle]}
        activeOpacity={0.85}
        onPress={() => setMenu(!open)}
      >
        <Animated.Text style={[styles.fabIcon, plusStyle]}>+</Animated.Text>
      </AnimatedTouchable>
    </>
  );
};

export default FabMenu;
