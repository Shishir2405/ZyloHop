import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
  Animated,
  Pressable,
  LayoutChangeEvent,
} from 'react-native';
import CustomText from './CustomText';
import { Font } from './Theam';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Category,
  GetAllCategoriesResponse,
  Product,
} from '../api/types/foodFlowTypes';
import { errorToast } from '../components/toasts';
import { getAllCategoryProductsApi } from '../api/foodFlowApis';
import { useDispatch, useSelector } from 'react-redux';
import EmptyComponent from './EmptyComponent';
import { storeSelectedProduct } from '../Redux/Reducer/restaurantReducer';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../screens/auth';
import { Image as FastImage } from 'expo-image';
import { storeIsLoading } from '../Redux/Reducer/loadingRedux';
import { ProductSkeleton } from './Skeleton/ProductSkeleton';
import { useGetAllProductByCategoryId } from '../data-access/queries/restaurant';
import LottieView from 'lottie-react-native';

const HEADER_HEIGHT = 250;

// Define Navigation Stack Type (Modify according to your navigation setup)
type RootStackParamList = {
  ProductDetailsScreen: undefined;
};

interface CustomTabProps {
  restaurantCategories: Category[];
}

interface TabAContentProps {
  id: string;
  onPress: () => void;
}

type NavigationProps = StackNavigationProp<
  AuthStackParamList,
  'ProductDetailsScreen'
>;

interface ProductRowProps {
  item: Product;
  onPress: () => void;
}

const ProductRow: React.FC<ProductRowProps> = ({ item, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.92,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(opacity, {
        toValue: 1,
        friction: 7,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[styles.tabContent, { transform: [{ scale }], opacity }]}
      >
        <View style={{ borderWidth: 0, height: 100, flexDirection: 'row' }}>
          <FastImage
            source={{ uri: item?.photos?.[0]?.url }}
            style={styles.cardImage}
            contentFit="cover"
          />
          <View style={{ flex: 3, margin: 10 }}>
            <CustomText
              style={{ fontFamily: Font.textSemiBolder, color: 'black' }}
            >
              {item.name}
            </CustomText>
            <CustomText
              style={{ fontFamily: Font.textNormal, fontSize: 12 }}
            >
              {item.commission} {item.foodType}
            </CustomText>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CustomText
              style={{
                fontSize: 13,
                color: 'black',
                fontFamily: Font.textSemiBolder,
              }}
            >
              ${item.productPrice}
            </CustomText>
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const TabAContent: React.FC<TabAContentProps> = ({ id, onPress }) => {
  const dispatch = useDispatch();

  const navigation = useNavigation<NavigationProps>();

  const selectedProduct: Product = useSelector(
    (state: any) => state.restaurant.selectedProduct,
  );

  const {
    data: productList,
    refetch: refetchProducts,
    isLoading,
  } = useGetAllProductByCategoryId(id);

  useEffect(() => {
    refetchProducts();
    return () => {};
  }, [id]);

  return (
    <View>
      {productList?.length === 0 || (!productList && isLoading) ? (
        <FlatList
          scrollEnabled={false}
          data={[1, 2, 3, 4, 5]}
          keyExtractor={(item, index) => index.toString()}
          renderItem={() => <ProductSkeleton />}
        />
      ) : (
        <FlatList
          scrollEnabled={false}
          data={productList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }: { item: Product }) => (
            <ProductRow
              item={item}
              onPress={() => {
                dispatch(
                  storeSelectedProduct({
                    ...selectedProduct,
                    id: item.id,
                  }),
                );
                navigation.navigate('ProductDetailsScreen');
              }}
            />
          )}
          ListEmptyComponent={
            <View style={{ padding: 16, alignItems: 'center' }}>
              <LottieView
                source={require('../assets/no_Data_found_lottie.json')}
                autoPlay
                loop
                style={{ width: 260, height: 260, marginBottom: 16 }}
              />
            </View>
          }
        />
      )}
    </View>
  );
};

interface TabLayout {
  x: number;
  width: number;
}

const CustomTab: React.FC<CustomTabProps> = ({ restaurantCategories }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [tabLayouts, setTabLayouts] = useState<Record<number, TabLayout>>({});

  const indicatorTranslateX = useRef(new Animated.Value(0)).current;
  const [indicatorWidth, setIndicatorWidth] = useState(0);

  // Define tab structure
  interface TabItem {
    id: string;
    name: string;
  }

  const tabs: TabItem[] = restaurantCategories?.map(item => ({
    id: item.id,
    name: item.categoryName,
  }));

  const handleTabLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setTabLayouts(prev => {
      const existing = prev[index];
      if (existing && existing.x === x && existing.width === width) {
        return prev;
      }
      return { ...prev, [index]: { x, width } };
    });
  };

  useEffect(() => {
    const layout = tabLayouts[activeTab];
    if (!layout) return;
    setIndicatorWidth(layout.width);
    Animated.spring(indicatorTranslateX, {
      toValue: layout.x,
      friction: 8,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabLayouts, indicatorTranslateX]);

  return (
    <View style={styles.container}>
      {tabs?.length == 0 && (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <EmptyComponent
            text={'No categories available for this restaurant!!!'}
          />
        </View>
      )}
      {/* Tab Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScrollContainer}
      >
        <View style={styles.tabRow}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tabButton}
              onLayout={handleTabLayout(index)}
              onPress={() => setActiveTab(index)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === index && styles.activeTabText,
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
          {tabs?.length > 0 && indicatorWidth > 0 && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.indicator,
                {
                  width: indicatorWidth,
                  transform: [{ translateX: indicatorTranslateX }],
                },
              ]}
            />
          )}
        </View>
      </ScrollView>

      {/* Tab Content */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {tabs?.length > 0 && (
          <TabAContent
            key={activeTab}
            id={tabs[activeTab].id}
            onPress={() => {
            }}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabScrollContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  tabRow: {
    flexDirection: 'row',
    position: 'relative',
  },
  tabButton: {
    paddingHorizontal: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 10,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
    backgroundColor: 'black',
  },
  tabText: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  activeTabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },
  contentContainer: {},
  tabContent: {
    flex: 1,
    marginVertical: 5,
  },
  cardImage: {
    width: 107,
    height: 100,
  },
});

export default CustomTab;
