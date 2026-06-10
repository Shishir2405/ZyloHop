import { useIsFocused, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { storeBasketId } from '../../Redux/Reducer/UserinfoReducer';
import { storeIsLoading } from '../../Redux/Reducer/loadingRedux';
import { getUserBasketApi } from '../../api/orderFoodApis';
import { Product } from '../../api/types/foodFlowTypes';
import { BasketItem } from '../../api/types/orderFlowTypes';
import BasketItemCard from '../../common/BasketItemCard';
import Button from '../../common/Button';
import CustomText from '../../common/CustomText';
import Footer from '../../common/Footer';
import Header from '../../common/Header';
import BasketSkeleton from '../../common/Skeleton/MyBagSkeleton';
import { Font } from '../../common/Theam';
import { errorToast } from '../../components/toasts';
import { AuthStackParamList } from '../auth';
import LottieView from 'lottie-react-native';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'MyBag'>;

const MyBag = () => {
  const isfocused = useIsFocused();
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const loading: any = useSelector((state: any) => state.loading.isLoading);
  const selectedProduct: Product = useSelector(
    (state: any) => state.restaurant.selectedProduct,
  );
  const [basketItems, setBasketItems] = React.useState<BasketItem[]>([]);
  const [fetchError, setFetchError] = React.useState<string | null>(null);

  const handleGetUserBasketApi = async () => {
    try {
      dispatch(storeIsLoading(true));
      setFetchError(null);
      const response = await getUserBasketApi();

      if (response?.remote === 'success') {
        const list = response.data.data.basketItems.map((item: any) => ({
          basketItemId: item.basketItemId,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          image:
            item.productImages?.length > 0
              ? item.productImages?.[0].url
              : require('../../assets/image/other/Pizza.png'),
        }));
        dispatch(storeBasketId(response.data.data.id));
        setBasketItems(list);
      } else {
        if (response?.errors?.status === 401) {
          navigation.reset({ index: 0, routes: [{ name: 'SignInScreen' }] });
        }
        const errorMsg =
          response?.errors?.errors?.message ||
          response?.errors?.errors ||
          'An unexpected error occurred';
        const message =
          typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg);
        setFetchError(message);
        errorToast(message);
      }
    } finally {
      dispatch(storeIsLoading(false));
    }
  };

  useEffect(() => {
    if (isfocused) {
      handleGetUserBasketApi();
    }
  }, [isfocused]);

  const renderItem = ({ item }: { item: BasketItem }) => {
    return <BasketItemCard item={item} setBasketItems={setBasketItems} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header showBack title="My Bag" />

      <View style={styles.container}>
        {loading ? (
          <BasketSkeleton />
        ) : fetchError && basketItems.length === 0 ? (
          <View style={styles.errorContainer}>
            <CustomText style={styles.errorTitle}>
              Couldn't load your bag
            </CustomText>
            <CustomText style={styles.errorSubtitle}>{fetchError}</CustomText>
            <TouchableOpacity
              onPress={handleGetUserBasketApi}
              style={styles.retryButton}
            >
              <CustomText style={styles.retryText}>Retry</CustomText>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={basketItems}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <LottieView
                  source={require('../../assets/shopping_cart_lottie.json')}
                  autoPlay
                  loop
                  style={{ width: 260, height: 260, marginBottom: 16 }}
                />
              </View>
            }
          />
        )}
        <Button
          buttonName={'Address'}
          onPress={() => navigation.navigate('Address')}
          style={{ marginVertical: 10 }}
        />
      </View>
      <Footer isHome />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  valuettext: {
    color: '#101010',
    fontSize: 16,
    fontFamily: Font.textBolder,
    marginBottom: 15,
  },
  valuetitle: {
    color: '#101010',
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
  },
  flexrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  inputview: {
    backgroundColor: '#E8E8E8',
    flex: 1,
    padding: 10,
  },
  promoview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 5,
  },
  sendbutton: {
    backgroundColor: '#000000',
    height: 60,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  amounttext: {
    color: '#222222',
    fontSize: 15,
    fontFamily: Font.textSemiBolder,
  },
  sizetext: {
    color: '#101010',
    fontSize: 12,
    fontFamily: Font.textNormal,
    marginRight: 10,
  },
  titletext: {
    color: '#101010',
    fontSize: 15,
    fontFamily: Font.textSemiBolder,
  },
  cardContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#101010',
    paddingVertical: 20,
    borderStyle: 'dashed',
  },
  rocenter: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  imagesize: {
    height: 100,
    width: 100,
    borderRadius: 20,
    paddingRight: 10,
  },
  imagestyle: {
    height: '100%',
    width: '100%',
    borderRadius: 20,
  },

  container: {
    marginHorizontal: 10,
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontFamily: Font.textSemiBolder,
    color: '#1A1A1A',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EDAE10',
  },
  retryText: {
    color: '#fff',
    fontFamily: Font.textSemiBolder,
    fontSize: 14,
  },
});

export default MyBag;
