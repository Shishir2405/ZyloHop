import React from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { SVG } from './SvgHelper';

// Define Props Type
interface SearchBarProps {
  placeholder?: string;
  onChangeText?: (text: string) => void;
  Filter:() => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder = 'Search', onChangeText,Filter }) => {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.inputWrapper}>
        <SVG.Search width={24} height={24} />
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor={'#4B4B4B'}
          onChangeText={onChangeText ? onChangeText : () => {}}
          keyboardType="default"
          maxLength={50}
        />
        <TouchableOpacity onPress={Filter}>
          <SVG.FilterIcon width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    width: '100%',
    height: 54,
    borderWidth: 1,
    borderColor: '#EDAE10',
    borderRadius: 100,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInput: {
    flex: 1,
    marginHorizontal: 10,
    height: '100%',
    fontSize: 16,
    color: '#000',
  },
});

export default SearchBar;
