import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const DRAWER_WIDTH = 300;

interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  route?: any; // Using any to avoid TypeScript route conflicts
  subItems?: SubItem[];
}

interface SubItem {
  id: string;
  label: string;
  icon: string;
  route: any; // Using any to avoid TypeScript route conflicts
}

export default function SideView() {
  const router = useRouter();
  const anim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  // Define all categories and their sub-items
  const categories: CategoryItem[] = [
    {
      id: 'lekhit-exam',
      label: 'Lekhit Exam',
      icon: 'car-sport-outline',
      subItems: [
        { id: 'four-wheeler', label: 'Car', icon: 'car-outline', route: '/chooseCategory/fourWheeler' },
        { id: 'two-wheeler', label: 'Bike', icon: 'bicycle-outline', route: '/chooseCategory/twoWheeler' },
        { id: 'others', label: 'Others', icon: 'ellipsis-horizontal-outline', route: '/chooseCategory/others' },
      ]
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: 'help-circle-outline',
      subItems: [
        { id: 'sign-test', label: 'Sign Test', icon: 'traffic-light-outline', route: '/quiz/signTest' },
        { id: 'eye-test', label: 'Eye Test', icon: 'eye-outline', route: '/quiz/eyeTest' },
      ]
    },
    {
      id: 'practice-more',
      label: 'Practice More',
      icon: 'library-outline',
      subItems: [
        { id: 'informative-sign', label: 'Informative', icon: 'information-circle-outline', route: '/practiceMore/informativeSign' },
        { id: 'restrictive-sign', label: 'Restrictive', icon: 'remove-circle-outline', route: '/practiceMore/restrictiveSign' },
        { id: 'number-sign', label: 'Numbers', icon: 'calculator-outline', route: '/practiceMore/numberSign' },
        { id: 'exam-test', label: 'Exam Test', icon: 'document-text-outline', route: '/practiceMore/examTest' },
      ]
    },
    {
      id: 'others',
      label: 'Others',
      icon: 'ellipsis-horizontal-outline',
      subItems: [
        { id: 'license-form', label: 'Online License Form', icon: 'document-outline', route: '/others/licenseForm' },
        { id: 'license-print-check', label: 'License Print Check', icon: 'print-outline', route: '/others/licensePrintCheck' },
        { id: 'traffic-fines', label: 'Traffic Fines Info', icon: 'warning-outline', route: '/others/trafficFines' },
        { id: 'more-info', label: 'More Info', icon: 'help-outline', route: '/others/moreInfo' },
        { id: 'nepali-calendar', label: 'Nepali Calendar', icon: 'calendar-outline', route: '/others/nepaliCalendar' },
      ]
    },
    {
      id: 'daily-quiz',
      label: 'Daily Quiz',
      icon: 'calendar-outline',
      route: '/dailyQuiz'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      route: '/profile'
    }
  ];

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const close = () => {
    Animated.timing(anim, {
      toValue: -DRAWER_WIDTH,
      duration: 200,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) router.back();
    });
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleItemPress = (route?: any) => {
    if (route) {
      router.push(route as any);
    }
    close();
  };

  const CategoryItem = ({ category }: { category: CategoryItem }) => {
    const isExpanded = expandedCategories.includes(category.id);
    const hasSubItems = category.subItems && category.subItems.length > 0;

    return (
      <View style={styles.categoryContainer}>
        <Pressable 
          style={styles.categoryHeader} 
          onPress={() => hasSubItems ? toggleCategory(category.id) : handleItemPress(category.route)}
          android_ripple={{ color: '#f0f0f0' }}
        >
          <View style={styles.categoryIconContainer}>
            <Ionicons name={category.icon as any} size={22} color="#6B7280" />
          </View>
          <Text style={styles.categoryLabel}>{category.label}</Text>
          {hasSubItems && (
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color="#6B7280" 
              style={styles.expandIcon}
            />
          )}
        </Pressable>

        {hasSubItems && isExpanded && (
          <View style={styles.subItemsContainer}>
            {category.subItems!.map((subItem) => (
              <Pressable
                key={subItem.id}
                style={styles.subItem}
                onPress={() => handleItemPress(subItem.route)}
                android_ripple={{ color: '#f0f0f0' }}
              >
                <View style={styles.subItemIconContainer}>
                  <Ionicons name={subItem.icon as any} size={18} color="#9CA3AF" />
                </View>
                <Text style={styles.subItemLabel}>{subItem.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Drawer on the left */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: anim }] }]}>
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            <Image source={require('@/assets/images/profile.png')} style={styles.avatar} />
            <View style={styles.userIconOverlay}>
              <Image 
                source={require('@/assets/images/user_icon.png')} 
                style={styles.userIconImage}
                resizeMode="contain"
              />
            </View>
          </View>
          <View>
            <Text style={styles.name}>Quick View</Text>
            <Text style={styles.subtitle}>Navigate to any section</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.categoriesContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {categories.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </ScrollView>

        <View style={styles.footerSpace} />
        <Text style={styles.copy}>© Lekhit Guru 2025</Text>
      </Animated.View>

      {/* Overlay to the right */}
      <Pressable style={styles.overlay} onPress={close} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  overlay: {
    flex: 1,
	backgroundColor: 'transparent',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
    paddingVertical: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userIconImage: {
    width: 50,
    height: 50,
  },
  name: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
    lineHeight: 24,
    marginTop: 10,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 10,
    lineHeight: 18,
  },
  categoriesContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
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
    backgroundColor: '#f9fafb',
  },
  categoryIconContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 15,
  },
  categoryLabel: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  expandIcon: {
    marginLeft: 'auto',
  },
  subItemsContainer: {
    marginLeft: 20,
    marginTop: 8,
    backgroundColor: '#f3f4f6',
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
    color: '#374151',
    fontWeight: '500',
  },
  footerSpace: {
    marginTop: 20,
    height: 60,
  },
  copy: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    paddingVertical: 12,
  },
});