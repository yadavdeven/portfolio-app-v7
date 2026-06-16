import React from 'react';
import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import ButtonStandard from '../../../components/common/ButtonStandard';
import InfoBanner from '../../../components/common/InfoBanner';
import Wrapper from '../../../components/common/Wrapper';
import { DEVICE_WIDTH } from '../../../constants/Dimensions';
// The TurboModule spec's default export — typed, JSI-backed device info.
import DeviceInfo, { DeviceInfo as DeviceInfoType } from '../../../native/NativeDeviceInfoModule';
import { styles } from './DeviceInfoScreen.styles';

// Display order + labels for the fields returned by the native module.
const FIELDS: { key: keyof DeviceInfoType; label: string }[] = [
  { key: 'model', label: 'Model' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'brand', label: 'Brand' },
  { key: 'osVersion', label: 'OS Version' },
  { key: 'apiLevel', label: 'API Level' },
  { key: 'batteryLevel', label: 'Battery' },
];

const DeviceInfoScreen = () => {
  const [info, setInfo] = React.useState<DeviceInfoType | null>(null);

  const handleGetInfo = () => {
    // Synchronous JSI call — returns the object directly, no Promise.
    setInfo(DeviceInfo.getDeviceInfo());
  };

  return (
    <Wrapper headerTitle="Device Info" containerStyle={styles.container}>
      <InfoBanner
        title="Device Info"
        description="tap the button to read native device info (model, OS, battery and more) via a Native Module."
      />

      <ButtonStandard
        btnLabel="Get Device Info"
        btnWidth={DEVICE_WIDTH * 0.9}
        onPress={handleGetInfo}
        marginTop={moderateScale(16)}
      />

      {info && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Device Info</Text>
          {FIELDS.map(({ key, label }) => (
            <View key={key} style={styles.row}>
              <Text style={styles.rowKey}>{label}</Text>
              <Text style={styles.rowValue}>
                {key === 'batteryLevel' ? `${info[key]}%` : String(info[key])}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Wrapper>
  );
};

export default DeviceInfoScreen;
