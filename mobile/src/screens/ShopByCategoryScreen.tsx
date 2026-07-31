import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import type { ProductCategory } from '@ecomm/shared/api.types';
import { Screen } from '@/components/layout/Screen';
import { QueryState } from '@/components/QueryState';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useCart } from '@/hooks/useCart';
import { useRefreshControl } from '@/hooks/useRefreshControl';
import { useCategoryChildren, useRootProductCategories } from '@/hooks/useCatalog';
import { getCategoryImage, getCategoryImageForId } from '@/lib/catalog';
import type { CategoriesStackParamList, RootStackParamList, RootTabParamList } from '@/navigation/types';
import { colors, type } from '@/theme/styles';

const SIDEBAR_RATIO = 0.22;
const SIDEBAR_MAX = 104;
const SIDEBAR_PAD = 10;
const CONTENT_PAD = 18;
const GRID_GAP = 14;
const GRID_COLS = 3;

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<CategoriesStackParamList, 'ShopByCategory'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;
type Route = RouteProp<CategoriesStackParamList, 'ShopByCategory'>;

function useLayoutMetrics() {
  const { width } = useWindowDimensions();
  const sidebarWidth = Math.min(SIDEBAR_MAX, Math.round(width * SIDEBAR_RATIO));
  const contentWidth = width - sidebarWidth;
  const tileSize = Math.floor(
    (contentWidth - CONTENT_PAD * 2 - GRID_GAP * (GRID_COLS - 1)) / GRID_COLS -5
  );
  const sidebarThumb = sidebarWidth - SIDEBAR_PAD * 2;
  return { sidebarWidth, tileSize, sidebarThumb };
}

const SidebarDepartmentItem = memo(function SidebarDepartmentItem({
  department,
  active,
  sidebarWidth,
  sidebarThumb,
  onPress,
}: {
  department: ProductCategory;
  active: boolean;
  sidebarWidth: number;
  sidebarThumb: number;
  onPress: () => void;
}) {
  const imageUri = getCategoryImageForId(department, department.id);

  return (
    <Pressable
      style={[
        styles.sidebarItem,
        { width: sidebarWidth },
        active && styles.sidebarItemActive,
      ]}
      onPress={onPress}
    >
      {active ? <View style={styles.sidebarActiveBar} /> : null}
      <View
        collapsable={false}
        style={[
          styles.sidebarThumbWrap,
          { width: sidebarThumb, height: sidebarThumb },
          active && styles.sidebarThumbWrapActive,
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={{
            width: sidebarThumb - 2,
            height: sidebarThumb - 2,
            borderRadius: 9,
          }}
          contentFit="cover"
          transition={0}
        />
      </View>
      <Text
        style={[styles.sidebarLabel, active && styles.sidebarLabelActive]}
        numberOfLines={2}
      >
        {department.name}
      </Text>
    </Pressable>
  );
});

export function ShopByCategoryScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { sidebarWidth, tileSize, sidebarThumb } = useLayoutMetrics();
  const { isAuthenticated } = useAuthSession();
  const categoriesQuery = useRootProductCategories();
  const cartQuery = useCart(isAuthenticated);
  const { refreshControl } = useRefreshControl(categoriesQuery);
  const departments = categoriesQuery.data ?? [];
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.id === selectedDepartmentId) ?? null,
    [departments, selectedDepartmentId]
  );

  useEffect(() => {
    if (!departments.length) return;
    const preferredId = route.params?.departmentId;
    const preferred = preferredId
      ? departments.find((department) => department.id === preferredId)
      : null;
    setSelectedDepartmentId(preferred?.id ?? departments[0].id);
  }, [departments, route.params?.departmentId]);

  const cartCount =
    cartQuery.data?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  const openListing = useCallback(
    (category: ProductCategory, department: ProductCategory) => {
      const title =
        category.kind === 'brand'
          ? `${category.name}`
          : `${department.name} ${category.name}`;
      navigation.navigate('CategoryProducts', {
        departmentId: department.id,
        categoryId: category.id,
        title,
        searchHint: title,
      });
    },
    [navigation]
  );

  return (
    <Screen edges={['top', 'left', 'right']} style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.canGoBack() && navigation.goBack()}
          style={styles.headerBack}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.secondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Categories</Text>
        <View style={styles.headerActions}>
          <Pressable
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('Account', { screen: 'Wishlist' })}
          >
            <Ionicons name="heart-outline" size={22} color={colors.secondary} />
          </Pressable>
          <Pressable style={styles.headerIconBtn} onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="bag-outline" size={22} color={colors.secondary} />
            {cartCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <QueryState
        isLoading={categoriesQuery.isLoading}
        isError={categoriesQuery.isError}
        error={categoriesQuery.error}
        isEmpty={!categoriesQuery.isLoading && departments.length === 0}
        emptyMessage="No categories yet"
      >
        <View style={styles.body}>
          <View style={[styles.sidebarColumn, { width: sidebarWidth }]}>
            <FlatList
              data={departments}
              keyExtractor={(department) => department.id}
              extraData={selectedDepartmentId}
              style={styles.sidebar}
              contentContainerStyle={[styles.sidebarContent, { width: sidebarWidth }]}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={false}
              refreshControl={refreshControl}
              renderItem={({ item: department }) => (
                <SidebarDepartmentItem
                  department={department}
                  active={department.id === selectedDepartmentId}
                  sidebarWidth={sidebarWidth}
                  sidebarThumb={sidebarThumb}
                  onPress={() => setSelectedDepartmentId(department.id)}
                />
              )}
            />
          </View>

          {selectedDepartment ? (
            <DepartmentPanel
              department={selectedDepartment}
              tileSize={tileSize}
              onOpenListing={(category) => openListing(category, selectedDepartment)}
            />
          ) : null}
        </View>
      </QueryState>
    </Screen>
  );
}

