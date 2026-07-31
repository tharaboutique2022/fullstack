import type { Address, PaymentInitResponse } from '@ecomm/shared/api.types';
import type { NavigatorScreenParams } from '@react-navigation/native';

export type PaymentScreenParams = {
  checkout: PaymentInitResponse;
  displayNumber: string;
  origin: 'cart' | 'account' | 'services';
};

export type CartStackParamList = {
  CartHome: undefined;
  Checkout: undefined;
  Payment: PaymentScreenParams;
};

export type ServicesStackParamList = {
  ServiceCategories: undefined;
  ServiceProviders: { categoryId: string; categoryName: string };
  ServiceProviderDetail: { providerId: string };
  BookingCheckout: {
    providerId: string;
    packageId: string;
    packageName: string;
    price: string;
  };
};

export type CategoriesStackParamList = {
  ShopByCategory: { departmentId?: string } | undefined;
  CategoryBrowse: { departmentId: string; departmentName: string };
  CategoryProducts: {
    departmentId: string;
    categoryId: string;
    title: string;
    searchHint?: string;
  };
  ProductDetail: { productId: string };
};

export type AccountStackParamList = {
  AccountHome: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email: string };
  HelpSupport: undefined;
  EditProfile: undefined;
  Addresses: undefined;
  AddressForm: { addressId?: string; address?: Address };
  ServicesBooked: undefined;
  MyOrders: undefined;
  OrderDetail: { orderId: string; paymentResult?: 'success' | 'failure' };
  Payment: PaymentScreenParams;
  BookingDetail: { bookingId: string; paymentResult?: 'success' | 'failure' };
  Wishlist: undefined;
  Notifications: undefined;
  Policy: undefined;
  ChangePassword: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<RootTabParamList> | undefined;
  Search: { initialQuery?: string } | undefined;
};

export type RootTabParamList = {
  Home: undefined;
  Categories: NavigatorScreenParams<CategoriesStackParamList> | undefined;
  Services: NavigatorScreenParams<ServicesStackParamList> | undefined;
  Cart: NavigatorScreenParams<CartStackParamList> | undefined;
  Account: NavigatorScreenParams<AccountStackParamList> | undefined;
};
