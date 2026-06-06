import React, { useRef, useState } from 'react';
import { FlatList, StatusBar, View, Text, Keyboard, Alert } from 'react-native';
import OrderReceiptModal, {
  OrderType,
} from '../../../components/file-save-download/OrderReceiptModal';
import OrderCard, {
  OrderCardPropsType,
} from '../../../components/file-save-download/OrderCard';
import RectangleSkeletonLoader from '../../../components/common/RectangleSkeletonLoader';
import FromToDatePicker from '../../../components/common/FromToDatePicker';
import Container, { ToastRef } from '../../../components/common/Container';
import { requestGallerySavePermission } from '../../../utils/permissions';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { openSettings, RESULTS } from 'react-native-permissions';
import { fetchOrders } from '../../../store/slices/ordersSlice';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot, { captureRef } from 'react-native-view-shot';
import HeaderBar from '../../../components/common/HeaderBar';
import SearchSvg from '../../../assets/svgs/file-search.svg';
import SearchBar from '../../../components/common/SearchBar';
import { moderateScale } from 'react-native-size-matters';
import NoDataSvg from '../../../assets/svgs/no-data.svg';
import { delay } from '../../../utils/helper-functions';
import { useAppDispatch } from '../../../store/hooks';
import Colors from '../../../constants/Colors';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import styles from './styles';

type ViewShotRef = React.ElementRef<typeof ViewShot>;

type FetchOrderParams = {
  numberOfRecords: number;
  page: number;
  fromDate?: string;
  toDate?: string;
  orderId?: string;
  productName?: string;
};

/**
 * Renders a search icon and a text describing how to search for orders.
 * @return {JSX.Element} Initial content to be rendered when the component first mounts.
 */
const renderInitialContent = () => {
  return (
    <View style={styles.initialContentContainer}>
      <SearchSvg width={150} height={150} />
      <Text style={styles.initialContentText}>
        Search by date range, order ID, or product name to view your orders.
      </Text>
    </View>
  );
};

/**
 * Renders a 'no data' content when no orders are found for the given search criteria.
 * @return {JSX.Element} A 'no data' content to be rendered when no orders are found.
 */
const renderNoDataContent = () => {
  return (
    <View style={styles.noDataContentContainer}>
      <NoDataSvg width={140} height={140} />
      <Text style={styles.noDataContentText}>
        No orders found for this search criteria.
      </Text>
    </View>
  );
};

