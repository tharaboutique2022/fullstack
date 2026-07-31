import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { Booking, Order, PaymentInitResponse } from '@ecomm/shared/api.types';
import { paymentsApi } from '@/api/payments';
import { Screen } from '@/components/layout/Screen';
import type { AccountStackParamList, CartStackParamList, RootTabParamList } from '@/navigation/types';
import {
  useInitiatePaymentForEntity,
  useSyncPaymentForEntity,
  useVerifyPayment,
} from '@/hooks/usePayments';
import { getErrorMessage } from '@/lib/apiClient';
import { colors, type } from '@/theme/styles';

type CartNav = NativeStackNavigationProp<CartStackParamList, 'Payment'>;
type AccountNav = NativeStackNavigationProp<AccountStackParamList, 'Payment'>;
type CartRoute = RouteProp<CartStackParamList, 'Payment'>;
type AccountRoute = RouteProp<AccountStackParamList, 'Payment'>;

function buildRazorpayCheckoutHtml(checkout: PaymentInitResponse): string {
  const checkoutOptions = {
    key: checkout.keyId,
    amount: checkout.amount,
    currency: checkout.currency,
    name: checkout.name,
    description: checkout.description,
    order_id: checkout.razorpayOrderId,
    prefill: checkout.prefill,
    theme: { color: '#7C2D3E' },
    webview_intent: true,
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true,
    },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>Pay</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #faf7f5;
    }
  </style>
</head>
<body>
  <script>
    function postToApp(payload) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

    function openRazorpay() {
      try {
        var options = ${JSON.stringify(checkoutOptions)};
        options.handler = function (response) {
          postToApp({
            type: 'success',
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature
          });
        };
        options.modal = {
          ondismiss: function () {
            postToApp({ type: 'dismissed' });
          }
        };

        var rzp = new Razorpay(options);
        rzp.on('payment.failed', function (response) {
          postToApp({
            type: 'failed',
            description: (response.error && response.error.description) || 'Payment failed'
          });
        });
        rzp.open();
        postToApp({ type: 'opened' });
      } catch (error) {
        postToApp({
          type: 'failed',
          description: error && error.message ? error.message : 'Could not open Razorpay'
        });
      }
    }

    var script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = openRazorpay;
    script.onerror = function () {
      postToApp({ type: 'failed', description: 'Could not load Razorpay checkout.' });
    };
    document.body.appendChild(script);
  </script>
