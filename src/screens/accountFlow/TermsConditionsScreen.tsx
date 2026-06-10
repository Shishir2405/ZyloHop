import React, {useState, useEffect} from 'react';
import {ScrollView, StyleSheet, ActivityIndicator, useWindowDimensions} from 'react-native';
import RenderHtml from 'react-native-render-html';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import {Font} from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import {getMasterContentApi} from '../../api/rideBookingApis';

const TermsConditionsScreen = () => {
  const {width} = useWindowDimensions();
  const [content, setContent] = useState<string | null>(null);
  const [title, setTitle] = useState('Terms & Conditions');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await getMasterContentApi(0);
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

1. Acceptance of Terms

By downloading, registering, or using the Zylo application, you agree to be bound by these Terms and Conditions. These Terms constitute a legally binding agreement between you and Zylo Technologies Pvt. Ltd.

2. Description of Services

Zylo provides an on-demand technology platform connecting riders with independent driver-partners for transportation, and customers with registered restaurants for food delivery and pickup. Zylo acts as an intermediary platform and is not itself a transportation company, taxi service, or food vendor. Independent service providers are not employees of Zylo.

3. User Eligibility & Account Registration

You must be at least 18 years of age to register and use Zylo. You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials. One person may only maintain one active account on the platform.

4. Rides & Transportation

When you request a ride, you are requesting a service from an independent driver-partner. Estimated fares are approximate and may vary based on actual route, traffic, and applicable surge pricing. During periods of high demand, prices may be higher than standard fares; you will be notified of surge multipliers before confirming your booking.

5. Food Ordering

Food items are prepared by independent restaurant partners. Zylo is not responsible for food quality, hygiene, allergens, or preparation. Delivery time estimates are approximate. In cases of incorrect items, contact our support team within 30 minutes of delivery.

6. Payments

Zylo accepts payment via credit/debit cards, digital wallets, and cash (select cities). All prices are in US Dollars (USD) unless stated otherwise. Payment processing is handled by PCI-DSS compliant third-party processors.

7. User Obligations

By using Zylo, you agree not to impersonate any person, use the platform for any unlawful purpose, interfere with or disrupt the platform, attempt to gain unauthorised access, use automated bots or scrapers, or engage in fraudulent bookings, false reports, or manipulation of ratings.

8. Limitation of Liability

To the maximum extent permitted by applicable law, Zylo shall not be liable for any indirect, incidental, special, consequential, or punitive damages. Zylo's total aggregate liability shall not exceed the amount paid by that user in the preceding three (3) months.

9. Governing Law & Dispute Resolution

These Terms are governed by applicable local laws of the jurisdiction in which Zylo operates. Any disputes shall first be attempted through good-faith negotiation, followed by binding arbitration in accordance with the rules of a recognized arbitral institution.

10. Changes to Terms

Zylo reserves the right to modify these Terms at any time. We will provide at least 7 days' notice of material changes. Continued use of the platform after the effective date of changes constitutes acceptance.

Contact: legal@zyloapp.com | www.zyloapp.com`;

  return (
    <WrapperScreen>
      <Header showBack title="Terms & Conditions" />
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

export default TermsConditionsScreen;
