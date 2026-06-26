import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useTheme } from '@/context/ThemeContext';
import type { AppTheme } from '@/constants/theme';
import { useSidebar } from './SidebarContext';

interface CategoryItemData {
  id: string;
  name: string;
  icon: string;
  route?: any;
  subItems?: SubItem[];
}

interface SubItem {
  id: string;
  name: string;
  icon: string;
  route: any;
}

export default function SidebarOverlay() {
  const { sidebarVisible, setSidebarVisible } = useSidebar();
  const { theme } = useTheme();
  const s = useMemo(() => createStyles(theme), [theme]);

  const onClose = () => setSidebarVisible(false);
  const router = useRouter();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // Define all categories and their sub-items
  const categories: CategoryItemData[] = [
    {
      id: 'lekhit-exam',
      name: 'Lekhit Exam',
      icon: 'car-outline',
      subItems: [
        { id: 'car', name: 'Car', icon: 'car-outline', route: '/chooseCategory/fourWheeler' },
        { id: 'bike', name: 'Bike', icon: 'bicycle-outline', route: '/chooseCategory/twoWheeler' },
        { id: 'others', name: 'Others', icon: 'ellipsis-horizontal-outline', route: '/chooseCategory/others' },
      ],
    },
    {
      id: 'quiz',
      name: 'Quiz',
      icon: 'help-circle-outline',
      subItems: [
        { id: 'sign-test', name: 'Sign Test', icon: 'traffic-light-outline', route: '/quiz/signTest' },
        { id: 'eye-test', name: 'Eye Test', icon: 'eye-outline', route: '/quiz/eyeTest' },
      ],
    },
    {
      id: 'practice-more',
      name: 'Practice More',
      icon: 'library-outline',
      subItems: [
        { id: 'informative-sign', name: 'Informative Sign', icon: 'information-circle-outline', route: '/practiceMore/informativeSign' },
        { id: 'restrictive-sign', name: 'Restrictive Sign', icon: 'ban-outline', route: '/practiceMore/restrictiveSign' },
        { id: 'number-sign', name: 'Number Sign', icon: 'hash-outline', route: '/practiceMore/numberSign' },
        { id: 'exam-test', name: 'Exam Test', icon: 'document-text-outline', route: '/practiceMore/examTest' },
      ],
    },
    {
      id: 'others',
      name: 'Others',
      icon: 'ellipsis-horizontal-outline',
      subItems: [
        { id: 'license-form', name: 'License Form', icon: 'document-outline', route: '/others/licenseForm' },
        { id: 'license-print-check', name: 'License Print Check', icon: 'print-outline', route: '/others/licensePrintCheck' },
        { id: 'traffic-fines', name: 'Traffic Fines', icon: 'warning-outline', route: '/others/trafficFines' },
        { id: 'more-info', name: 'More Info', icon: 'information-circle-outline', route: '/others/moreInfo' },
      ],
    },
    {
      id: 'daily-quiz',
      name: 'Daily Quiz',
      icon: 'calendar-outline',
      route: '/(tabs)/dailyQuiz',
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: 'person-outline',
      route: '/(tabs)/profile',
    },
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleItemPress = (route: any) => {
    router.push(route as any);
    onClose();
  };

  useEffect(() => {
    if (sidebarVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 350,
          delay: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [sidebarVisible]);

  if (!sidebarVisible) return null;

  const CategoryItemComponent = ({ category }: { category: CategoryItemData }) => (
    <View style={s.categoryContainer}>
      <TouchableOpacity
        style={s.categoryHeader}
        onPress={() => category.subItems ? toggleCategory(category.id) : handleItemPress(category.route)}
      >
        <View style={s.categoryIconContainer}>
          <Ionicons name={category.icon as any} size={24} color={theme.colors.sidebarTextSecondary} />
        </View>
        <Text style={s.categoryLabel}>{category.name}</Text>
        {category.subItems && (
          <Ionicons
            name={expandedCategories.includes(category.id) ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.sidebarTextSecondary}
            style={s.expandIcon}
          />
        )}
      </TouchableOpacity>

      {category.subItems && expandedCategories.includes(category.id) && (
        <View style={s.subItemsContainer}>
          {category.subItems.map((subItem) => (
            <TouchableOpacity
              key={subItem.id}
              style={s.subItem}
              onPress={() => handleItemPress(subItem.route)}
            >
              <View style={s.subItemIconContainer}>
                <Ionicons name={subItem.icon as any} size={20} color={theme.colors.sidebarTextSecondary} />
              </View>
              <Text style={s.subItemLabel}>{subItem.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={s.sidebarOverlay}>
      {/* Animated backdrop */}
      <Animated.View
        style={[
          s.sidebarBackdrop,
          { opacity: backdropOpacity }
        ]}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      {/* Animated sidebar */}
      <Animated.View
        style={[
          s.sidebarDrawer,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <Animated.View style={[s.sidebarContent, { opacity: contentOpacity }]}>
          <View style={s.sidebarHeader}>
            <View style={s.avatarContainer}>
              <Image source={require('@/assets/images/profile.png')} style={s.avatar} />
            </View>
            <View>
              <Text style={s.sidebarName}>Quick View</Text>
              <Text style={s.sidebarSubtitle}>Navigate to any section</Text>
            </View>
          </View>

          <ScrollView style={s.categoriesContainer} showsVerticalScrollIndicator={false}>
            {categories.map((category) => (
              <CategoryItemComponent key={category.id} category={category} />
            ))}
          </ScrollView>

          <View style={s.footerSpace} />
          <Text style={s.copy}>© Lekhit Guru 2025</Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, isDark } = theme;

  return StyleSheet.create({
    sidebarOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      zIndex: 9999,
    },
    sidebarDrawer: {
      width: 300,
      backgroundColor: colors.sidebarBackground,
      paddingTop: 60,
      paddingHorizontal: 20,
      shadowColor: colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 10,
      overflow: 'hidden',
      zIndex: 9999,
      ...(isDark && {
        borderRightWidth: 1,
        borderRightColor: colors.border,
      }),
    },
    sidebarContent: {
      flex: 1,
    },
    sidebarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      marginBottom: 32,
      paddingVertical: 8,
    },
    sidebarName: {
      fontSize: 18,
      color: colors.sidebarText,
      fontWeight: '600',
      lineHeight: 24,
      marginLeft: 10,
    },
    sidebarSubtitle: {
      fontSize: 14,
      color: colors.sidebarTextSecondary,
      marginTop: 2,
      marginLeft: 10,
      lineHeight: 18,
    },
    sidebarBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: colors.modalOverlay,
      zIndex: 9998,
    },
    categoriesContainer: {
      flex: 1,
    },
    categoryContainer: {
      marginBottom: 8,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderRadius: 8,
      backgroundColor: colors.sidebarCategoryBg,
    },
    categoryIconContainer: {
      width: 24,
      alignItems: 'center',
      marginRight: 15,
    },
    categoryLabel: {
      flex: 1,
      fontSize: 16,
      color: colors.sidebarText,
      fontWeight: '600',
    },
    expandIcon: {
      marginLeft: 'auto',
    },
    subItemsContainer: {
      marginLeft: 20,
      marginTop: 8,
      backgroundColor: colors.sidebarSubItemBg,
      borderRadius: 8,
      paddingVertical: 8,
    },
    subItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    subItemIconContainer: {
      width: 20,
      alignItems: 'center',
      marginRight: 15,
    },
    subItemLabel: {
      fontSize: 14,
      color: isDark ? colors.sidebarTextSecondary : '#374151',
      fontWeight: '500',
    },
    footerSpace: {
      marginTop: 20,
      height: 60,
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
    },
    copy: {
      textAlign: 'center',
      color: colors.textTertiary,
      fontSize: 12,
      paddingVertical: 12,
    },
  });
}
