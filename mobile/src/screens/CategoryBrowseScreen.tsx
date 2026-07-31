import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { ProductCategory } from '@ecomm/shared/api.types';
import { Screen, ScreenContent } from '@/components/layout/Screen';
import { QueryState } from '@/components/QueryState';
import { useCategoryChildren } from '@/hooks/useCatalog';
import type { CategoriesStackParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

type Nav = NativeStackNavigationProp<CategoriesStackParamList, 'CategoryBrowse'>;
type Route = RouteProp<CategoriesStackParamList, 'CategoryBrowse'>;

export function CategoryBrowseScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const groupsQuery = useCategoryChildren(route.params.departmentId);
  const groups = groupsQuery.data ?? [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const expandedGroup = useMemo(
    () => groups.find((group) => group.id === expandedId) ?? null,
    [expandedId, groups]
  );
  const childrenQuery = useCategoryChildren(expandedGroup?.id ?? '');
  const children = expandedGroup ? (childrenQuery.data ?? []) : [];

  function listingTitle(category: ProductCategory): string {
    if (category.kind === 'brand') {
      return `${category.name} Shirts`;
    }
    return `${route.params.departmentName} ${category.name}`;
  }

  function openListing(category: ProductCategory) {
    if (category.kind === 'group') return;
    const title = listingTitle(category);
    navigation.navigate('CategoryProducts', {
      departmentId: route.params.departmentId,
      categoryId: category.id,
      title,
      searchHint: title,
    });
  }

  function toggleGroup(group: ProductCategory) {
    setExpandedId((current) => (current === group.id ? null : group.id));
  }

  return (
    <Screen>
      <ScreenContent>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.secondary} />
          </Pressable>
          <Text style={type.h3}>{route.params.departmentName}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <QueryState
            isLoading={groupsQuery.isLoading}
            isError={groupsQuery.isError}
            error={groupsQuery.error}
            isEmpty={!groupsQuery.isLoading && groups.length === 0}
            emptyMessage="No sub-categories yet"
          >
            {groups.map((group) => {
              const expanded = expandedId === group.id;

              return (
                <View key={group.id} style={styles.section}>
                  <Pressable
                    style={styles.groupRow}
                    onPress={() => {
                      if (group.kind === 'group') {
                        toggleGroup(group);
                        return;
                      }
                      openListing(group);
                    }}
                  >
                    <Text style={styles.groupTitle}>{group.name}</Text>
                    {group.kind === 'group' ? (
                      <Ionicons
                        name={expanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.muted}
                      />
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color={colors.mutedLight} />
                    )}
                  </Pressable>

                  {expanded && group.kind === 'group' ? (
                    <View style={styles.childList}>
                      {childrenQuery.isLoading ? (
                        <Text style={type.caption}>Loading...</Text>
                      ) : (
                        children.map((child) => (
                          <Pressable
                            key={child.id}
                            style={styles.childRow}
                            onPress={() => openListing(child)}
                          >
                            <Text style={styles.childText}>{child.name}</Text>
                          </Pressable>
                        ))
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </QueryState>
        </ScrollView>
      </ScreenContent>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scroll: { gap: 12, paddingBottom: 120 },
  section: { gap: 8 },
  groupRow: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupTitle: { fontSize: 15, fontWeight: '600', color: colors.secondary },
  childList: { gap: 8, paddingLeft: 8 },
  childRow: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#EAF3FF',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  childText: { fontSize: 14, fontWeight: '500', color: colors.secondary },
});
