export type UserRole = 'user' | 'admin';
export type StockStatus = 'in_stock' | 'out_of_stock';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'online';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type NotificationType = 'order' | 'booking' | 'payment' | 'general';
export type ReviewTargetType = 'product' | 'service';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BAD_REQUEST'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_ERROR';

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta & {
    pagination?: PaginationMeta;
  };
}

export interface ApiErrorBody {
  code: ErrorCode;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
  meta?: ApiMeta;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface AuthPayload {
  user: User;
  token: string;
}

export type ProductCategoryKind = 'department' | 'group' | 'brand' | 'leaf';

export interface ProductCategory {
  id: string;
  parentId: string | null;
  kind: ProductCategoryKind;
  name: string;
  slug: string;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  parent?: ProductCategory | null;
  children?: ProductCategory[];
}

export interface Product {
  id: string;
  categoryId: string;
  brand: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  priceFrom: string;
  imageUrl: string | null;
  stockStatus: StockStatus;
  isActive: boolean;
  hasVariants: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ProductCategory;
  options?: ProductOption[];
  variants?: ProductVariant[];
}

export interface ProductOption {
  id: string;
  productId: string;
  name: string;
  position: number;
  values: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  optionId: string;
  value: string;
  imageUrl: string | null;
  position: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string | null;
  price: string;
  stockStatus: StockStatus;
  imageUrl: string | null;
  isActive: boolean;
  title: string;
  optionValueIds: string[];
  selections: Array<{
    optionId: string;
    optionName: string;
    valueId: string;
    value: string;
    imageUrl: string | null;
  }>;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackageImage {
  id: string;
  packageId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface ServiceProviderImage {
  id: string;
  providerId: string;
  imageUrl: string;
  sortOrder: number;
}

export interface ServiceProviderTimeSlot {
  id: string;
  providerId: string;
  slotTime: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ServicePackage {
  id: string;
  providerId: string;
  name: string;
  description: string | null;
  priceMin: string;
  priceMax: string | null;
  durationMinutes: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  gallery?: ServicePackageImage[];
}

export interface ServiceProvider {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  imageUrl: string | null;
  location: string | null;
  distanceKm: string | null;
  rating: string | null;
  reviewCount: number;
  audienceTag: string | null;
  tags: string[];
  priceFrom: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  category?: ServiceCategory;
  packages?: ServicePackage[];
  gallery?: ServiceProviderImage[];
  timeSlots?: ServiceProviderTimeSlot[];
}

/** @deprecated Use ServiceProvider */
export type Service = ServiceProvider;

export interface ServicePackageInput {
  name: string;
  description?: string | null;
  priceMin: number;
  priceMax?: number | null;
  durationMinutes?: number;
  sortOrder?: number;
  isActive?: boolean;
  gallery?: string[];
}

export interface ServiceProviderInput {
  categoryId: string;
  name: string;
  slug?: string;
  tagline?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  location?: string | null;
  distanceKm?: number | null;
  rating?: number | null;
  reviewCount?: number;
  audienceTag?: string | null;
  tags?: string[];
  priceFrom: number;
  isActive?: boolean;
  sortOrder?: number;
  gallery?: string[];
  timeSlots?: string[];
  packages?: ServicePackageInput[];
}

export interface CreateBookingInput {
  providerId: string;
  packageId: string;
  bookingDate: string;
  bookingTime: string;
  contactPhone: string;
  alternatePhone?: string;
  notes?: string;
}

export interface BookingPackageSummary {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
}

export interface BookingProviderSummary {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  location: string | null;
}

export interface Booking {
  id: string;
  userId: string;
  bookingNumber: string;
  providerId: string;
  packageId: string;
  bookingDate: string;
  bookingTime: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTxnId: string | null;
  paymentRef: string | null;
  paidAt: string | null;
  status: BookingStatus;
  contactPhone: string | null;
  alternatePhone: string | null;
  cancelReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  provider?: BookingProviderSummary;
  package?: BookingPackageSummary;
  user?: UserSummary;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  otp: string;
  password: string;
}

export interface ForgotPasswordResponse {
  message: string;
  devOtp?: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

export interface CategoryInput {
  name: string;
  slug?: string;
  parentId?: string | null;
  kind?: ProductCategoryKind;
  subtitle?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface ProductInput {
  categoryId: string;
  brand?: string | null;
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  stockStatus?: StockStatus;
  isActive?: boolean;
  hasVariants?: boolean;
  options?: ProductOptionInput[];
  variants?: ProductVariantInput[];
}

export interface ProductOptionValueInput {
  value: string;
  imageUrl?: string | null;
}

export interface ProductOptionInput {
  name: string;
  values: ProductOptionValueInput[];
}

export interface ProductVariantInput {
  optionValues: string[];
  price: number;
  stockStatus?: StockStatus;
  sku?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface ServiceInput {
  categoryId: string;
  name: string;
  slug?: string;
  description?: string | null;
  price: number;
  durationMinutes?: number;
  imageUrl?: string | null;
  isActive?: boolean;
}

/** @deprecated Use ServiceProviderInput */
export type LegacyServiceInput = ServiceInput;

export interface HealthData {
  status: 'ok';
}

export interface CartProductSummary {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  hasVariants: boolean;
}

export interface CartVariantSummary {
  id: string;
  title: string;
  price: string;
  stockStatus: StockStatus;
  imageUrl: string | null;
  sku: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  isAvailable: boolean;
  imageUrl: string | null;
  product: CartProductSummary;
  variant: CartVariantSummary | null;
}

export interface Cart {
  id: string;
  userId: string;
  itemCount: number;
  subtotal: string;
  items: CartItem[];
  updatedAt: string;
}

export interface AddCartItemInput {
  productId: string;
  variantId?: string | null;
  quantity?: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  priceAtOrder: string;
  productName: string;
  variantTitle: string | null;
  imageUrl?: string | null;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTxnId: string | null;
  paymentRef: string | null;
  paidAt: string | null;
  couponCode: string | null;
  trackingId: string | null;
  totalAmount: string;
  subtotal: string;
  platformFee: string;
  shippingCharge: string;
  discount: string;
  shippingAddress: string | null;
  contactPhone: string | null;
  cancelReason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  user?: UserSummary;
}

export interface CheckoutQuote {
  subtotal: string;
  platformFee: string;
  shippingCharge: string;
  discount: string;
  totalAmount: string;
  couponCode?: string | null;
}

export interface CreateOrderInput {
  notes?: string;
  shippingOption?: 'standard';
  addressId?: string;
  contactPhone: string;
  paymentMethod: 'online';
  couponCode?: string;
}

export interface PaymentInitResponse {
  gateway: 'razorpay';
  entityType: 'order' | 'booking';
  entityId: string;
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: 'INR';
  name: string;
  description: string;
  callbackUrl: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
}

export interface VerifyPaymentInput {
  orderId?: string;
  bookingId?: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface CreateOrderResponse {
  order: Order;
  payment: PaymentInitResponse | null;
  paymentError?: string;
}

export interface CancelOrderInput {
  reason: string;
}

export interface CancelBookingInput {
  reason: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  trackingId?: string | null;
}

export interface UpdateBookingStatusInput {
  status: BookingStatus;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string | null;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  label?: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  targetType: ReviewTargetType;
  productId: string | null;
  providerId: string | null;
  orderId: string | null;
  bookingId: string | null;
  rating: number;
  comment: string | null;
  authorName: string;
  createdAt: string;
}

export interface CreateProductReviewInput {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
}

export interface CreateServiceReviewInput {
  providerId: string;
  bookingId: string;
  rating: number;
  comment?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  createdAt: string;
  product: Product;
}

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: 'percent' | 'fixed';
  discountValue: string;
  minOrderAmount: string;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidationResult {
  code: string;
  description: string | null;
  discountType: 'percent' | 'fixed';
  discountValue: string;
  discountAmount: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orderCount: number;
  bookingCount: number;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface RescheduleBookingInput {
  bookingDate: string;
  bookingTime: string;
}

export interface UpdateBookingPaymentInput {
  paymentStatus: PaymentStatus;
  totalAmount?: number;
  notes?: string | null;
}

export interface CreateBookingResponse {
  booking: Booking;
  payment: PaymentInitResponse | null;
  paymentError?: string;
}

export interface MergeCartInput {
  items: Array<{ productId: string; variantId?: string | null; quantity: number }>;
}