const FileSaveAndDownloadScreen = () => {
  const dispatch = useAppDispatch();

  // const { showToast } = useToast();

  const containerRef = useRef<ToastRef>(null);
  const flatListRef = useRef<FlatList>(null);
  const receiptRef = useRef<ViewShotRef>(null);

  const [showSkeletonLoader, setShowSkeletonLoader] = useState(false);
  const [showFooterLoader, setShowFooterLoader] = useState(false);

  const [fromDate, setFromDate] = useState<Date | null>(new Date());
  const [toDate, setToDate] = useState<Date | null>(new Date());
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);

  const [searchText, setSearchText] = useState('');

  const [orders, setOrders] = useState([]);
  const [isInitialState, setIsInitialState] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [searchInitiatedBy, setSearchInitiatedBy] = useState<
    'date' | 'searchText'
  >('date');

  /**
   * Handles searching for orders by either date range or search text.
   * @param {string} initiatedBy - 'date' or 'searchText', indicating the type of search.
   * @param {boolean} isLoadMore - true if the search is a load more, false otherwise.
   */
  const handleOrderSearch = async (
    initiatedBy: 'date' | 'searchText',
    isLoadMore: boolean = false,
  ) => {
    Keyboard.dismiss();
    setSearchInitiatedBy(initiatedBy);
    if (isInitialState) setIsInitialState(false);
    if (isLoadMore) setShowFooterLoader(true);
    else setShowSkeletonLoader(true);
    await delay(3000);
    flatListRef.current?.scrollToOffset({
      offset: 0,
      animated: false,
    });
    let params: FetchOrderParams = { numberOfRecords: 5, page: 1 };
    if (isLoadMore) params.page = page + 1;
    else params.page = 1;
    if (initiatedBy === 'date') {
      setSearchText('');
      params.fromDate = fromDate ? fromDate.toISOString() : undefined;
      params.toDate = toDate ? toDate.toISOString() : undefined;
    }
    if (initiatedBy === 'searchText') {
      if (searchText.trim().length === 0) return;
      setFromDate(new Date());
      setToDate(new Date());
      if (searchText.trim().startsWith('ORD'))
        params.orderId = searchText.trim();
      else params.productName = searchText.trim();
    }

    try {
      const response = await dispatch(fetchOrders(params)).unwrap();
      containerRef.current?.hideToast();

      if (response.isSuccess) {
        const responseData = response?.responseData || [];
        let updatedOrders = [];
        if (isLoadMore) updatedOrders = [...orders, ...responseData.data];
        else updatedOrders = responseData.data;
        setOrders(updatedOrders);
        setHasMoreOrders(responseData.pagination.hasMore);
        setPage(responseData.pagination.page);
      } else {
        setOrders(isLoadMore ? orders : []);
      }
    } catch (error) {
      console.log('fetch orders by date error', error);
      setOrders(isLoadMore ? orders : []);
      setHasMoreOrders(false);
      containerRef.current?.showToast(
        (error as Error)?.message ?? 'Something went wrong',
        'error',
      );
    } finally {
      setShowSkeletonLoader(false);
      setShowFooterLoader(false);
    }
  };

  /**
   * Renders either the initial content (if isInitialState is true) or the no data content (if isInitialState is false)
   */
  const renderEmptyComponent = () => {
    if (showSkeletonLoader) return null;
    if (isInitialState) return renderInitialContent();
    return renderNoDataContent();
  };

  /**
   * Handles loading more orders when the user reaches the end of the list.
   * This function will only work if there are more orders to be loaded and if the footer loader is not currently showing.
   * It will call `handleOrderSearch` with the `searchInitiatedBy` parameter set to the current search type
   * and `isLoadMore` set to true.
   */
  const handleLoadMore = () => {
    if (!hasMoreOrders || showFooterLoader || isInitialState) return;
    containerRef.current?.showToast('Loading...', 'default');
    handleOrderSearch(searchInitiatedBy, true);
  };

  /**
   * Renders a footer loader when the user reaches the end of the list and
   * there are more orders to be loaded. If there are no more orders to be loaded
   * or if the footer loader is not currently showing, this function will return null.
   * The footer loader is a RectangleSkeletonLoader with a height of 232.
   */
  const renderFooter = () => {
    if (!showFooterLoader) return null;
    return (
      <View style={styles.footerLoaderContainer}>
        <RectangleSkeletonLoader height={moderateScale(232)} />
      </View>
    );
  };

  const renderItem = ({ item }: { item: OrderCardPropsType }) => (
    <OrderCard
      orderId={item.orderId}
      orderDate={item.orderDate.split('T')[0]}
      customerName={item.customerName}
      customerMobile={item.customerMobile}
      productName={item.productName}
      totalAmount={item.totalAmount}
      currStatus={item.currStatus}
      btnLoading={false}
      isSelected={false}
      onViewPress={() => {
        setSelectedOrder(item);
        setShowReceiptModal(true);
      }}
    />
  );

  const getPaddingBottom = () => {
    if (showFooterLoader) return 0;
    return moderateScale(16);
  };

  async function handleCaptureAndShareScreenShot() {
    try {
      if (!receiptRef.current) return;

      const uri = await captureRef(receiptRef.current, {
        format: 'jpg',
        quality: 1,
        result: 'tmpfile',
      });

      // 2️⃣ Create your own filename
      const fileName = `Portfolio_Receipt_${selectedOrder?.orderId}.jpg`;
      const targetPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // 3️⃣ Copy temp file → named file
      await RNFS.copyFile(uri, targetPath);

      await Share.open({
        title: 'Portfolio App',
        message: 'Order Receipt',
        url: `file://${targetPath}`,
        type: 'image/jpeg',
        saveToFiles: true,
      });
    } catch (error: any) {
      const message =
        error?.error || error?.message || error?.toString?.() || '';

      if (
        typeof message === 'string' &&
        message.toLowerCase().includes('cancel')
      )
        return;

      console.log('Error sharing screenshot:', error);
    }
  }

  const handleDownloadPress = async (): Promise<boolean> => {
    try {
      if (!receiptRef.current || !selectedOrder?.orderId) {
        return false;
      }

      // 1️⃣ Ask / check gallery permission
      const permissionStatus = await requestGallerySavePermission();
      console.log('permissionStatus: ', permissionStatus);

      if (
        permissionStatus !== RESULTS.GRANTED &&
        permissionStatus !== RESULTS.LIMITED
      ) {
        if (permissionStatus === RESULTS.BLOCKED) {
          Alert.alert(
            'Permission Required',
            'Gallery permission is required to save the receipt. Please enable it from settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Open Settings',
                onPress: () => openSettings(),
              },
            ],
          );
        } else {
          containerRef.current?.showToast('Gallery permission denied', 'error');
        }
        return false; // ❗ permission failed
      }

      // 2️⃣ Capture receipt view
      const uri = await captureRef(receiptRef.current, {
        format: 'jpg',
        quality: 1,
        result: 'tmpfile',
      });

      // 3️⃣ Create stable filename
      const fileName = `Portfolio_Receipt_${selectedOrder.orderId}.jpg`;
      const targetPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // 4️⃣ Copy temp file → named file
      await RNFS.copyFile(uri, targetPath);

      // 5️⃣ Save to gallery
      await CameraRoll.saveToCameraRoll(`file://${targetPath}`, 'photo');

      // ✅ SUCCESS
      return true;
    } catch (error: any) {
      const message =
        error?.error || error?.message || error?.toString?.() || '';

      // User cancelled → treat as failure but silent
      if (
        typeof message === 'string' &&
        message.toLowerCase().includes('cancel')
      ) {
        return false;
      }

      console.log('Download error:', error);
      containerRef.current?.showToast('Failed to save receipt', 'error');

      return false;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.bg_600} barStyle="dark-content" />
      <HeaderBar title="File Save & Download" bgColor={Colors.bg_600} />
      <Container ref={containerRef} containerStyle={styles.container}>
        <View style={styles.contentContainer}>
          {showReceiptModal && selectedOrder && (
            <OrderReceiptModal
              receiptRef={receiptRef}
              showReceiptModal={showReceiptModal}
              orderId={selectedOrder?.orderId}
              orderDate={selectedOrder?.orderDate?.split('T')[0]}
              productName={selectedOrder?.productName}
              customerName={selectedOrder?.customerName}
              customerMobile={selectedOrder?.customerMobile}
              customerEmail={selectedOrder?.customerEmail}
              totalAmount={selectedOrder?.totalAmount}
              currStatus={selectedOrder?.currStatus}
              onClosePress={() => setShowReceiptModal(false)}
              onSharePress={handleCaptureAndShareScreenShot}
              onDownloadPress={handleDownloadPress}
              onBackButtonPress={() => setShowReceiptModal(false)}
            />
          )}
          <FromToDatePicker
            fromDate={fromDate}
            toDate={toDate}
            openFromDate={openFromDate}
            openToDate={openToDate}
            setFromDate={setFromDate}
            setToDate={setToDate}
            setOpenFromDate={setOpenFromDate}
            setOpenToDate={setOpenToDate}
            onSearchPress={() => handleOrderSearch('date')}
          />
          <SearchBar
            placeholder="Search By Product Name or Order Id"
            value={searchText}
            onChangeText={setSearchText}
            onSearchPress={() => handleOrderSearch('searchText')}
          />
          {showSkeletonLoader && (
            <View style={styles.skeletonLoadersContainer}>
              <RectangleSkeletonLoader height={moderateScale(232)} />
              <RectangleSkeletonLoader height={moderateScale(232)} />
              <RectangleSkeletonLoader height={moderateScale(232)} />
            </View>
          )}
          <FlatList
            ref={flatListRef}
            data={orders}
            contentContainerStyle={[
              styles.ordersContainer,
              { paddingBottom: getPaddingBottom() },
            ]}
            keyExtractor={(item: OrderCardPropsType) => item.orderId}
            ListEmptyComponent={renderEmptyComponent}
            onEndReachedThreshold={0.5}
            onEndReached={handleLoadMore}
            ListFooterComponent={renderFooter}
            renderItem={renderItem}
          />
        </View>
      </Container>
    </SafeAreaView>
  );
};

export default FileSaveAndDownloadScreen;
