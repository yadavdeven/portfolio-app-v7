import React, { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import {
  enablePinning,
  disablePinning,
  isPinningPreferenceOn,
  setPinningPreference,
} from '../../../utils/ssl-pinning';
import { echoRequest, resetEcho } from '../../../store/slices/sslPinningSlice';
import TextInputStandard from '../../../components/common/TextInputStandard';
import ButtonStandard from '../../../components/common/ButtonStandard';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { DEVICE_WIDTH } from '../../../constants/Dimensions';
import Wrapper from '../../../components/common/Wrapper';
import styles from './styles';

// What each input maps to in the echoed response. `section` decides whether the
// value lands in the request body or the query string.
type ParamMeta = {
  key: string;
  label: string;
  section: 'body' | 'query';
};

const PARAMS: ParamMeta[] = [
  { key: 'stringParam', label: 'String Param', section: 'body' },
  { key: 'numberParam', label: 'Number Param', section: 'body' },
  { key: 'queryParam', label: 'Query Param', section: 'query' },
];

const MISSING = 'You did not pass this param';

const SSLPinningScreen = () => {
  const dispatch = useAppDispatch();
  const { status, response, error } = useAppSelector(s => s.sslPinning);
  const isLoading = status === 'loading';

  const [stringParam, setStringParam] = useState('');
  const [numberParam, setNumberParam] = useState('');
  const [queryParam, setQueryParam] = useState('');

  // Initialise the switch from the persisted preference (set at startup too).
  const [pinningOn, setPinningOn] = useState(isPinningPreferenceOn);
  const [togglingPin, setTogglingPin] = useState(false);

  const handleTogglePinning = async (next: boolean) => {
    setTogglingPin(true);
    try {
      setPinningPreference(next); // persist — applied deterministically on relaunch
      if (next) {
        await enablePinning();
      } else {
        await disablePinning();
      }
      setPinningOn(next);
    } finally {
      setTogglingPin(false);
    }
  };

  // Clear any previous result when leaving the screen.
  useEffect(() => {
    return () => {
      dispatch(resetEcho());
    };
  }, [dispatch]);

  const handleSubmit = () => {
    const body: Record<string, string | number> = {};
    if (stringParam.trim()) body.stringParam = stringParam.trim();
    if (numberParam.trim()) body.numberParam = Number(numberParam);

    const query: Record<string, string> = {};
    if (queryParam.trim()) query.queryParam = queryParam.trim();

    dispatch(echoRequest({ body, query }));
  };

  const renderRow = (param: ParamMeta) => {
    const source =
      param.section === 'body'
        ? response?.responseData.body
        : response?.responseData.query;
    const passed = source && param.key in source;

    return (
      <View key={param.key} style={styles.row}>
        <Text style={styles.rowKey}>{param.label}</Text>
        <Text style={[styles.rowValue, !passed && styles.rowValueMissing]}>
          {passed ? String(source[param.key]) : MISSING}
        </Text>
      </View>
    );
  };

  const renderSection = (title: string, section: 'body' | 'query') => {
    const params = PARAMS.filter(p => p.section === section);
    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        {params.map(renderRow)}
      </>
    );
  };

  return (
    <Wrapper headerTitle="SSL Pinning" containerStyle={styles.container}>
      <View style={styles.toggleCard}>
        <View style={styles.toggleTextWrap}>
          <Text style={styles.toggleTitle}>SSL Pinning</Text>
          <Text
            style={[
              styles.toggleSubtitle,
              pinningOn ? styles.toggleOn : styles.toggleOff,
            ]}
          >
            {pinningOn
              ? 'ON — proxy interception is blocked'
              : 'OFF — traffic is interceptable'}
          </Text>
        </View>
        <Switch
          value={pinningOn}
          onValueChange={handleTogglePinning}
          disabled={togglingPin}
        />
      </View>
      <Text style={styles.toggleHint}>
        Relaunch the app after toggling for it to fully take effect.
      </Text>

      <TextInputStandard
        label="String Param"
        placeholder="Enter a string"
        value={stringParam}
        onChangeText={setStringParam}
      />

      <TextInputStandard
        containerStyle={styles.inputSpacing}
        label="Number Param"
        placeholder="Enter a number"
        keyboardType="number-pad"
        value={numberParam}
        onChangeText={text => setNumberParam(text.replace(/[^0-9]/g, ''))}
      />

      <TextInputStandard
        containerStyle={styles.inputSpacing}
        label="Query Param"
        placeholder="Enter a query value"
        value={queryParam}
        onChangeText={setQueryParam}
      />

      <ButtonStandard
        btnLabel="Send Request"
        btnWidth={DEVICE_WIDTH * 0.9}
        onPress={handleSubmit}
        isLoading={isLoading}
        marginTop={moderateScale(40)}
      />

      {status === 'failed' && (
        <View style={[styles.card, styles.cardError]}>
          <View style={styles.cardHeader}>
            <Text style={styles.message}>Request failed</Text>
            <View style={[styles.badge, styles.badgeFailed]}>
              <Text style={styles.badgeText}>FAILED</Text>
            </View>
          </View>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {status === 'succeeded' && response && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.message}>{response.message}</Text>
            <View
              style={[
                styles.badge,
                response.isSuccess ? styles.badgeSuccess : styles.badgeFailed,
              ]}
            >
              <Text style={styles.badgeText}>
                {response.isSuccess ? 'SUCCESS' : 'FAILED'}
              </Text>
            </View>
          </View>

          {renderSection('Body', 'body')}
          {renderSection('Query', 'query')}

          <Text style={styles.timestamp}>
            {`Timestamp: ${response.responseData.timestamp}`}
          </Text>
        </View>
      )}
    </Wrapper>
  );
};

export default SSLPinningScreen;
