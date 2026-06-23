import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import { moderateScale } from 'react-native-size-matters';
import Svg, { Path } from 'react-native-svg';
import { FONTS } from '../../utils/typography';
import { Theme } from '../../theme/themes';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import ArrowDownIcon from './ArrowDownIcon';
import SearchBar from '../common/SearchBar';
import type { DropdownItem } from './SearchModalDropdown';

const ITEM_HEIGHT = moderateScale(48);
const SEPARATOR_HEIGHT = 1;

type MultiSelectDropdownProps = {
  label: string;
  values?: string[];
  placeholder?: string;
  containerStyle?: ViewStyle;
  data?: DropdownItem[];
  isVisible?: boolean;
  onPress?: () => void;
  onClose?: () => void;
  onApply?: (items: DropdownItem[]) => void;
  modalTitle?: string;
  searchPlaceholder?: string;
};

const CheckMark = ({ color }: { color: string }) => (
  <Svg
    width={moderateScale(14)}
    height={moderateScale(14)}
    viewBox="0 0 24 24"
    fill="none"
  >
    <Path
      d="M5 12l5 5 9-11"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const getItemLayout = (
  _: ArrayLike<DropdownItem> | null | undefined,
  index: number,
) => ({
  length: ITEM_HEIGHT,
  offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
  index,
});

const MultiSelectDropdown = ({
  label,
  values,
  placeholder = 'Select',
  containerStyle,
  data = [],
  isVisible = false,
  onPress,
  onClose,
  onApply,
  modalTitle,
  searchPlaceholder = 'Search',
}: MultiSelectDropdownProps) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const ItemSeparator = () => <View style={styles.separator} />;
  const ListEmpty = () => <Text style={styles.empty}>No results found</Text>;
  const [search, setSearch] = useState('');
  const [tempSelected, setTempSelected] = useState<Set<string>>(
    () => new Set(values ?? []),
  );
  const wasVisible = useRef(false);

  useEffect(() => {
    if (isVisible && !wasVisible.current) {
      setTempSelected(new Set(values ?? []));
    }
    wasVisible.current = isVisible;
  }, [isVisible, values]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return data;
    }
    return data.filter(item => item.label.toLowerCase().includes(q));
  }, [data, search]);

  const displayValue = useMemo(() => {
    if (!values || values.length === 0) {
      return '';
    }
    const labels = data
      .filter(item => values.includes(item.value))
      .map(item => item.label);
    if (labels.length <= 2) {
      return labels.join(', ');
    }
    return `${labels[0]}, ${labels[1]} +${labels.length - 2} more`;
  }, [data, values]);

  const hasValue = displayValue.length > 0;

  const handleClose = () => {
    setSearch('');
    onClose?.();
  };

  const toggleItem = (item: DropdownItem) => {
    setTempSelected(prev => {
      const next = new Set(prev);
      if (next.has(item.value)) {
        next.delete(item.value);
      } else {
        next.add(item.value);
      }
      return next;
    });
  };

  const handleClear = () => {
    setTempSelected(new Set());
  };

  const handleApply = () => {
    const selectedItems = data.filter(item => tempSelected.has(item.value));
    onApply?.(selectedItems);
    handleClose();
  };

  const renderItem = ({ item }: { item: DropdownItem }) => {
    const selected = tempSelected.has(item.value);
    return (
      <TouchableOpacity
        style={styles.item}
        activeOpacity={0.6}
        onPress={() => toggleItem(item)}
      >
        <Text
          style={[styles.itemText, selected && styles.itemTextSelected]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <CheckMark color={theme.colors.onSurfaceVariant} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>
        {label}
        {values && values.length > 0 ? (
          <Text style={styles.labelCount}> ({values.length})</Text>
        ) : null}
      </Text>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.field}
        onPress={onPress}
      >
        <Text
          style={[styles.value, !hasValue && styles.placeholder]}
          numberOfLines={1}
        >
          {hasValue ? displayValue : placeholder}
        </Text>
        <ArrowDownIcon color={theme.colors.primary} />
      </TouchableOpacity>

      <Modal
        isVisible={isVisible}
        onBackdropPress={handleClose}
        onBackButtonPress={handleClose}
        swipeDirection="down"
        onSwipeComplete={handleClose}
        propagateSwipe
        useNativeDriver
        useNativeDriverForBackdrop
        backdropOpacity={0.4}
        style={styles.modal}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={[styles.sheet, { paddingTop: moderateScale(6) }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.modalTitle}>{modalTitle ?? label}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={10}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder={searchPlaceholder}
            containerStyle={styles.searchBar}
          />
          <FlatList
            data={filtered}
            keyExtractor={item => item.value}
            keyboardShouldPersistTaps="handled"
            ItemSeparatorComponent={ItemSeparator}
            ListEmptyComponent={ListEmpty}
            getItemLayout={getItemLayout}
            renderItem={renderItem}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.clearBtn}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.8}
            >
              <Text style={styles.applyText}>
                Apply{tempSelected.size > 0 ? ` (${tempSelected.size})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MultiSelectDropdown;

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
    labelCount: {
      color: theme.colors.textSecondary,
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
      justifyContent: 'flex-end',
      margin: 0,
    },
    sheet: {
      backgroundColor: theme.colors.sheetBackground,
      borderTopLeftRadius: moderateScale(20),
      borderTopRightRadius: moderateScale(20),
      paddingHorizontal: moderateScale(16),
      paddingBottom: moderateScale(16),
      height: '92%',
    },
    handle: {
      alignSelf: 'center',
      width: moderateScale(40),
      height: moderateScale(4),
      borderRadius: moderateScale(2),
      backgroundColor: theme.colors.border,
      marginTop: moderateScale(12),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: moderateScale(16),
      paddingHorizontal: moderateScale(4),
    },
    modalTitle: {
      fontSize: moderateScale(16, 0.4),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.heading,
    },
    close: {
      fontSize: moderateScale(13, 0.4),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.primary,
    },
    searchBar: {
      marginTop: moderateScale(16),
      marginBottom: moderateScale(16),
    },
    list: {
      flex: 1,
    },
    listContent: {
      paddingBottom: moderateScale(12),
    },
    item: {
      height: ITEM_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: moderateScale(14),
    },
    itemText: {
      flex: 1,
      fontSize: moderateScale(14, 0.4),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.text,
      marginRight: moderateScale(12),
    },
    itemTextSelected: {
      color: theme.colors.primary,
    },
    checkbox: {
      width: moderateScale(20),
      height: moderateScale(20),
      borderRadius: moderateScale(4),
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    checkboxSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    separator: {
      height: SEPARATOR_HEIGHT,
      backgroundColor: theme.colors.border,
    },
    empty: {
      textAlign: 'center',
      paddingVertical: moderateScale(24),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.textSecondary,
      fontSize: moderateScale(13, 0.4),
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: moderateScale(12),
      paddingBottom: moderateScale(12),
    },
    clearBtn: {
      height: moderateScale(38),
      paddingHorizontal: moderateScale(22),
      borderRadius: moderateScale(7),
      borderWidth: 1,
      borderColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    clearText: {
      fontSize: moderateScale(13.5, 0.4),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.primary,
    },
    applyBtn: {
      height: moderateScale(38),
      paddingHorizontal: moderateScale(26),
      borderRadius: moderateScale(7),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    applyText: {
      fontSize: moderateScale(13.5, 0.4),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.onSurfaceVariant,
    },
  });
