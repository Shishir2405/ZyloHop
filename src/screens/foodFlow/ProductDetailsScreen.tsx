import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Image as FastImage } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { addUpdateBasketApi } from '../../api/orderFoodApis';
import { Product } from '../../api/types/foodFlowTypes';
import { AddToBasketPayload } from '../../api/types/orderFlowTypes';
import CustomText from '../../common/CustomText';
import Footer from '../../common/Footer';
import Header from '../../common/Header';
import ProductDetailsSkeleton from '../../common/Skeleton/ProductDetailSkeleton';
import { SVG } from '../../common/SvgHelper';
import { Font } from '../../common/Theam';
import { SubmitButton } from '../../components/forms/SubmitButton';
import { errorToast } from '../../components/toasts';
import { extractErrorMessage } from '../../utils/helper';
import { useGetProductDetailsById } from '../../data-access/queries/restaurant';
import { formatAmount } from '../../utils/helper';
import { AuthStackParamList } from '../auth';

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'ProductDetailsScreen'
>;
const ProductDetailsScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const selectedProduct: Product = useSelector(
    (state: any) => state.restaurant.selectedProduct,
  );

  const [itemnumber, setitemnumber] = useState(1);
  const [loadingAddtoCart, setLoadingAddtoCart] = useState(false);
  const redusevalue = () => {
    if (itemnumber > 1) {
      setitemnumber(itemnumber - 1);
    }
  };
  const plushvalues = () => {
    setitemnumber(itemnumber + 1);
  };

  const { data: productDetails, isLoading } = useGetProductDetailsById(
    selectedProduct?.id,
  );

  const handleAddToBasket = async () => {
    try {
      setLoadingAddtoCart(true);
      let payload: AddToBasketPayload = {
        productId: selectedProduct?.id,
        quantity: itemnumber,
      };
      const response = await addUpdateBasketApi(payload);

      if (response?.remote === 'success') {
        navigation.navigate('MyBag');
      } else {
        if (response?.errors?.status === 401) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'SignInScreen' }],
          });
        }
        errorToast(extractErrorMessage(response));
      }
    } finally {
      setLoadingAddtoCart(false);
    }
  };

  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header
          showBack
          title={productDetails?.name || 'Product Details'}
          rightWidget={
            <TouchableOpacity onPress={() => navigation.navigate('MyBag')}>
              <SVG.ShoppingCart />
            </TouchableOpacity>
          }
        />

        <View style={styles.imagview}>
          <FastImage
            source={{ uri: productDetails?.photos?.[0]?.url }}
            style={styles.cardImage}
            contentFit="cover"
          />
        </View>
        <View style={styles.container}>
          <View style={{ width: '100%' }}>
            <CustomText style={styles.descripton}>
              {productDetails?.productDescription ||
                'No description available.'}
            </CustomText>
          </View>
        </View>
      </ScrollView>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginVertical: 25,
          }}
        >
          <CustomText style={styles.amount}>
            ${formatAmount(productDetails?.productPrice) || '0.00'}
          </CustomText>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => redusevalue()}>
              <SVG.Minusbutton />
            </TouchableOpacity>
            <CustomText style={styles.itemnumber}>{itemnumber}</CustomText>
            <TouchableOpacity onPress={() => plushvalues()}>
              <SVG.Plushbutton />
            </TouchableOpacity>
          </View>
        </View>
        <SubmitButton
          label="Add to bag"
          loading={loadingAddtoCart}
          onPress={handleAddToBasket}
        />
      </View>
      <Footer isHome />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  itemnumber: {
    fontSize: 14,
    fontFamily: Font.textSemiBolder,
    color: '#101010',
    marginHorizontal: 20,
  },
  amount: {
    color: '#CF8600',
    fontSize: 23,
    fontFamily: Font.textNormal,
  },
  descripton: {
    color: '#101010',
    fontFamily: Font.textNormal,
    fontSize: 14,
    lineHeight: 18,
  },
  imagview: {
    height: 250,
    width: '100%',
  },
  cardImage: {
    height: '100%',
    width: '100%',
  },
  addressText: {
    fontSize: 15,
    color: '#797D82',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontFamily: Font.textSemiBolder,
    fontSize: 20,
    color: 'black',
  },
  container: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ProductDetailsScreen;
