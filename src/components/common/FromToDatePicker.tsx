import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import CalenderSvg from '../../assets/svgs/edit_calendar_24dp_300.svg';
import SearchSvg from '../../assets/svgs/search_24dp_300.svg';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../constants/Colors';
import { FONTS } from '../../utils/typography';
import { isAndroid, isIOS } from '../../utils/helperFunctions';

type Props = {
  fromDate: Date | null;
  toDate: Date | null;
  openFromDate: boolean;
  openToDate: boolean;
  setFromDate: (date: Date | null) => void;
  setToDate: (date: Date | null) => void;
  setOpenFromDate: (open: boolean) => void;
  setOpenToDate: (open: boolean) => void;
  onSearchPress?: () => void;
};

const FromToDatePicker: React.FC<Props> = ({
  fromDate,
  toDate,
  openFromDate,
  openToDate,
  setFromDate,
  setToDate,
  setOpenFromDate,
  setOpenToDate,
  onSearchPress,
}) => {
  // temp states for iOS so Cancel can discard changes
  const [tempFromDate, setTempFromDate] = useState<Date | null>(
    fromDate || null,
  );
  const [tempToDate, setTempToDate] = useState<Date | null>(toDate || null);

  // initialize temps when iOS modal opens
  useEffect(() => {
    if (isIOS && openFromDate) {
      setTempFromDate(fromDate || new Date());
    }
  }, [openFromDate, fromDate]);

  useEffect(() => {
    if (isIOS && openToDate) {
      setTempToDate(toDate || new Date());
    }
  }, [openToDate, toDate]);

  // Android handlers (immediate apply)
  const handleFromChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (isAndroid) {
      setOpenFromDate(false);
    }

    if (event.type === 'set' && selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const handleToChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (isAndroid) {
      setOpenToDate(false);
    }

    if (event.type === 'set' && selectedDate) {
      setToDate(selectedDate);
    }
  };

  // iOS handlers (update temp only)
  const handleTempFromChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (selectedDate) {
      setTempFromDate(selectedDate);
    }
  };

  const handleTempToChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (selectedDate) {
      setTempToDate(selectedDate);
    }
  };

  const applyFromAndClose = () => {
    setFromDate(tempFromDate);
    setOpenFromDate(false);
  };

  const applyToAndClose = () => {
    setToDate(tempToDate);
    setOpenToDate(false);
  };

  const cancelFrom = () => {
    // discard temp and close
    setTempFromDate(fromDate || null);
    setOpenFromDate(false);
  };

  const cancelTo = () => {
    setTempToDate(toDate || null);
    setOpenToDate(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      {/* FROM DATE */}
      <TouchableOpacity
        style={styles.dateContainer}
        onPress={() => setOpenFromDate(true)}
      >
        <CalenderSvg
          fill={Colors.white}
          width={moderateScale(22)}
          height={moderateScale(22)}
        />
        <View>
          <Text style={styles.dateLabel}>From Date</Text>
          {fromDate && (
            <Text style={styles.dateValue}>{formatDate(fromDate)}</Text>
          )}
        </View>

        {/* Android only – inline picker */}
        {openFromDate && isAndroid && (
          <DateTimePicker
            value={fromDate || new Date()}
            mode="date"
            display="default"
            onChange={handleFromChange}
            maximumDate={toDate || undefined}
          />
        )}
      </TouchableOpacity>

      {/* TO DATE */}
      <TouchableOpacity
        style={styles.dateContainer}
        onPress={() => setOpenToDate(true)}
      >
        <CalenderSvg
          fill={Colors.white}
          width={moderateScale(22)}
          height={moderateScale(22)}
        />
        <View>
          <Text style={styles.dateLabel}>To Date</Text>
          {toDate && <Text style={styles.dateValue}>{formatDate(toDate)}</Text>}
        </View>

        {/* Android only – inline picker */}
        {openToDate && isAndroid && (
          <DateTimePicker
            value={toDate || new Date()}
            mode="date"
            display="default"
            onChange={handleToChange}
            minimumDate={fromDate || undefined}
          />
        )}
      </TouchableOpacity>

      {/* SEARCH BUTTON */}
      <TouchableOpacity
        style={styles.searchBtnContainer}
        onPress={onSearchPress}
      >
        <Text style={styles.searchBtnText}>Search</Text>
        <SearchSvg
          fill={Colors.white}
          width={moderateScale(18)}
          height={moderateScale(18)}
        />
      </TouchableOpacity>

      {/* -------- iOS bottom sheet: FROM DATE -------- */}
      {isIOS && openFromDate && (
        <Modal
          visible={openFromDate}
          transparent
          animationType="fade"
          onRequestClose={cancelFrom}
        >
          <View style={styles.iosOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={cancelFrom} />

            <View style={styles.iosSheet}>
              {/* Header: Cancel (left) and Done (right) */}
              <View style={styles.iosHeaderRow}>
                <Pressable onPress={cancelFrom}>
                  <Text style={styles.iosCancelText}>Cancel</Text>
                </Pressable>

                <Pressable onPress={applyFromAndClose}>
                  <Text style={styles.iosDoneText}>Done</Text>
                </Pressable>
              </View>

              {/* Picker centered */}
              <View style={styles.iosPickerWrapper}>
                <DateTimePicker
                  value={tempFromDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleTempFromChange}
                  maximumDate={toDate || undefined}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* -------- iOS bottom sheet: TO DATE -------- */}
      {isIOS && openToDate && (
        <Modal
          visible={openToDate}
          transparent
          animationType="fade"
          onRequestClose={cancelTo}
        >
          <View style={styles.iosOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={cancelTo} />

            <View style={styles.iosSheet}>
              {/* Header: Cancel (left) and Done (right) */}
              <View style={styles.iosHeaderRow}>
                <Pressable onPress={cancelTo}>
                  <Text style={styles.iosCancelText}>Cancel</Text>
                </Pressable>

                <Pressable onPress={applyToAndClose}>
                  <Text style={styles.iosDoneText}>Done</Text>
                </Pressable>
              </View>

              {/* Picker centered */}
              <View style={styles.iosPickerWrapper}>
                <DateTimePicker
                  value={tempToDate || new Date()}
                  mode="date"
                  display="spinner"
                  onChange={handleTempToChange}
                  maximumDate={new Date() || undefined}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default FromToDatePicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 600,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: moderateScale(40),
  },
  dateContainer: {
    width: '32%',
    backgroundColor: Colors.primary_100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    columnGap: moderateScale(5),
    borderRadius: 5,
    paddingVertical: moderateScale(5, 0.4),
    height: moderateScale(40),
  },
  dateLabel: {
    color: Colors.white,
    fontSize: moderateScale(11, 0.4),
    fontFamily: FONTS.lato_bold,
  },
  dateValue: {
    color: Colors.white,
    fontSize: moderateScale(12, 0.4),
    fontFamily: FONTS.lato_bold,
  },
  searchBtnContainer: {
    width: '28%',
    backgroundColor: Colors.primary_100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    columnGap: moderateScale(5),
    height: moderateScale(40),
  },
  searchBtnText: {
    color: Colors.white,
    fontSize: moderateScale(14, 0.4),
    fontFamily: FONTS.lato_bold,
  },
  iosOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  iosSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },

  // Header with Cancel (left) and Done (right)
  iosHeaderRow: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iosDoneText: {
    fontSize: moderateScale(16, 0.4),
    color: Colors.primary,
    fontFamily: FONTS.lato_bold,
  },

  iosCancelText: {
    fontSize: moderateScale(16, 0.3),
    color: Colors.grey_100 || '#999',
    fontFamily: FONTS.lato_bold,
  },

  // Center the picker nicely
  iosPickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
});
