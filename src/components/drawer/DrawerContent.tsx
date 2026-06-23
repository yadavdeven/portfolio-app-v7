import React, { useRef, useState } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import CustomAlert from '../common/CustomAlert';
import EmailSvg from '../../assets/svgs/mail_24dp_300.svg';
import WorkSvg from '../../assets/svgs/work_24dp_300.svg';
import LocationSvg from '../../assets/svgs/location_on_24dp_300.svg';
import LogoutSvg from '../../assets/svgs/logout_24dp_300.svg';
import GithubSvg from '../../assets/images/global/github.svg';
import Colors from '../../constants/Colors';
import { FONTS } from '../../utils/typography';
import { useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { resetNavigation } from '../../navigation/navigation-utils';
import { ROUTES } from '../../navigation/routes';

const ALMOST_WHITE = Colors.offWhite_100;
const ICON_COLOR = Colors.grey_300;
const INFO_ICON_SIZE = moderateScale(17);
const CONTACT_ICON_SIZE = moderateScale(14);
const APP_VERSION = '1.0.0';
// The drawer's slide-out is Reanimated-driven, so it isn't tracked by
// InteractionManager. Wait out the close animation before tearing down the
// session so the auth switch isn't visible behind a still-closing drawer.
const DRAWER_CLOSE_DELAY = 400;

const INFO = [
  { Icon: WorkSvg, label: '4+ years of experience', size: INFO_ICON_SIZE },
  { Icon: LocationSvg, label: 'Mumbai', size: INFO_ICON_SIZE * 1.1 },
];

const CONTACTS = [
  {
    Icon: EmailSvg,
    label: 'yadavdeven@outlook.com',
    url: 'mailto:yadavdeven@outlook.com',
    size: CONTACT_ICON_SIZE * 1.2,
  },
  {
    Icon: GithubSvg,
    label: 'github.com/yadavdeven',
    url: 'https://github.com/yadavdeven',
    size: CONTACT_ICON_SIZE,
  },
];

export default function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  // Set when the user confirms, so the alert's onModalHide knows to proceed
  // with logout rather than treating it as a plain cancel/dismiss.
  const logoutConfirmed = useRef(false);

  const handleLogout = () => setShowLogoutAlert(true);

  // Confirming only starts the alert's hide animation. The actual teardown is
  // chained off onModalHide below so the steps run strictly in order.
  const confirmLogout = () => {
    logoutConfirmed.current = true;
    setShowLogoutAlert(false);
  };

  // Runs once the alert has fully closed: slide the drawer shut, wait out its
  // Reanimated close animation, then clear tokens + guid and reset to auth — so
  // each transition completes before the next begins.
  const handleAlertHidden = () => {
    if (!logoutConfirmed.current) return;
    logoutConfirmed.current = false;
    navigation.closeDrawer();
    setTimeout(async () => {
      await dispatch(logout());
      resetNavigation([{ name: ROUTES.AUTH_NAVIGATOR }]);
    }, DRAWER_CLOSE_DELAY);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.primary_900, ALMOST_WHITE]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + moderateScale(24) }]}
      >
        <Image
          source={require('../../assets/images/global/profile_pic.jpeg')}
          style={styles.avatar}
        />

        <Text style={styles.name}>Devendra Yadav</Text>
        <Text style={styles.role}>React Native Developer</Text>

        <View style={styles.infoRow}>
          {INFO.map(({ Icon, label, size }) => (
            <View key={label} style={styles.infoItem}>
              <Icon width={size} height={size} fill={ICON_COLOR} />
              <Text style={styles.infoLabel}>{label}</Text>
            </View>
          ))}

          {CONTACTS.map(({ Icon, label, url, size }) => (
            <TouchableOpacity
              key={label}
              style={styles.infoItem}
              onPress={() => Linking.openURL(url)}
              activeOpacity={0.6}
            >
              <Icon width={size} height={size} fill={ICON_COLOR} />
              <Text style={styles.infoLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.divider} />

      {/* Menu items will go here later. */}

      <View
        style={[
          styles.bottom,
          { paddingBottom: insets.bottom + moderateScale(16) },
        ]}
      >
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <LogoutSvg
            width={moderateScale(20)}
            height={moderateScale(20)}
            fill={Colors.primary_100}
          />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Version {APP_VERSION}</Text>
      </View>

      <CustomAlert
        isVisible={showLogoutAlert}
        title="Log out"
        message="Are you sure you want to log out?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutAlert(false)}
        onModalHide={handleAlertHidden}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ALMOST_WHITE,
  },
  header: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: moderateScale(20),
    alignItems: 'flex-start',
  },
  avatar: {
    width: moderateScale(72),
    height: moderateScale(72),
    borderRadius: moderateScale(36),
    marginBottom: moderateScale(14),
  },
  name: {
    color: Colors.grey_primary,
    fontSize: moderateScale(18),
    fontFamily: FONTS.lato_bold,
    letterSpacing: 0.3,
  },
  role: {
    marginTop: moderateScale(3),
    color: Colors.primary,
    fontSize: moderateScale(13),
    fontFamily: FONTS.lato_bold,
  },
  infoRow: {
    marginTop: moderateScale(14),
    rowGap: moderateScale(9),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: moderateScale(8),
  },
  infoLabel: {
    color: Colors.grey_300,
    fontSize: moderateScale(13),
    fontFamily: FONTS.lato_bold,
  },
  divider: {
    height: moderateScale(0.8),
    marginHorizontal: moderateScale(20),
    backgroundColor: Colors.primary_100,
  },
  bottom: {
    marginTop: 'auto',
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(16),
    rowGap: moderateScale(12),
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: moderateScale(10),
  },
  logoutText: {
    color: Colors.primary_100,
    fontSize: moderateScale(15),
    fontFamily: FONTS.lato_bold,
  },
  version: {
    color: Colors.grey_400,
    fontSize: moderateScale(12),
    fontFamily: FONTS.lato_regular,
    marginLeft: moderateScale(2),
  },
});
