import React, { useRef } from 'react';
import {
  StatusBar,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HeaderBar from '../../../components/common/HeaderBar';
import { EnrichedTextInput } from 'react-native-enriched';
import Colors from '../../../constants/Colors';
import styles from './styles';

const TextEditorScreen = () => {
  const editorRef = useRef(null);

  const formatActions = [
    { label: 'B', action: 'bold' },
    { label: 'I', action: 'italic' },
    { label: 'U', action: 'underline' },
    { label: 'S', action: 'strikethrough' },
    { label: '•', action: 'unorderedList' },
    { label: '1.', action: 'orderedList' },
    { label: 'H1', action: 'h1' },
    { label: 'H2', action: 'h2' },
    { label: 'Link', action: 'link' },
    { label: '↶', action: 'undo' },
    { label: '↷', action: 'redo' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg_600} barStyle="dark-content" />
      <HeaderBar title="Text Editor" bgColor={Colors.bg_600} />
      <View style={styles.contentContainer}>
        <EnrichedTextInput ref={editorRef} style={styles.editor} />

        <View style={styles.toolbarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.toolbarContent}
          >
            {formatActions.map((item, index) => (
              <TouchableOpacity key={index} style={styles.toolButton}>
                <Text style={styles.toolButtonText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TextEditorScreen;
