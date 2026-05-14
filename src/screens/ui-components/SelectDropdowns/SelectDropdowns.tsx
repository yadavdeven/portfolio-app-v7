import React, { useState } from 'react';
import { View } from 'react-native';
import Wrapper from '../../../components/common/Wrapper';
import InfoBanner from '../../../components/common/InfoBanner';
import SearchModalDropdown from '../../../components/select-dropdowns/SearchModalDropdown';
import { STATES } from '../../../data/states';
import styles from './styles';
import DropdownStandard from '../../../components/select-dropdowns/DropdownStandard';
import MultiSelectDropdown from '../../../components/select-dropdowns/MultiSelectDropdown';

const TRANSACTION_TYPES = [
  { label: 'Balance Enquiry', value: 'BE' },
  { label: 'Cash Withdrawal', value: 'CW' },
  { label: 'Mini Statement', value: 'MS' },
  { label: 'Fund Transfer', value: 'FT' },
  { label: 'Aadhaar Pay', value: 'AP' },
];

function SelectDropdowns() {
  const [searchModalDropdownValue, setSearchModalDropdownValue] =
    useState<string>('');
  const [showSearchDropdownModal, setShowSearchDropdownModal] = useState(false);
  const [standardDropdownValue, setStandardDropdownValue] =
    useState<string>('');
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const [showMultiSelectModal, setShowMultiSelectModal] = useState(false);

  return (
    <Wrapper headerTitle="Select Dropdowns">
      <InfoBanner
        title="Search Modal Dropdown"
        description="opens a bottom-sheet modal with a search field and a scrollable list. the modal slides up from the bottom and scrolls to the selected item."
      />

      <SearchModalDropdown
        label="State"
        value={searchModalDropdownValue}
        onPress={() => setShowSearchDropdownModal(true)}
        placeholder="Select State"
        data={STATES}
        isVisible={showSearchDropdownModal}
        onClose={() => setShowSearchDropdownModal(false)}
        onSelect={item => setSearchModalDropdownValue(item.label)}
        modalTitle="Select State"
        searchPlaceholder="Search state"
      />

      <InfoBanner
        title="Standard Dropdown"
        description="simple dropdown that opens a modal with a list of options. the modal opens below or on top of the field based on available space."
        containerStyle={styles.bannerSpacing}
      />
      <DropdownStandard
        label="Transaction Type"
        value={standardDropdownValue}
        placeholder="Select Transaction Type"
        data={TRANSACTION_TYPES}
        onSelect={item => setStandardDropdownValue(item.label)}
      />

      <InfoBanner
        title="Multi-Select Dropdown"
        description='bottom-sheet modal with search and checkbox rows. Tap rows to toggle a working selection, then hit Apply to commit (or Clear to reset). The trigger field shows up to two labels and a "+N more" overflow.'
        containerStyle={styles.bannerSpacing}
      />
      <MultiSelectDropdown
        label="States"
        values={multiSelectValues}
        placeholder="Select states"
        data={STATES}
        isVisible={showMultiSelectModal}
        onPress={() => setShowMultiSelectModal(true)}
        onClose={() => setShowMultiSelectModal(false)}
        onApply={items => setMultiSelectValues(items.map(i => i.value))}
        modalTitle="Select States"
        searchPlaceholder="Search state"
      />

      <InfoBanner
        title="Standard Dropdown"
        description="simple dropdown that opens a modal with a list of options. the modal opens below or on top of the field based on available space."
        containerStyle={styles.bannerSpacing}
      />
      <DropdownStandard
        label="Transaction Type"
        value={standardDropdownValue}
        placeholder="Select Transaction Type"
        data={TRANSACTION_TYPES}
        onSelect={item => setStandardDropdownValue(item.label)}
      />
      <View style={styles.bottomSpacer} />
    </Wrapper>
  );
}

export default SelectDropdowns;
