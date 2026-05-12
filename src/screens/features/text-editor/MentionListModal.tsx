import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../constants/Colors';
import { FONTS } from '../../../utils/typography';

type User = {
  id: number;
  firstName: string;
  lastName: string;
};

type Props = {
  users: User[];
  onSelect: (user: User) => void;
  visible: boolean;
  top: number;
  query: string;
  loading: boolean;
};

const MentionList: React.FC<Props> = ({
  users,
  onSelect,
  visible,
  top,
  query,
  loading,
}) => {
  if (!visible) return null;

  const showLoader = loading && query.length > 0;
  const isEmpty =
    !showLoader && (query.length === 0 || users.length === 0);

  return (
    <View style={[styles.container, { top }]}>
      {showLoader ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : isEmpty ? (
        <Text style={styles.emptyText}>
          {query.length === 0
            ? 'Start typing to mention users'
            : 'No users found'}
        </Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => String(item.id)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => onSelect(item)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.firstName[0]}
                  {item.lastName[0]}
                </Text>
              </View>
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default MentionList;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: moderateScale(8),
    maxHeight: moderateScale(200),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 10,
    overflow: 'hidden',
  },
  emptyText: {
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(14),
    fontSize: moderateScale(13, 0.4),
    fontFamily: FONTS.lato_regular,
    color: Colors.grey_300,
    textAlign: 'center',
  },
  loaderWrap: {
    paddingVertical: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.grey_300,
  },
  avatar: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(10),
  },
  avatarText: {
    color: Colors.white,
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_bold,
  },
  name: {
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
    color: Colors.grey_100,
  },
});
