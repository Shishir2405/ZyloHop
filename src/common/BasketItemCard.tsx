import {StyleSheet, TouchableOpacity, View} from 'react-native';
import CustomText from './CustomText';
import {SVG} from './SvgHelper';
import { Image as FastImage } from 'expo-image';
import {
  addUpdateBasketApi,
  getUserBasketApi,
  removeBasketItemApi,
} from '../api/orderFoodApis';
import {errorToast, successToast} from '../components/toasts';
import {AddToBasketPayload, BasketItem} from '../api/types/orderFlowTypes';
import {Font} from './Theam';
import {formatAmount, extractErrorMessage} from '../utils/helper';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {useState} from 'react';
import {AuthStackParamList} from '../screens/auth';
import {StackNavigationProp} from '@react-navigation/stack';

type NavigationProps = StackNavigationProp<AuthStackParamList, 'MyBag'>;
const BasketItemCard = ({
  item,
  setBasketItems,
}: {
  item: BasketItem;
  setBasketItems: (items: BasketItem[]) => void;
}) => {
  const navigation = useNavigation<NavigationProps>();
  const dispatch = useDispatch();
  const [itemnumber, setitemnumber] = useState(item.quantity || 1);

  const handleUnauthorized = () => {
    navigation.reset({index: 0, routes: [{name: 'SignInScreen'}]});
  };

  const handleRemoveBasketItemApi = async (id: string) => {
    const response = await removeBasketItemApi(id);
    if (response?.remote === 'success') {
      handleGetUserBasketApi();
      successToast('Item removed from basket successfully');
      return;
    }
    if (response?.errors?.status === 401) handleUnauthorized();
    errorToast(extractErrorMessage(response));
  };

  const handleAddToBasket = async (itemnumber: number, productId: string) => {
    const payload: AddToBasketPayload = {productId, quantity: itemnumber};
    const response = await addUpdateBasketApi(payload);
    if (response?.remote === 'success') {
      navigation.navigate('MyBag');
      return;
    }
    if (response?.errors?.status === 401) handleUnauthorized();
    errorToast(extractErrorMessage(response));
  };

  const handleGetUserBasketApi = async () => {
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
            : require('../assets/image/other/Pizza.png'),
      }));
      setBasketItems(list);
      return;
    }
    if (response?.errors?.status === 401) handleUnauthorized();
    errorToast(extractErrorMessage(response));
  };

  return (
    <View style={styles.cardContainer}>
      <View style={styles.imagesize}>
        <FastImage source={{uri: item.image}} style={styles.imagestyle} />
      </View>
      <View style={{flex: 1}}>
        <View style={[styles.rocenter, {justifyContent: 'space-between'}]}>
          <CustomText style={styles.titletext}>{item.productName}</CustomText>
          <TouchableOpacity
            onPress={() => handleRemoveBasketItemApi(item.basketItemId)}>
            <SVG.Blackcross />
          </TouchableOpacity>
        </View>

        <View style={styles.rocenter}>
          <CustomText style={styles.sizetext}>Size: {'Large'}</CustomText>
          <CustomText style={styles.sizetext}>
            Variant: {item.productName}
          </CustomText>
        </View>

        <View style={[styles.rocenter, {justifyContent: 'space-between'}]}>
          <CustomText style={styles.amounttext}>
            ${formatAmount(item.price)}
          </CustomText>
          <View style={styles.rocenter}>
            <TouchableOpacity
              onPress={() => {
                const itemcount = itemnumber - 1;
                handleAddToBasket(itemcount, item.productId);
                setitemnumber(itemcount);
              }}>
              <SVG.Minuscircul />
            </TouchableOpacity>
            <CustomText style={[styles.amounttext, {marginHorizontal: 15}]}>
              {itemnumber}
            </CustomText>
            <TouchableOpacity
              onPress={() => {
                const itemcount = itemnumber + 1;
                handleAddToBasket(itemcount, item.productId);
                setitemnumber(itemcount);
              }}>
              <SVG.circulplus />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
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
  amounttext: {color: '#222222', fontSize: 15, fontFamily: Font.textSemiBolder},
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
  rocenter: {flexDirection: 'row', alignItems: 'center', marginVertical: 5},
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
});

export default BasketItemCard;
