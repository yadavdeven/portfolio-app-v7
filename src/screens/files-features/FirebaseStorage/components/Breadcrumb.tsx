import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../../constants/Colors';
import { Crumb } from '../../../../types/drive';
import HomeSvg from '../../../../assets/svgs/home_24dp_300.svg';
import { styles } from './Breadcrumb.styles';

interface Props {
  crumbs: Crumb[];
  onCrumbPress: (index: number) => void;
}

// Beyond this depth the middle is collapsed into a "…" (first › … › last two).
const MAX_VISIBLE = 4;

type CrumbNode =
  | { kind: 'crumb'; crumb: Crumb; index: number }
  | { kind: 'ellipsis'; targetIndex: number };

const buildNodes = (crumbs: Crumb[]): CrumbNode[] => {
  if (crumbs.length <= MAX_VISIBLE) {
    return crumbs.map((crumb, index) => ({ kind: 'crumb', crumb, index }));
  }
  const last = crumbs.length - 1;
  return [
    { kind: 'crumb', crumb: crumbs[0], index: 0 },
    { kind: 'ellipsis', targetIndex: last - 2 },
    { kind: 'crumb', crumb: crumbs[last - 1], index: last - 1 },
    { kind: 'crumb', crumb: crumbs[last], index: last },
  ];
};

const Separator = () => <Text style={styles.separator}>›</Text>;

const Breadcrumb = ({ crumbs, onCrumbPress }: Props) => {
  const nodes = buildNodes(crumbs);
  const lastIndex = crumbs.length - 1;
  const atRoot = crumbs.length === 1;

  return (
    <View style={styles.card}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {nodes.map(node => {
          if (node.kind === 'ellipsis') {
            return (
              <View key="ellipsis" style={styles.nodeWrap}>
                <Separator />
                <TouchableOpacity onPress={() => onCrumbPress(node.targetIndex)}>
                  <Text style={styles.ellipsis}>…</Text>
                </TouchableOpacity>
              </View>
            );
          }

          const isRoot = node.index === 0;
          const isCurrent = node.index === lastIndex;

          // The root is shown as a plain home icon (no folder name).
          if (isRoot) {
            return (
              <TouchableOpacity
                key={node.crumb._id}
                disabled={isCurrent}
                onPress={() => onCrumbPress(0)}
                style={styles.homeIcon}
              >
                <HomeSvg
                  width={moderateScale(20)}
                  height={moderateScale(20)}
                  stroke={isCurrent ? Colors.primary : Colors.grey_200}
                />
              </TouchableOpacity>
            );
          }

          return (
            <View key={node.crumb._id} style={styles.nodeWrap}>
              <Separator />
              <TouchableOpacity
                disabled={isCurrent}
                onPress={() => onCrumbPress(node.index)}
              >
                <Text
                  style={[styles.crumb, isCurrent && styles.crumbCurrent]}
                  numberOfLines={1}
                >
                  {node.crumb.name}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {atRoot && (
          <Text style={styles.rootInfo}>
            You're in the root folder — open a folder to navigate
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default Breadcrumb;