function DepartmentPanel({
  department,
  tileSize,
  onOpenListing,
}: {
  department: ProductCategory;
  tileSize: number;
  onOpenListing: (category: ProductCategory) => void;
}) {
  const groupsQuery = useCategoryChildren(department.id);
  const groups = groupsQuery.data ?? [];

  const sections = useMemo(() => {
    const groupSections = groups
      .filter((item) => item.kind === 'group')
      .map((group) => ({
        id: group.id,
        title: group.name,
        items: null as ProductCategory[] | null,
        groupId: group.id,
      }));

    const directLeaves = groups.filter((item) => item.kind === 'leaf' || item.kind === 'brand');
    if (directLeaves.length) {
      return [
        { id: 'direct', title: 'Shop', items: directLeaves, groupId: null as string | null },
        ...groupSections,
      ];
    }

    return groupSections;
  }, [groups]);

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentScroll}
      showsVerticalScrollIndicator={false}
    >
      <QueryState
        isLoading={groupsQuery.isLoading}
        isError={groupsQuery.isError}
        error={groupsQuery.error}
        isEmpty={!groupsQuery.isLoading && sections.length === 0}
        emptyMessage="No sub-categories yet"
      >
        {sections.map((section) =>
          section.items ? (
            <CategorySection
              key={section.id}
              title={section.title}
              items={section.items}
              tileSize={tileSize}
              onPressItem={onOpenListing}
            />
          ) : section.groupId ? (
            <CategoryGroupSection
              key={section.id}
              title={section.title}
              groupId={section.groupId}
              tileSize={tileSize}
              onPressItem={onOpenListing}
            />
          ) : null
        )}
      </QueryState>
    </ScrollView>
  );
}

function CategoryGroupSection({
  title,
  groupId,
  tileSize,
  onPressItem,
}: {
  title: string;
  groupId: string;
  tileSize: number;
  onPressItem: (category: ProductCategory) => void;
}) {
  const childrenQuery = useCategoryChildren(groupId);
  const items = (childrenQuery.data ?? []).filter(
    (item) => item.kind === 'leaf' || item.kind === 'brand'
  );

  if (childrenQuery.isLoading) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={type.caption}>Loading…</Text>
      </View>
    );
  }

  if (!items.length) return null;

  return (
    <CategorySection title={title} items={items} tileSize={tileSize} onPressItem={onPressItem} />
  );
}

function CategorySection({
  title,
  items,
  tileSize,
  onPressItem,
}: {
  title: string;
  items: ProductCategory[];
  tileSize: number;
  onPressItem: (category: ProductCategory) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            style={[styles.tile, { width: tileSize }]}
            onPress={() => onPressItem(item)}
          >
            <Image
              source={{ uri: getCategoryImageForId(item, item.id) }}
              style={[
                styles.tileImage,
                { width: tileSize, height: tileSize, borderRadius: tileSize / 2 },
              ]}
              contentFit="cover"
              transition={0}
            />
            <Text style={styles.tileLabel} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerBack: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '600',
    color: colors.secondary,
    marginRight: -40,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarColumn: {
    flexShrink: 0,
    zIndex: 2,
    elevation: 2,
  },
  sidebar: {
    flex: 1,
    backgroundColor: '#F4F4F5',
  },
  sidebarContent: {
    paddingBottom: 100,
  },
  sidebarItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: SIDEBAR_PAD,
    gap: 6,
    position: 'relative',
  },
  sidebarItemActive: {
    backgroundColor: '#FDF2F7',
  },
  sidebarActiveBar: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: colors.primary,
  },
  sidebarThumbWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sidebarThumbWrapActive: {
    borderColor: colors.primary,
  },
  sidebarLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 13,
    width: '100%',
  },
  sidebarLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contentScroll: {
    paddingHorizontal: CONTENT_PAD,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  tile: {
    alignItems: 'center',
    gap: 6,
  },
  tileImage: {
    backgroundColor: colors.gray100,
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },
});
