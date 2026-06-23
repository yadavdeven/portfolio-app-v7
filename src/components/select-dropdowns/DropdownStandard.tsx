import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { FONTS } from '../../utils/typography';
import { Theme } from '../../theme/themes';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import ArrowDownIcon from './ArrowDownIcon';
import type { DropdownItem } from './SearchModalDropdown';

const ITEM_HEIGHT = moderateScale(44);
const SEPARATOR_HEIGHT = 1;
const MAX_VISIBLE = 8;
const GAP = moderateScale(6);

type Placement = 'below' | 'above' | 'center';

type AnchorPosition = {
  placement: Placement;
  top?: number;
  left: number;
  width: number;
  height: number;
};

type DropdownStandardProps = {
  label: string;
  value?: string;
  placeholder?: string;
  containerStyle?: ViewStyle;
  data?: DropdownItem[];
  onSelect?: (item: DropdownItem) => void;
};

const computeListHeight = (count: number) =>
  count * ITEM_HEIGHT + Math.max(0, count - 1) * SEPARATOR_HEIGHT;

const DropdownStandard = ({
  label,
  value,
  placeholder = 'Select',
  containerStyle,
  data = [],
  onSelect,
}: DropdownStandardProps) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const ItemSeparator = () => <View style={styles.separator} />;
  const anchorRef = useRef<View>(null);
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<AnchorPosition | null>(null);
  const hasValue = !!value;

  const handleOpen = () => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      const winH = Dimensions.get('window').height;
      const visibleCount = Math.min(data.length, MAX_VISIBLE);
      const desiredHeight = computeListHeight(visibleCount);
      const spaceBelow = winH - (y + height) - GAP;
      const spaceAbove = y - GAP;

      // With edge-to-edge enabled the window content draws behind the status
      // bar, so measureInWindow coordinates are offset from the full-screen
      // react-native-modal container by the top inset. Translate into the
      // modal's coordinate space so the dropdown anchors to the field.
      const modalOffset = Platform.OS === 'android' ? insets.top : 0;

      let placement: Placement;
      let top: number | undefined;

      if (spaceBelow >= desiredHeight) {
        placement = 'below';
        top = y + height + GAP + modalOffset;
      } else if (spaceAbove >= desiredHeight) {
        placement = 'above';
        top = y - desiredHeight - GAP + modalOffset;
      } else {
        placement = 'center';
      }

      setPosition({
        placement,
        top,
        left: x,
        width,
        height: desiredHeight,
      });
      setOpen(true);
    });
  };

  const handleClose = () => setOpen(false);

  const handleSelect = (item: DropdownItem) => {
    onSelect?.(item);
    handleClose();
  };

  const renderItem = ({ item }: { item: DropdownItem }) => {
    const selected = item.label === value;
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.6}
        onPress={() => handleSelect(item)}
      >
        <Text
          style={[styles.itemText, selected && styles.itemTextSelected]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const list = (
    <FlatList
      data={data}
      keyExtractor={item => item.value}
      ItemSeparatorComponent={ItemSeparator}
      bounces={false}
      renderItem={renderItem}
    />
  );

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View ref={anchorRef} collapsable={false}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.field}
          onPress={handleOpen}
        >
          <Text
            style={[styles.value, !hasValue && styles.placeholder]}
            numberOfLines={1}
          >
            {hasValue ? value : placeholder}
          </Text>
          <ArrowDownIcon color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <Modal
        isVisible={open}
        onBackdropPress={handleClose}
        onBackButtonPress={handleClose}
        useNativeDriver
        useNativeDriverForBackdrop
        backdropOpacity={0.2}
        animationIn="fadeIn"
        animationOut="fadeOut"
        animationInTiming={180}
        animationOutTiming={150}
        style={styles.modal}
      >
        {position &&
          (position.placement === 'center' ? (
            <View
              style={[
                styles.dropdown,
                { width: position.width, height: position.height },
              ]}
            >
              {list}
            </View>
          ) : (
            <View
              style={[
                styles.dropdown,
                styles.absolute,
                {
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  height: position.height,
                },
              ]}
            >
              {list}
            </View>
          ))}
      </Modal>
    </View>
  );
};

export default DropdownStandard;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      width: '100%',
    },
    label: {
      fontSize: moderateScale(14, 0.4),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.heading,
      marginBottom: moderateScale(8),
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: moderateScale(14),
      height: moderateScale(48),
    },
    value: {
      flex: 1,
      fontSize: moderateScale(14, 0.4),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.text,
      marginRight: moderateScale(8),
    },
    placeholder: {
      color: theme.colors.placeholder,
      fontFamily: FONTS.lato_bold,
      fontSize: moderateScale(14, 0.4),
    },
    modal: {
      margin: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    absolute: {
      position: 'absolute',
    },
    dropdown: {
      backgroundColor: theme.colors.surface,
      borderRadius: moderateScale(8),
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 6,
    },
    item: {
      height: ITEM_HEIGHT,
      justifyContent: 'center',
      paddingHorizontal: moderateScale(14),
      backgroundColor: theme.colors.surface,
    },
    itemText: {
      fontSize: moderateScale(14, 0.4),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.text,
    },
    itemTextSelected: {
      color: theme.colors.primary,
    },
    separator: {
      height: SEPARATOR_HEIGHT,
      backgroundColor: theme.colors.border,
    },
  });
