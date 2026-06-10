import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, ActivityIndicator, useWindowDimensions} from 'react-native';
import RenderHtml from 'react-native-render-html';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import {Font} from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import {getMasterContentApi} from '../../api/rideBookingApis';

const PrivacyPolicyScreen = () => {
  const {width} = useWindowDimensions();
  const [content, setContent] = useState<string | null>(null);
  const [title, setTitle] = useState('Privacy Policy');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await getMasterContentApi(1);
      if (response.remote === 'success') {
        const data = (response.data as any)?.data ?? response.data;
        if (data?.content) setContent(data.content);
        if (data?.title) setTitle(data.title);
      }
    } catch (e) {
      // fallback to default
    } finally {
      setLoading(false);
    }
  };

  const defaultContent = `Effective Date: April 1, 2026

1. Introduction

Welcome to Zylo. Zylo is a ride-hailing and food delivery platform that connects users with drivers and food vendors globally. We are committed to protecting your personal information and your right to privacy.

2. Information We Collect

We collect personal information you provide directly: full name, email address, phone number, profile photo, payment and billing information, delivery and pickup addresses, identity verification documents (where required), and feedback or communications with our support team.

We also collect information automatically: precise GPS location data when using ride or delivery services, device information (device type, OS version, unique identifiers), usage data, IP address, and cookies.

From third parties: social login data (Google, Facebook, Apple), payment verification data, and background check data for drivers where applicable.

3. How We Use Your Information

We use your information to provide and maintain our services, process transactions, match riders with drivers and customers with food vendors, send real-time trip and order updates, verify identity and prevent fraud, improve and personalise our services, communicate about promotions and support, and comply with Indian law (IT Act 2000, IT Rules 2011, DPDP Act 2023) and international regulations including GDPR for EU users.

4. Sharing of Your Information

We do not sell your personal information. We share data with service providers (drivers, food vendors, delivery partners, cloud hosting, payment processors, analytics) strictly to fulfil your requested service. We may disclose information to law enforcement when required by applicable law. In the event of a merger or acquisition, your information may be transferred with prior notice.

5. Location Data

Zylo collects precise, real-time location data when you request a ride or place a food order. This is essential for service delivery, driver matching, and ETA calculation. You may disable location permissions, but this will prevent core app functionality. Location data is not shared with third parties for advertising purposes.

6. Data Retention

We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion at any time by contacting legal@zyloapp.com. We may retain certain information as required by law or for fraud prevention.

7. Data Security

We implement SSL/TLS encryption, encrypted databases, access controls, and regular security audits to protect your information.

8. Your Rights

You have the right to access, rectify, erase, restrict, and port your personal data, and to object to processing. Indian users have additional rights under the Digital Personal Data Protection Act, 2023. EU/EEA users have rights under GDPR. Contact us at legal@zyloapp.com.

9. Children's Privacy

Zylo does not knowingly collect personal information from individuals under 18 years of age.

10. Contact Us

Email: legal@zyloapp.com | Website: www.zyloapp.com`;

  return (
    <WrapperScreen>
      <Header showBack title="Privacy Policy" />
      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#EDAE10" style={{marginTop: 40}} />
        ) : (
          <>
            <CustomText style={styles.sectionTitle}>{title}</CustomText>
            <RenderHtml
              contentWidth={width - 40}
              source={{html: content || `<p>${defaultContent.replace(/\n/g, '<br/>')}</p>`}}
              baseStyle={{fontSize: 14, color: '#5A5A5A', lineHeight: 22}}
              tagsStyles={{
                p: {marginBottom: 8},
                h1: {fontSize: 20, fontWeight: 'bold', color: '#0A0203', marginBottom: 8},
                h2: {fontSize: 18, fontWeight: 'bold', color: '#0A0203', marginBottom: 6},
                h3: {fontSize: 16, fontWeight: 'bold', color: '#0A0203', marginBottom: 4},
                ul: {paddingLeft: 16},
                ol: {paddingLeft: 16},
                li: {marginBottom: 4},
                a: {color: '#EDAE10'},
                strong: {fontWeight: 'bold'},
                em: {fontStyle: 'italic'},
              }}
            />
          </>
        )}
      </ScrollView>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff', padding: 20},
  sectionTitle: {fontSize: 16, fontFamily: Font.textSemiBolder, color: '#0A0203', marginTop: 20, marginBottom: 8},
  bodyText: {fontSize: 14, color: '#5A5A5A', lineHeight: 22, textAlign: 'justify'},
});

export default PrivacyPolicyScreen;
