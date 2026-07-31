import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { authKeys } from '@/lib/queryKeys';
import { clearToken, getToken } from '@/lib/authStorage';
import { colors } from '@/theme/styles';

const BOOTSTRAP_TIMEOUT_MS = 12000;

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        const token = await getToken();
        if (!token) return;

        const user = await Promise.race([
          authApi.me(),
          new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Auth bootstrap timed out')), BOOTSTRAP_TIMEOUT_MS);
          }),
        ]);

        if (active) {
          queryClient.setQueryData(authKeys.me, user);
        }
      } catch {
        await clearToken();
        if (active) {
          queryClient.removeQueries({ queryKey: authKeys.me });
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, [queryClient]);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