</body>
</html>`;
}

export function PaymentScreen() {
  const navigation = useNavigation<CartNav | AccountNav>();
  const route = useRoute<CartRoute | AccountRoute>();
  const { displayNumber, checkout: initialCheckout, origin } = route.params;
  const entityType = initialCheckout.entityType;
  const entityId = initialCheckout.entityId;
  const verifyPayment = useVerifyPayment();
  const syncPayment = useSyncPaymentForEntity(entityType);
  const initiatePayment = useInitiatePaymentForEntity(entityType);
  const busyRef = useRef(false);

  const [checkout, setCheckout] = useState(initialCheckout);
  const [webViewKey, setWebViewKey] = useState(0);
  const [showWebView, setShowWebView] = useState(true);
  const [opening, setOpening] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const checkoutHtml = useMemo(() => buildRazorpayCheckoutHtml(checkout), [checkout]);
  const entityLabel = entityType === 'booking' ? 'Booking' : 'Order';

  const handleShouldStartLoadWithRequest = useCallback((request: { url: string }) => {
    const { url } = request;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return true;
    }

    void Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        void Linking.openURL(url);
      }
    });

    return false;
  }, []);

  const finishPayment = useCallback(
    (status: 'success' | 'failure', resolvedEntityId: string) => {
      if (entityType === 'booking') {
        if (origin === 'account' || origin === 'services') {
          (navigation as AccountNav).navigate('BookingDetail', {
            bookingId: resolvedEntityId,
            paymentResult: status,
          });
          return;
        }

        (
          navigation.getParent() as BottomTabNavigationProp<RootTabParamList> | undefined
        )?.navigate('Account', {
          screen: 'BookingDetail',
          params: { bookingId: resolvedEntityId, paymentResult: status },
        });
        return;
      }

      if (origin === 'account') {
        (navigation as AccountNav).navigate('OrderDetail', {
          orderId: resolvedEntityId,
          paymentResult: status,
        });
        return;
      }

      (
        navigation.getParent() as BottomTabNavigationProp<RootTabParamList> | undefined
      )?.navigate('Account', {
        screen: 'OrderDetail',
        params: { orderId: resolvedEntityId, paymentResult: status },
      });
    },
    [entityType, navigation, origin]
  );

  const confirmPaidOnServer = useCallback(async () => {
    const result = await syncPayment.mutateAsync(entityId);
    const paid =
      entityType === 'booking'
        ? (result as Booking).paymentStatus === 'paid'
        : (result as Order).paymentStatus === 'paid';

    if (paid) {
      finishPayment('success', entityId);
      return true;
    }
    return false;
  }, [entityId, entityType, finishPayment, syncPayment]);

  const showPaymentError = useCallback((message: string) => {
    setShowWebView(false);
    setOpening(false);
    setConfirming(false);
    setErrorMessage(message);
    busyRef.current = false;
  }, []);

  const handleDismissOrFailure = useCallback(
    async (message?: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setConfirming(true);
      setOpening(false);

      try {
        const paid = await confirmPaidOnServer();
        if (paid) return;

        showPaymentError(
          message ?? 'Payment was not completed. Check your details and try again.'
        );
      } catch (error) {
        showPaymentError(getErrorMessage(error));
      } finally {
        setConfirming(false);
      }
    },
    [confirmPaidOnServer, showPaymentError]
  );

  const handleSuccess = useCallback(
    async (payload: {
      razorpayPaymentId: string;
      razorpayOrderId: string;
      razorpaySignature: string;
    }) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setConfirming(true);
      setOpening(false);

      try {
        await verifyPayment.mutateAsync({
          ...(entityType === 'booking'
            ? { bookingId: entityId }
            : { orderId: entityId }),
          razorpayOrderId: payload.razorpayOrderId,
          razorpayPaymentId: payload.razorpayPaymentId,
          razorpaySignature: payload.razorpaySignature,
        });
        finishPayment('success', entityId);
      } catch {
        const paid = await confirmPaidOnServer();
        if (!paid) {
          showPaymentError('Payment was received but could not be confirmed. Tap Try again.');
        }
      } finally {
        setConfirming(false);
      }
    },
    [confirmPaidOnServer, entityId, entityType, finishPayment, showPaymentError, verifyPayment]
  );

  const handleWebViewMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let payload: {
        type: string;
        razorpayPaymentId?: string;
        razorpayOrderId?: string;
        razorpaySignature?: string;
        description?: string;
      };

      try {
        payload = JSON.parse(event.nativeEvent.data);
      } catch {
        return;
      }

      if (payload.type === 'opened') {
        setOpening(false);
        return;
      }

      if (payload.type === 'dismissed') {
        setTimeout(() => {
          void handleDismissOrFailure('Payment was cancelled.');
        }, 800);
        return;
      }

      if (payload.type === 'failed') {
        void handleDismissOrFailure(
          payload.description ?? 'Payment failed. Please try again.'
        );
        return;
      }

      if (payload.type !== 'success') return;
      if (!payload.razorpayPaymentId || !payload.razorpayOrderId || !payload.razorpaySignature) {
        void handleDismissOrFailure();
        return;
      }

      void handleSuccess({
        razorpayPaymentId: payload.razorpayPaymentId,
        razorpayOrderId: payload.razorpayOrderId,
        razorpaySignature: payload.razorpaySignature,
      });
    },
    [handleDismissOrFailure, handleSuccess]
  );

  async function handleRetry() {
    try {
      setRetrying(true);
      setErrorMessage(null);
      const nextCheckout = await initiatePayment.mutateAsync(entityId);
      busyRef.current = false;
      setCheckout(nextCheckout);
      setShowWebView(true);
      setOpening(true);
      setWebViewKey((value) => value + 1);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setRetrying(false);
    }
  }

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="close" size={22} color={colors.secondary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={type.h3}>Pay securely</Text>
          <Text style={type.caption}>
            {entityLabel} {displayNumber}
          </Text>
          {checkout.keyId.startsWith('rzp_test_') ? (
            <Text style={styles.testHint}>
              Test: pick UPI app (GPay/PhonePe) or Card 4111…1111
            </Text>
          ) : null}
        </View>
        <View style={styles.iconBtn} />
      </View>

      <View style={styles.body}>
        {showWebView && !errorMessage ? (
          <WebView
            key={webViewKey}
            source={{ html: checkoutHtml, baseUrl: 'https://razorpay.com' }}
            onMessage={handleWebViewMessage}
            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
            onOpenWindow={(event) => {
              const targetUrl = event.nativeEvent.targetUrl;
              if (targetUrl) {
                void Linking.openURL(targetUrl);
              }
            }}
            javaScriptEnabled
            domStorageEnabled
            thirdPartyCookiesEnabled
            sharedCookiesEnabled
            originWhitelist={['*']}
            setSupportMultipleWindows={Platform.OS === 'android'}
            style={styles.webView}
          />
        ) : null}

        {errorMessage ? (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
            <Text style={styles.errorTitle}>Payment not completed</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable
              style={[styles.primaryBtn, retrying && styles.btnDisabled]}
              onPress={() => void handleRetry()}
              disabled={retrying}
            >
              {retrying ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Try again</Text>
              )}
            </Pressable>
            <Pressable style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryBtnText}>
                Back to {entityType === 'booking' ? 'booking' : 'order'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {opening && !errorMessage ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={type.caption}>Opening Razorpay…</Text>
          </View>
        ) : null}

        {confirming ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={type.body}>Confirming payment…</Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: { flex: 1, alignItems: 'center', gap: 2 },
  testHint: { ...type.caption, textAlign: 'center', color: colors.secondary },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, backgroundColor: colors.background },
  webView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: colors.background,
  },
  errorCard: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
    backgroundColor: colors.background,
  },
  errorTitle: { ...type.h3, textAlign: 'center' },
  errorText: { ...type.body, textAlign: 'center', color: colors.danger },
  primaryBtn: {
    marginTop: 8,
    minWidth: 180,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  primaryBtnText: { color: colors.white, fontWeight: '600' },
  secondaryBtn: {
    minWidth: 180,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { ...type.link },
  btnDisabled: { opacity: 0.6 },
});
