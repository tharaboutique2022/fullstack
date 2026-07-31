import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout } from '@/theme/styles';

interface ScreenProps extends ViewProps {
  children: ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export function Screen({ children, edges = ['top'], style, ...props }: ScreenProps) {
  return (
    <SafeAreaView edges={edges} style={[layout.screen, style]} {...props}>
      {children}
    </SafeAreaView>
  );
}

export function ScreenContent({ children, style, ...props }: ViewProps) {
  return (
    <View style={[layout.screenContent, style]} {...props}>
      {children}
    </View>
  );
}

export const screenStyles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 88,
    gap: 16,
  },
  scrollContentTight: {
    paddingBottom: 100,
    gap: 16,
  },
  px: { paddingHorizontal: 16 },
  noPx: { paddingHorizontal: 0 },
});
