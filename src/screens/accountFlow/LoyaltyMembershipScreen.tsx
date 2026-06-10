import React, {useCallback, useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useDispatch} from 'react-redux';
import CustomText from '../../common/CustomText';
import Header from '../../common/Header';
import {Font} from '../../common/Theam';
import WrapperScreen from '../../common/WrapperScreen';
import {SVG} from '../../common/SvgHelper';
import {useNavigation} from '@react-navigation/native';
import {getLoyaltySummaryApi, getLoyaltyHistoryApi} from '../../api/rideBookingApis';
import GlobalErrorBanner from '../../components/GlobalErrorBanner';
import {
  setGlobalError,
  clearGlobalError,
} from '../../Redux/Reducer/globalErrorRedux';

const TIER_COLORS: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#9CA3AF',
  Gold: '#EDAE10',
  Platinum: '#6366F1',
};

const LoyaltyMembershipScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isError, setIsError] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    try {
      // Preserve the parallel fetch — both endpoints are independent.
      const [sumRes, histRes] = await Promise.all([
        getLoyaltySummaryApi(),
        getLoyaltyHistoryApi(),
      ]);
      let bothFailed = true;
      if (sumRes.remote === 'success') {
        const d = (sumRes.data as any)?.data ?? sumRes.data;
        setSummary(d);
        bothFailed = false;
      }
      if (histRes.remote === 'success') {
        const d = (histRes.data as any)?.data ?? histRes.data;
        setHistory(Array.isArray(d) ? d.slice(0, 5) : []);
        bothFailed = false;
      }
      if (bothFailed) {
        const msg = 'Failed to load loyalty information';
        setIsError(true);
        dispatch(setGlobalError({message: msg, context: 'Loyalty'}));
      } else {
        dispatch(clearGlobalError());
      }
    } catch (e: any) {
      console.error('Loyalty fetch error', e);
      const msg = e?.message || 'Failed to load loyalty information';
      setIsError(true);
      dispatch(setGlobalError({message: msg, context: 'Loyalty'}));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tierColor = summary?.tier ? (TIER_COLORS[summary.tier] ?? '#EDAE10') : '#EDAE10';
  const progress = summary?.progressPercent ?? 0;
  const totalPoints = summary?.totalPoints ?? 0;
  const tier = summary?.tier ?? '—';
  const pointsToNext = summary?.pointsToNextTier ?? 0;
  const nextThreshold = summary?.nextTierThreshold ?? 0;

  return (
    <WrapperScreen>
      <Header title="Loyalty Membership" showBack />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {isError && (
          <GlobalErrorBanner context="Loyalty" onRetry={fetchData} />
        )}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#EDAE10" />
          </View>
        ) : (
          <>
            {/* Points card */}
            <TouchableOpacity
              style={[styles.pointview, {borderColor: tierColor}]}
              onPress={() => navigation.navigate('PointHistory')}>
              <View style={[styles.flexdirex, styles.justfy]}>
                <View style={styles.flexdirex}>
                  <SVG.Points />
                  <CustomText style={[styles.amount, {color: tierColor}]}>
                    {totalPoints}
                  </CustomText>
                  <CustomText style={[styles.point_text, {color: tierColor}]}>
                    Points
                  </CustomText>
                </View>
                <CustomText style={styles.history}>Point history</CustomText>
              </View>
              <View style={[styles.flexdirex, {marginTop: 8}]}>
                <SVG.Information />
                <TouchableOpacity onPress={() => navigation.navigate('AllOffers')}>
                  <CustomText style={styles.offersy}>Know all the offers</CustomText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>

            {/* Current tier */}
            <CustomText style={styles.sectionTitle}>Current Tier</CustomText>
            <View style={[styles.tierCard, {borderLeftColor: tierColor}]}>
              <View style={styles.flexdirex}>
                <CustomText style={[styles.tierName, {color: tierColor}]}>
                  {tier}
                </CustomText>
                <CustomText style={styles.tierPoints}>
                  {'  ·  '}{totalPoints} pts total
                </CustomText>
              </View>
              {nextThreshold > 0 ? (
                <CustomText style={styles.tierSub}>
                  {pointsToNext} pts to reach next tier
                </CustomText>
              ) : (
                <CustomText style={styles.tierSub}>You've reached the top tier!</CustomText>
              )}
            </View>

            {/* Progress bar */}
            <CustomText style={styles.sectionTitle}>Current Progress</CustomText>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {width: `${Math.min(progress, 100)}%`, backgroundColor: tierColor},
                ]}
              />
            </View>
            <CustomText style={styles.progressLabel}>
              {progress.toFixed(0)}% to next tier
            </CustomText>

            {/* Offers preview */}
            {summary?.offers?.length > 0 && (
              <>
                <CustomText style={styles.sectionTitle}>Loyalty Offers</CustomText>
                {summary.offers.slice(0, 2).map((offer: any, i: number) => (
                  <View key={i} style={styles.offerCard}>
                    <View style={styles.offerBadge}>
                      <CustomText style={styles.offerPoints}>{offer.pointsRequired} pts</CustomText>
                    </View>
                    <View style={{flex: 1, marginLeft: 10}}>
                      <CustomText style={styles.offerTitle}>{offer.title}</CustomText>
                      <CustomText style={styles.offerDesc}>{offer.description}</CustomText>
                    </View>
                  </View>
                ))}
                <TouchableOpacity onPress={() => navigation.navigate('AllOffers')}>
                  <CustomText style={[styles.history, {color: tierColor, marginTop: 8}]}>
                    View all offers →
                  </CustomText>
                </TouchableOpacity>
              </>
            )}

            {/* Recent activity */}
            {history.length > 0 && (
              <>
                <CustomText style={styles.sectionTitle}>Recent Activity</CustomText>
                {history.map((item: any, i: number) => (
                  <View key={item.id ?? i} style={styles.historyRow}>
                    <View>
                      <CustomText style={styles.historyTitle}>
                        {item.reason ?? item.eventType}
                      </CustomText>
                      <CustomText style={styles.historyDate}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </CustomText>
                    </View>
                    <CustomText
                      style={[
                        styles.historyPoints,
                        {color: item.points > 0 ? '#4CAF50' : '#F44336'},
                      ]}>
                      {item.points > 0 ? '+' : ''}{item.points} pts
                    </CustomText>
                  </View>
                ))}
              </>
            )}

            <View style={{height: 40}} />
          </>
        )}
      </ScrollView>
    </WrapperScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  sectionTitle: {
    color: '#0A0203',
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    marginTop: 20,
    marginBottom: 10,
  },
  amount: {
    fontSize: 22,
    fontFamily: Font.textSemiBolder,
    marginLeft: 5,
  },
  point_text: {
    fontSize: 12,
    fontFamily: Font.textNormal,
    marginLeft: 5,
  },
  history: {
    color: '#6B6B6B',
    fontSize: 13,
    fontFamily: Font.textNormal,
  },
  offersy: {
    color: '#6B6B6B',
    fontSize: 14,
    fontFamily: Font.textNormal,
    marginLeft: 5,
  },
  justfy: {justifyContent: 'space-between'},
  flexdirex: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointview: {
    borderWidth: 1.5,
    borderRadius: 15,
    padding: 15,
  },
  tierCard: {
    borderLeftWidth: 4,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    padding: 14,
  },
  tierName: {
    fontSize: 18,
    fontFamily: Font.textSemiBolder,
  },
  tierPoints: {
    fontSize: 13,
    color: '#6B6B6B',
    fontFamily: Font.textNormal,
  },
  tierSub: {
    fontSize: 12,
    color: '#6B6B6B',
    fontFamily: Font.textNormal,
    marginTop: 4,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B6B6B',
    fontFamily: Font.textNormal,
    marginTop: 6,
    textAlign: 'right',
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  offerBadge: {
    backgroundColor: '#FFF4E6',
    borderRadius: 6,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  offerPoints: {
    color: '#EDAE10',
    fontSize: 11,
    fontFamily: Font.textSemiBolder,
  },
  offerTitle: {
    color: '#0A0203',
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
  },
  offerDesc: {
    color: '#5A5A5A',
    fontSize: 11,
    fontFamily: Font.textNormal,
    marginTop: 2,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyTitle: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#121212',
  },
  historyDate: {
    fontSize: 11,
    fontFamily: Font.textNormal,
    color: '#5A5A5A',
    marginTop: 2,
  },
  historyPoints: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
  },
});

export default LoyaltyMembershipScreen;
