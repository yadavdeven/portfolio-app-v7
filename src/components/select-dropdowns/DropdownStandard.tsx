import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../constants/Colors';
import { FONTS } from '../../utils/typography';
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

const ItemSeparator = () => <View style={styles.separator} />;

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
  const anchorRef = useRef<View>(null);
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

      let placement: Placement;
      let top: number | undefined;

      if (spaceBelow >= desiredHeight) {
        placement = 'below';
        top = y + height + GAP;
      } else if (spaceAbove >= desiredHeight) {
        placement = 'above';
        top = y - desiredHeight - GAP;
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
          <ArrowDownIcon />
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

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
    marginBottom: moderateScale(8),
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(14),
    height: moderateScale(48),
    shadowColor: Colors.grey_500,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  value: {
    flex: 1,
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.primary,
    marginRight: moderateScale(8),
  },
  placeholder: {
    color: Colors.grey_600,
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
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    shadowColor: Colors.grey_500,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: moderateScale(14),
    backgroundColor: Colors.white,
  },
  itemText: {
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_100,
  },
  itemTextSelected: {
    color: Colors.primary,
  },
  separator: {
    height: SEPARATOR_HEIGHT,
    backgroundColor: Colors.bg_500,
  },
});
