import React, {useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, View} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import Input from '../../common/Input';
import {Font} from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import {StackNavigationProp} from '@react-navigation/stack';
import {AuthStackParamList} from '../auth';
import {useNavigation} from '@react-navigation/native';
import {deleteAccountApi} from '../../api/userApis';
import {errorToast, successToast} from '../../components/toasts';
import {removeLocalStorage} from '../../utils/helper';
import {useDispatch} from 'react-redux';
import {logoutUserInfoRedux} from '../../Redux/Reducer/UserinfoReducer';
import {FormFieldError} from '../../components/forms/FormFieldError';
import {SubmitButton} from '../../components/forms/SubmitButton';
import {
  deleteAccountSchema,
  DeleteAccountValues,
} from '../../utils/validation/accountSchemas';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'DeleteAccountScreen'
>;

const DeleteAccountScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const [apiPending, setApiPending] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {errors, isSubmitting, isValid},
  } = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    mode: 'onChange',
    defaultValues: {confirmation: '' as unknown as 'DELETE'},
  });

  const performDelete = async () => {
    setApiPending(true);
    try {
      const response = await deleteAccountApi();
      if (response.remote === 'success') {
        successToast('Account deleted successfully');
        await removeLocalStorage('token');
        dispatch(logoutUserInfoRedux());
        navigation.reset({
          index: 0,
          routes: [{name: 'SignInScreen' as any}],
        });
      } else {
        const errMsg = (response as any)?.errors?.errors;
        errorToast(
          typeof errMsg === 'string' ? errMsg : 'Failed to delete account',
        );
      }
    } catch (e: any) {
      errorToast(e?.message || 'Something went wrong');
    } finally {
      setApiPending(false);
    }
  };

  const onSubmit = (_data: DeleteAccountValues) => {
    // Final last-line-of-defence prompt. Even after the user types DELETE,
    // we still want one more "are you absolutely sure?" gate because this
    // wipes their account permanently and we can't recover from it.
    Alert.alert(
      'Are you absolutely sure?',
      'This will permanently delete your account and cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Yes, delete',
          style: 'destructive',
          onPress: () => {
            void performDelete();
          },
        },
      ],
      {cancelable: true},
    );
  };

  const submitting = isSubmitting || apiPending;

  return (
    <WrapperScreen>
      <Header showBack title="Delete Account" />
      <View style={styles.container}>
        <CustomText style={styles.bodyText}>
          Are you sure you want to delete your account? {'\n'}
          Deleting your account removes personal information from our database.
          This action cannot be undone.
        </CustomText>

        <CustomText style={styles.confirmLabel}>
          Type{' '}
          <CustomText style={styles.confirmWord}>DELETE</CustomText> to confirm
        </CustomText>
        <Controller
          control={control}
          name="confirmation"
          render={({field: {value, onChange, onBlur}}) => (
            <Input
              placeholder="DELETE"
              autoCapitalize="characters"
              autoCorrect={false}
              value={value as string}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.confirmation?.message}
            />
          )}
        />
        <FormFieldError message={errors.confirmation?.message} />
      </View>
      <View style={styles.footer}>
        <SubmitButton
          label={submitting ? 'Deleting...' : 'Permanently Delete Account'}
          loading={submitting}
          disabled={!isValid || submitting}
          onPress={handleSubmit(onSubmit)}
          style={styles.deleteButton}
        />
        {submitting && (
          <ActivityIndicator style={{marginTop: 5}} color="#D14343" />
        )}
      </View>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 20},
  bodyText: {textAlign: 'justify', lineHeight: 23},
  confirmLabel: {
    marginTop: 24,
    marginBottom: 4,
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#2A2A2A',
  },
  confirmWord: {
    fontFamily: Font.textBolder,
    color: '#D14343',
  },
  footer: {paddingHorizontal: 20},
  deleteButton: {margin: 20, backgroundColor: '#D14343'},
});

export default DeleteAccountScreen;
