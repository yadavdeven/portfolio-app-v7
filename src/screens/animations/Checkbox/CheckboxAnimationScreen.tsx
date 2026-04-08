import React, { useEffect } from 'react';
import { DeviceEventEmitter, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBar from '../../../components/common/HeaderBar';
import Colors from '../../../constants/Colors';
import styles from './styles';
import TextArea from '../../../components/TextArea';

const CheckboxAnimationScreen = () => {
  const isBlocked = React.useRef(false);

  const [submmittedText, setSubmittedText] = React.useState('');

  const MENTION_REGEX = /@\w+\s\w+/g; // 👈 matches @Word Word pattern

  const getMentionRanges = text => {
    const ranges = [];
    const regex = /@\w+\s\w+\s?/g; // 👈 \s? captures optional trailing space
    let match;

    while ((match = regex.exec(text)) !== null) {
      ranges.push({
        mention: match[0],
        start: match.index,
        end: match.index + match[0].length, // 👈 end includes trailing space
      });
    }

    return ranges;
  };

  const handleChange = (text, cursor, isBackspace, previousText) => {
    if (isBackspace) {
      const ranges = getMentionRanges(previousText); // 👈 ranges from prevText
      console.log('ranges:', ranges);

      const mentionAtCursor = ranges.find(
        range => cursor >= range.start && cursor <= range.end,
      );

      if (mentionAtCursor) {
        isBlocked.current = true; // 👈 block further input until event
        // 👈 slice by start and end index instead of replace
        const before = previousText.slice(0, mentionAtCursor.start);
        const after = previousText.slice(mentionAtCursor.end);
        const cleanedText = before + after; // 👈 join around the mention
        console.log('inside match found: ', previousText, cleanedText);
        setSubmittedText(cleanedText);
        setTimeout(() => {
          DeviceEventEmitter.emit('facts_changed', { value: cleanedText });
        }, 0); // 👈 emit after state update
        return;
      }

      setSubmittedText(text);
    } else {
      setSubmittedText(text);
    }
  };

  console.log('submittedText: ', submmittedText);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg_600} barStyle="dark-content" />
      <HeaderBar title="Checkbox Animation" bgColor={Colors.bg_600} />
      <View style={styles.contentContainer}>
        {/* <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Favourite Bikes</Text>
        </View> */}
        <TextArea handleChange={handleChange} isBlocked={isBlocked} />
      </View>
    </SafeAreaView>
  );
};

export default CheckboxAnimationScreen;
