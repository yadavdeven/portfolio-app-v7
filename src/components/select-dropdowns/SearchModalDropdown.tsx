import React, { useMemo, useRef, useState } from 'react';
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
import { FONTS } from '../../utils/typography';
import { Theme } from '../../theme/themes';
import { useTheme, useThemedStyles } from '../../theme/ThemeContext';
import ArrowDownIcon from './ArrowDownIcon';
import SearchBar from '../common/SearchBar';

export type DropdownItem = {
  label: string;
  value: string;
};

const ITEM_HEIGHT = moderateScale(48);
const SEPARATOR_HEIGHT = 1;

const getItemLayout = (
  _: ArrayLike<DropdownItem> | null | undefined,
  index: number,
) => ({
  length: ITEM_HEIGHT,
  offset: (ITEM_HEIGHT + SEPARATOR_HEIGHT) * index,
  index,
});

type SearchModalDropdownProps = {
  label: string;
  value?: string;
  placeholder?: string;
  onPress?: () => void;
  containerStyle?: ViewStyle;
  data?: DropdownItem[];
  isVisible?: boolean;
  onClose?: () => void;
  onSelect?: (item: DropdownItem) => void;
  modalTitle?: string;
  searchPlaceholder?: string;
};

const SearchModalDropdown = ({
  label,
  value,
  placeholder = 'Select',
  onPress,
  containerStyle,
  data = [],
  isVisible = false,
  onClose,
  onSelect,
  modalTitle,
  searchPlaceholder = 'Search',
}: SearchModalDropdownProps) => {
  const { theme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const ItemSeparator = () => <View style={styles.separator} />;
  const ListEmpty = () => <Text style={styles.empty}>No results found</Text>;
  const [search, setSearch] = useState('');
  const listRef = useRef<FlatList<DropdownItem>>(null);
  const hasValue = !!value;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return data;
    }
    return data.filter(item => item.label.toLowerCase().includes(q));
  }, [data, search]);

  const handleClose = () => {
    setSearch('');
    onClose?.();
  };

  const handleSelect = (item: DropdownItem) => {
    onSelect?.(item);
    handleClose();
  };

  const scrollToSelected = () => {
    if (!value) {
      return;
    }
    const idx = data.findIndex(item => item.label === value);
    if (idx < 0) {
      return;
    }
    listRef.current?.scrollToIndex({
      index: idx,
      animated: true,
      viewPosition: 0.5,
    });
  };

  const handleScrollToIndexFailed = (info: {
    index: number;
    averageItemLength: number;
  }) => {
    setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
        viewPosition: 0.5,
      });
    }, 100);
  };

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.7}
        style={styles.field}
        onPress={onPress}
      >
        <Text
          style={[styles.value, !hasValue && styles.placeholder]}
          numberOfLines={1}
        >
          {hasValue ? value : placeholder}
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
        onModalShow={scrollToSelected}
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
            ref={listRef}
            data={filtered}
            keyExtractor={item => item.value}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={ItemSeparator}
            ListEmptyComponent={ListEmpty}
            getItemLayout={getItemLayout}
            onScrollToIndexFailed={handleScrollToIndexFailed}
            renderItem={({ item }) => {
              const selected = item.label === value;
              return (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.itemText,
                      selected && styles.itemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
};

export default SearchModalDropdown;

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
    listContent: {
      paddingBottom: moderateScale(24),
    },
    item: {
      height: ITEM_HEIGHT,
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: moderateScale(14),
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
      height: 1,
      backgroundColor: theme.colors.border,
    },
    empty: {
      textAlign: 'center',
      paddingVertical: moderateScale(24),
      fontFamily: FONTS.lato_bold,
      color: theme.colors.textSecondary,
      fontSize: moderateScale(13, 0.4),
    },
  });
