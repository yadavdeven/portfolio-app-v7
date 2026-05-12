import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  TouchableOpacity,
  NativeSyntheticEvent,
  ScrollView,
  View,
  LayoutChangeEvent,
} from 'react-native';
import type {
  EnrichedTextInputInstance,
  OnChangeStateEvent,
} from 'react-native-enriched';
import { EnrichedTextInput } from 'react-native-enriched';
import StrikeThroughSvg from '../../../assets/svgs/format_strikethrough_24dp_300.svg';
import BulletedListSvg from '../../../assets/svgs/format_list_bulleted_24dp_300.svg';
import NumberedListSvg from '../../../assets/svgs/format_list_numbered_24dp_300.svg';
import UnderlinedSvg from '../../../assets/svgs/format_underlined_24dp_300.svg';
import MentionSvg from '../../../assets/svgs/alternate_email_24dp_300.svg';
import CodeBlockSvg from '../../../assets/svgs/code_blocks_24dp_300.svg';
import ItalicSvg from '../../../assets/svgs/format_italic_24dp_300.svg';
import InlineCodeSvg from '../../../assets/svgs/code_xml_24dp_300.svg';
import BoldSvg from '../../../assets/svgs/format_bold_24dp_300.svg';
import H2Svg from '../../../assets/svgs/format_h2_24dp_300.svg';
import H1Svg from '../../../assets/svgs/format_h1_24dp_300.svg';
import LinkSvg from '../../../assets/svgs/link_24dp_300.svg';
import { useToast } from '../../../providers/ToastProvider';
import { MENTION_USERS } from '../../../data/mention-users';
import { moderateScale } from 'react-native-size-matters';
import Wrapper from '../../../components/common/Wrapper';
import Colors from '../../../constants/Colors';
import MentionList from './MentionListModal';
import LinkModal from './LinkModal';
import styles from './styles';

