import React, { useState } from 'react';
import Wrapper from '../../components/common/Wrapper';
import TextInputStandard from '../../components/common/TextInputStandard';
import ButtonStandard from '../../components/common/ButtonStandard';
import { useTheme } from '../../theme/ThemeContext';
import ShowAlertModule from '../../native/ShowAlert';
import { Keyboard } from 'react-native';

const ShowAlertScreen = () => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleShowAlert = () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a name');
      return;
    }
    setError('');
    // Hands the string across the bridge to ShowAlertModule.showAlert(name: String)
    ShowAlertModule.showAlert(trimmed);
  };

  return (
    <Wrapper
      headerTitle="Show Alert"
      scrollView={false}
      // TextInputStandard's field is Colors.white, identical to the light
      // theme's `background` — unfocused, the input would have no fill contrast
      // (focus only adds a border). sheetBackground is the token meaning
      // "surfaces sitting on me should read as raised".
      backgroundColor={theme.colors.sheetBackground}
    >
      <TextInputStandard
        label="Name"
        value={name}
        onChangeText={text => {
          setName(text);
          if (error) setError('');
        }}
        placeholder="Enter a name"
        autoCapitalize="words"
        error={error}
      />
      <ButtonStandard btnLabel="Show Native Alert" onPress={handleShowAlert} />
    </Wrapper>
  );
};

export default ShowAlertScreen;
