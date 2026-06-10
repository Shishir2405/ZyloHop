import React from 'react';
import { Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import { errorToast } from '../../components/toasts';

const HelpSupportScreen = () => {
  // Centralised opener: probe canOpenURL first so we surface a real toast
  // when no dialer/mail client is installed (or Android intent picker is
  // blocked), instead of silently failing or crashing on `openURL`.
  const safeOpen = async (url: string, friendlyKind: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        errorToast(`No app available to handle ${friendlyKind}.`);
        return;
      }
      await Linking.openURL(url);
    } catch (e: any) {
      errorToast(e?.message || `Couldn't open ${friendlyKind}.`);
    }
  };

  const EmergencyNumber = () => {
    const phoneNumber = '+1234567890';
    void safeOpen(`tel:${phoneNumber}`, 'phone calls');
  };

  const BillingNumber = () => {
    const phoneNumber = '+09874654321';
    void safeOpen(`tel:${phoneNumber}`, 'phone calls');
  };

  const EmailDileped = () => {
    const email = 'example@example.com';
    const subject = 'Hello!';
    const body = 'I wanted to reach out to you regarding...';

    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    void safeOpen(emailUrl, 'email');
  };

  return (
    <WrapperScreen>
      <Header showBack title="Help & Support" />
      <View style={styles.container}>
        <CustomText style={styles.heading}>
          We Are Here To Serve You{' '}
        </CustomText>
        <CustomText style={{ textAlign: 'justify', lineHeight: 23 }}>
          Are you confused or having questions? We are here to help you and we
          are available 24/7 to assist you .
        </CustomText>

        <TouchableOpacity
          style={styles.buttonview}
          onPress={() => EmergencyNumber()}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SVG.Earphone />
            <CustomText style={styles.buttontext}>Emergency Phone</CustomText>
          </View>
          <SVG.Arrowforword />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonview}
          onPress={() => BillingNumber()}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SVG.Earphone />
            <CustomText style={styles.buttontext}>Billing number</CustomText>
          </View>
          <SVG.Arrowforword />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonview}
          onPress={() => EmailDileped()}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SVG.Msgbox />
            <CustomText style={styles.buttontext}>Emergency Email</CustomText>
          </View>
          <SVG.Arrowforword />
        </TouchableOpacity>
      </View>
      {/* <Footer  isAccount /> */}
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  buttontext: {
    color: '#161616',
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    marginLeft: 10,
  },
  buttonview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDE7',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  heading: {
    color: '#404040',
    fontSize: 28,
    fontFamily: Font.textBolder,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 18,
    textAlign: 'center',
    fontFamily: Font.textSemiBolder,
    marginVertical: 20,
    color: '#000000',
  },
  card: {},
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 0.5,
    borderColor: '#FEC400',
    borderRadius: 8,
    marginVertical: 10,
    height: 51,
  },
  optionText: {
    fontSize: 14,
    color: '#000',
    // fontFamily: Font.textSemiBolder,
  },
  arrow: {
    fontSize: 16,
    color: '#000',
  },
});

export default HelpSupportScreen;