const TextEditorScreen = () => {
  const editorRef = useRef<EnrichedTextInputInstance>(null);
  // ← This holds the live formatting state
  const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>(
    null,
  );

  const [htmlContent, setHtmlContent] = useState('');

  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [mentionLoading, setMentionLoading] = useState(false);
  const [mentionTop, setMentionTop] = useState(0);

  const { showToast } = useToast();

  const [showLinkModal, setShowLinkModal] = useState(false);
  const selectionRef = useRef<{
    start: number;
    end: number;
    text: string;
  } | null>(null);

  const plainTextRef = useRef('');
  const editorLayoutRef = useRef({ width: 0, height: 0 });
  const suppressMentionRef = useRef(false);
  const forceMentionRef = useRef(false);

  const EDITOR_FONT_SIZE = moderateScale(14, 0.4);
  const EDITOR_LINE_HEIGHT = EDITOR_FONT_SIZE * 1.4;
  const EDITOR_PADDING = moderateScale(8);
  const MENTION_MODAL_HEIGHT = moderateScale(200);

  const computeMentionTop = useCallback(() => {
    const { width, height } = editorLayoutRef.current;
    if (!width || !height) return 0;

    const text = plainTextRef.current;
    const cursor = selectionRef.current?.start ?? text.length;

    const charsPerLine = Math.max(
      1,
      Math.floor((width - EDITOR_PADDING * 2) / (EDITOR_FONT_SIZE * 0.55)),
    );

    const before = text.substring(0, cursor);
    const segments = before.split('\n');
    let lineIndex = 0;
    for (let i = 0; i < segments.length - 1; i++) {
      lineIndex += Math.max(1, Math.ceil(segments[i].length / charsPerLine));
    }
    lineIndex += Math.floor(
      segments[segments.length - 1].length / charsPerLine,
    );

    const cursorTopY = EDITOR_PADDING + lineIndex * EDITOR_LINE_HEIGHT;
    const cursorBottomY = cursorTopY + EDITOR_LINE_HEIGHT;

    if (cursorTopY < height / 2) {
      return cursorBottomY + moderateScale(4);
    }
    return Math.max(0, cursorTopY - MENTION_MODAL_HEIGHT - moderateScale(4));
  }, [
    EDITOR_FONT_SIZE,
    EDITOR_LINE_HEIGHT,
    EDITOR_PADDING,
    MENTION_MODAL_HEIGHT,
  ]);

  const openMentionList = useCallback(() => {
    if (forceMentionRef.current) {
      forceMentionRef.current = false;
    } else {
      const cursor = selectionRef.current?.start ?? 0;
      const charBeforeAt = plainTextRef.current.charAt(cursor - 2);
      if (charBeforeAt && /[a-zA-Z]/.test(charBeforeAt)) {
        suppressMentionRef.current = true;
        setShowMentionList(false);
        return;
      }
    }
    suppressMentionRef.current = false;
    setMentionQuery('');
    setDebouncedQuery('');
    setMentionLoading(false);
    setMentionTop(computeMentionTop());
    setShowMentionList(true);
  }, [computeMentionTop]);

  useEffect(() => {
    if (!showMentionList) return;
    if (mentionQuery.length === 0) {
      setDebouncedQuery('');
      setMentionLoading(false);
      return;
    }
    setMentionLoading(true);
    const t = setTimeout(() => {
      setDebouncedQuery(mentionQuery);
      setMentionLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [mentionQuery, showMentionList]);

  const onEditorLayout = (e: LayoutChangeEvent) => {
    editorLayoutRef.current = {
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height,
    };
  };

  const formatActions = [
    {
      action: 'bold',
      icon: BoldSvg,
      onPress: () => editorRef.current?.toggleBold(),
    },
    {
      action: 'italic',
      icon: ItalicSvg,
      onPress: () => editorRef.current?.toggleItalic(),
    },
    {
      action: 'underline',
      icon: UnderlinedSvg,
      onPress: () => editorRef.current?.toggleUnderline(),
    },
    {
      action: 'strikethrough',
      icon: StrikeThroughSvg,
      onPress: () => editorRef.current?.toggleStrikeThrough(),
    },
    {
      action: 'ul',
      icon: BulletedListSvg,
      onPress: () => editorRef.current?.toggleUnorderedList(),
    },
    {
      action: 'ol',
      icon: NumberedListSvg,
      onPress: () => editorRef.current?.toggleOrderedList(),
    },
    {
      action: 'h1',
      icon: H1Svg,
      onPress: () => editorRef.current?.toggleH1(),
    },
    {
      action: 'h2',
      icon: H2Svg,
      onPress: () => editorRef.current?.toggleH2(),
    },
    {
      action: 'mention',
      icon: MentionSvg,
      onPress: () => {
        forceMentionRef.current = true;
        editorRef.current?.startMention('@');
      },
    },
    {
      action: 'link',
      icon: LinkSvg,
      onPress: () => {
        const sel = selectionRef.current;
        if (!sel || sel.start === sel.end) {
          showToast('Select text first to add a link', 'info');
          return;
        }
        setShowLinkModal(true);
      },
    },
    {
      action: 'inlineCode',
      icon: InlineCodeSvg,
      onPress: () => editorRef.current?.toggleInlineCode(),
    },
    {
      action: 'codeblock',
      icon: CodeBlockSvg,
      onPress: () => editorRef.current?.toggleCodeBlock(),
    },
  ];

  // Helper to check if a format is currently active (using exact library state keys)
  const isActive = (action: string): boolean => {
    if (!stylesState) return false;

    switch (action) {
      case 'bold':
        return stylesState.bold?.isActive ?? false;
      case 'italic':
        return stylesState.italic?.isActive ?? false;
      case 'underline':
        return stylesState.underline?.isActive ?? false;
      case 'strikethrough':
        return stylesState.strikeThrough?.isActive ?? false;
      case 'ul':
        return stylesState.unorderedList?.isActive ?? false;
      case 'ol':
        return stylesState.orderedList?.isActive ?? false;
      case 'h1':
        return stylesState.h1?.isActive ?? false;
      case 'h2':
        return stylesState.h2?.isActive ?? false;
      case 'mention':
        return stylesState.mention?.isActive ?? false;
      case 'link':
        return stylesState.link?.isActive ?? false;
      case 'inlineCode':
        return stylesState.inlineCode?.isActive ?? false;
      case 'codeblock':
        return stylesState.codeBlock?.isActive ?? false;
      default:
        return false;
    }
  };

  const handleLinkAdd = (url: string) => {
    const sel = selectionRef.current;
    if (!sel) return;
    editorRef.current?.setLink(sel.start, sel.end, sel.text, url);
    setShowLinkModal(false);
  };

  const filteredUsers = useMemo(() => {
    if (debouncedQuery.length === 0) return [];
    const q = debouncedQuery.toLowerCase();
    return MENTION_USERS.filter(u =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q),
    );
  }, [debouncedQuery]);

  const handleMentionSelect = (user: {
    id: number;
    firstName: string;
    lastName: string;
  }) => {
    editorRef.current?.setMention(
      `${user.firstName} ${user.lastName}`,
      String(user.id),
    );
    setShowMentionList(false);
  };

  console.log('Editor Ref:', htmlContent);

  return (
    <Wrapper headerTitle="Text Editor" scrollView={false}>
      <LinkModal
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onAddLink={handleLinkAdd}
      />
      <View style={styles.editorWrapper} onLayout={onEditorLayout}>
        <EnrichedTextInput
          ref={editorRef}
          onChangeHtml={e => setHtmlContent(e.nativeEvent.value)}
          onChangeText={e => {
            plainTextRef.current = e.nativeEvent.value;
          }}
          onChangeState={(e: NativeSyntheticEvent<OnChangeStateEvent>) => {
            setStylesState(e.nativeEvent);
          }}
          style={styles.editor}
          onChangeSelection={e => {
            const { start, end, text } = e.nativeEvent;
            selectionRef.current = { start, end, text };
            if (showMentionList) {
              setMentionTop(computeMentionTop());
            }
          }}
          onChangeMention={e => {
            if (suppressMentionRef.current) return;
            setMentionQuery(e.text);
            setMentionTop(computeMentionTop());
            setShowMentionList(true);
          }}
          mentionIndicators={['@']}
          onStartMention={openMentionList}
          onEndMention={() => {
            suppressMentionRef.current = false;
            setShowMentionList(false);
          }}
          htmlStyle={{
            a: {
              color: Colors.primary,
            },
          }}
        />
        <MentionList
          visible={showMentionList}
          users={filteredUsers}
          onSelect={handleMentionSelect}
          top={mentionTop}
          query={mentionQuery}
          loading={mentionLoading}
        />
      </View>

      <View style={styles.toolbarContainer}>
        <ScrollView horizontal contentContainerStyle={styles.toolbarContent}>
          {formatActions.map(item => {
            const Icon = item.icon;
            const active = isActive(item.action);

            return (
              <TouchableOpacity
                key={item.action}
                onPress={item.onPress}
                style={[styles.toolbarItem, active && styles.toolbarItemActive]}
              >
                <Icon
                  width={moderateScale(24)}
                  height={moderateScale(24)}
                  fill={active ? Colors.white : Colors.grey_400}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </Wrapper>
  );
};

export default TextEditorScreen;
