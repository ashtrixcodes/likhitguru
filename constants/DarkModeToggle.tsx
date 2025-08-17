// components/DarkModeToggle.js
import { Ionicons } from '@expo/vector-icons';
import { Animated, Pressable, View } from 'react-native';
import { DARK_MODE_CONFIG } from '../constants/DarkModeManager';
export const DarkModeToggle = ({ darkModeManager, styles }) => {
  return (
    <View style={styles.darkModeContainer}>
      <Pressable onPress={() => darkModeManager.toggle()} style={styles.toggleContainer}>
        <Animated.View 
          style={[
            styles.toggleBackground,
            {
              backgroundColor: darkModeManager.getToggleBackgroundColor(),
              width: DARK_MODE_CONFIG.toggle.width,
              height: DARK_MODE_CONFIG.toggle.height,
              borderRadius: DARK_MODE_CONFIG.toggle.height / 2,
            }
          ]}
        >
          {/* Moon Icon */}
          <View style={[styles.iconContainer, darkModeManager.createIconStyle('moon')]}>
            <Ionicons 
              name={DARK_MODE_CONFIG.icons.moon.name}
              size={DARK_MODE_CONFIG.icons.moon.size}
              color={darkModeManager.getIconColor('moon')} 
            />
          </View>
          
          {/* Sun Icon */}
          <View style={[styles.iconContainer, darkModeManager.createIconStyle('sun')]}>
            <Ionicons 
              name={DARK_MODE_CONFIG.icons.sun.name}
              size={DARK_MODE_CONFIG.icons.sun.size}
              color={darkModeManager.getIconColor('sun')} 
            />
          </View>
          
          {/* Moving Circle */}
          <Animated.View 
            style={[
              styles.toggleCircle,
              {
                width: DARK_MODE_CONFIG.toggle.circleSize,
                height: DARK_MODE_CONFIG.toggle.circleSize,
                borderRadius: DARK_MODE_CONFIG.toggle.circleSize / 2,
                transform: [{ translateX: darkModeManager.getToggleTranslateX() }],
                backgroundColor: darkModeManager.getCircleColor()
              }
            ]}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
};

// Example usage in your screen:
/*
import { DarkModeManager } from '../utils/DarkModeManager';
import { DarkModeToggle } from '../components/DarkModeToggle';

// In your component:
const darkModeManager = useRef(new DarkModeManager()).current;
const [isDarkMode, setIsDarkMode] = useState(false);

useEffect(() => {
  const removeListener = darkModeManager.addListener(setIsDarkMode);
  return removeListener;
}, []);

// In your WebView:
<WebView
  ref={(ref) => darkModeManager.setWebViewRef({ current: ref })}
  onLoadEnd={() => darkModeManager.applyOnLoad()}
  // ... other props
/>

// In your header:
headerRight: () => (
  <DarkModeToggle darkModeManager={darkModeManager} styles={styles} />
)
*/