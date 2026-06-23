import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import Colors from '../../../../constants/Colors';
import FilterSvg from '../../../../assets/svgs/filter_list_24dp_300.svg';
import ListSvg from '../../../../assets/svgs/lists_24dp_200.svg';
import GridSvg from '../../../../assets/svgs/grid_view_24dp_300.svg';
import ArrowDown from '../../../../assets/svgs/keyboard_arrow_down_24dp_300.svg';
import { styles } from './Controls.styles';

// Sort/filter control + list/grid view toggle (UI only for now).
const Controls = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.sortBtn}>
        <FilterSvg
          width={moderateScale(20)}
          height={moderateScale(20)}
          fill={Colors.grey_100}
        />
        <Text style={styles.sortText}>Sort</Text>
        <ArrowDown
          width={moderateScale(20)}
          height={moderateScale(20)}
          fill={Colors.grey_100}
        />
      </TouchableOpacity>

      <View style={styles.toggle}>
        <TouchableOpacity style={[styles.toggleBtn, styles.toggleActive]}>
          <ListSvg
            width={moderateScale(22)}
            height={moderateScale(22)}
            fill={Colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleBtn}>
          <GridSvg
            width={moderateScale(22)}
            height={moderateScale(22)}
            fill={Colors.grey_300}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Controls;
