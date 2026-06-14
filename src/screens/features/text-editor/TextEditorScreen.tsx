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
  findNodeHandle,
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
import { getCaretRect } from '../../../native/CursorPosition';
import { MENTION_USERS } from '../../../data/mention-users';
import { moderateScale } from 'react-native-size-matters';
import Wrapper from '../../../components/common/Wrapper';
import Colors from '../../../constants/Colors';
import MentionList from './MentionListModal';
import LinkModal from './LinkModal';
import styles from './styles';

// Must match the fixed editor height in styles.ts (`editor.height`).
const EDITOR_HEIGHT = moderateScale(250, 0.4);

const TextEditorScreen = () => {
  const editorRef = useRef<EnrichedTextInputInstance>(null);
  const editorWrapperRef = useRef<View>(null);
  // ← This holds the live formatting state
  const [stylesState, setStylesState] = useState<OnChangeStateEvent | null>(
    null,
  );

  const [htmlContent, setHtmlContent] = useState('');

  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [mentionLoading, setMentionLoading] = useState(false);
  // Position of the mention list: anchored by `top` (below the caret) or by
  // `bottom` (above the caret, when the caret is in the lower half).
  const [mentionPos, setMentionPos] = useState<{
    top?: number;
    bottom?: number;
  }>({ top: 0 });
  // IDs of users currently mentioned in the editor (derived from the HTML).
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);

  const { showToast } = useToast();

  const [showLinkModal, setShowLinkModal] = useState(false);
  const selectionRef = useRef<{
    start: number;
    end: number;
    text: string;
  } | null>(null);

  const plainTextRef = useRef('');
  const suppressMentionRef = useRef(false);
  const forceMentionRef = useRef(false);

  const MENTION_GAP = moderateScale(4);

  console.log('Mention user ids:', mentionedUserIds);

  // Positions the mention list just below the caret, using the real caret rect
  // from the native CursorPositionModule (resolved via the editor's node tag).
  const updateMentionTop = useCallback(async () => {
    const cursor = selectionRef.current?.start ?? plainTextRef.current.length;
    const tag = findNodeHandle(editorWrapperRef.current as any);
    if (tag == null) return;
    const rect = await getCaretRect(tag, cursor);
    if (!rect) return;

    // Lower half of the fixed-height editor -> open ABOVE the caret (anchored
    // by bottom so the list grows upward); otherwise open below it.
    const caretMid = rect.y + rect.height / 2;
    if (caretMid > EDITOR_HEIGHT / 2) {
      setMentionPos({ bottom: EDITOR_HEIGHT - rect.y + MENTION_GAP });
    } else {
      setMentionPos({ top: rect.y + rect.height + MENTION_GAP });
    }
  }, [MENTION_GAP]);

  const openMentionList = useCallback(() => {
    // Native only fires this when "@" starts a word (emails like "a@b" never
    // trigger it), so no extra guarding is needed — just open the list.
    forceMentionRef.current = false;
    suppressMentionRef.current = false;
    setMentionQuery('');
    setDebouncedQuery('');
    setMentionLoading(false);
    updateMentionTop();
    setShowMentionList(true);
  }, [updateMentionTop]);

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
    ).slice(0, 3);
  }, [debouncedQuery]);

  const handleMentionSelect = (user: {
    id: number;
    firstName: string;
    lastName: string;
  }) => {
    // Display handle: @firstnamelastname (lowercase). The text replaces the
    // typed "@query" entirely, so the indicator must be part of it.
    const handle = `@${user.firstName}${user.lastName}`.toLowerCase();
    editorRef.current?.setMention('@', handle, { id: String(user.id) });
    setShowMentionList(false);
  };

  // console.log('Editor Ref:', htmlContent);
  console.log('Mentioned user IDs:', mentionedUserIds);

  return (
    <Wrapper headerTitle="Text Editor" scrollView={false}>
      <LinkModal
        visible={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onAddLink={handleLinkAdd}
      />
      <View ref={editorWrapperRef} style={styles.editorWrapper}>
        <EnrichedTextInput
          ref={editorRef}
          onChangeHtml={e => {
            const html = e.nativeEvent.value;
            setHtmlContent(html);
            // Derive the selected mention ids from the editor HTML so the list
            // stays correct on both insert and deletion (single source of truth).
            // Mentions serialize as: <mention text=".." indicator="@" id="1">..
            const ids = [
              ...html.matchAll(/<mention\b[^>]*?\bid="([^"]*)"[^>]*>/g),
            ].map(m => m[1]);
            setMentionedUserIds(ids);
          }}
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
              updateMentionTop();
            }
          }}
          onChangeMention={e => {
            if (suppressMentionRef.current) return;
            setMentionQuery(e.text);
            updateMentionTop();
            setShowMentionList(true);
          }}
          onKeyPress={e => {
            // Pressing space while the list is open dismisses it and keeps the
            // typed "@text" as plain text (no mention is created). suppress
            // stops the native mention event from immediately reopening it.
            if (showMentionList && e.nativeEvent.key === ' ') {
              suppressMentionRef.current = true;
              setShowMentionList(false);
            }
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
            mention: {
              color: Colors.primary,
              // Mention "pill" background from our background palette (library
              // defaults to yellow + underline, both overridden here).
              backgroundColor: Colors.bg_400,
              textDecorationLine: 'none',
            },
          }}
        />
        <MentionList
          visible={showMentionList}
          users={filteredUsers}
          onSelect={handleMentionSelect}
          position={mentionPos}
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
