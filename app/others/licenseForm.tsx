import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import type { WebView as WebViewType } from 'react-native-webview';
import { WebView } from 'react-native-webview';

type IconType = keyof typeof DARK_MODE_CONFIG.icons;

const DARK_MODE_CONFIG = {
  colors: {
    dark: {
      background: '#2a2a2a',
      surface: '#3a3a3a',
      button: '#4a4a4a',
      text: '#e0e0e0',
      border: '#555555',
      link: '#66b3ff',
      header: '#434D57',
    },
    light: {
      background: '#ffffff',
      surface: '#f5f5f5',
      button: '#ffffff',
      text: '#000000',
      border: '#cccccc',
      link: '#0066cc',
      header: '#434D57',
    }
  },
  toggle: {
    width: 54,
    height: 28,
    circleSize: 22,
    animationDuration: 300,
    positions: {
      left: 3,
      right: 27,
    },
    backgroundColor: {
      light: '#e0e0e0',
      dark: '#434D57',
    }
  },
  icons: {
    sun: {
      name: 'sunny',
      size: 16,
      position: 'right',
      offset: 6,
      colors: {
        active: '#FFA500',
        inactive: '#666',
      }
    },
    moon: {
      name: 'moon',
      size: 14,
      position: 'left',
      offset: 6,
      colors: {
        active: '#FFF',
        inactive: '#666',
      }
    }
  },
  webview: {
    url: 'https://applydlnew.dotm.gov.np/login',
    selectors: {
      basic: ['html', 'body', 'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'form', 'table', 'td', 'th'],
      inputs: ['input', 'select', 'textarea'],
      buttons: ['button'],
      links: ['a'],
      classes: ['.form-control', '.btn', '.btn-primary', '.btn-secondary', '.card', '.modal', '.navbar', '.table', '.table-striped', '.table-bordered', '.modal-content', '.dropdown-menu', '.link']
    },
    effects: {
      images: {
        opacity: 0.9,
        brightness: 0.9,
        contrast: 1.1
      },
      forceRerender: true
    }
  }
};

export default function licenseFormScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const webViewRef = useRef<WebViewType>(null);

  const toggleDarkMode = () => {
    const toValue = isDarkMode ? 0 : 1;

    Animated.timing(animatedValue, {
      toValue,
      duration: DARK_MODE_CONFIG.toggle.animationDuration,
      useNativeDriver: false,
    }).start();

    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (webViewRef.current) {
      const jsCode = generateDarkModeJS(newDarkMode);
      webViewRef.current.postMessage(JSON.stringify({
        type: 'toggleDarkMode',
        isDark: newDarkMode
      }));
      webViewRef.current.injectJavaScript(jsCode);
    }
  };

  const generateCSSRules = (selectors: string[], styles: Record<string, string>) => {
    return selectors.map(selector => `
      ${selector} {
        ${Object.entries(styles).map(([prop, value]) =>
          `${prop}: ${value} !important;`
        ).join(' ')}
      }
    `).join('');
  };

  const generateDarkModeJS = (isDark: boolean): string => {
    if (!isDark) {
      return `
        (function() {
          try {
            const darkModeStyle = document.getElementById('darkModeStyle');
            if (darkModeStyle) {
              darkModeStyle.remove();
            }
            ${DARK_MODE_CONFIG.webview.effects.forceRerender ? `
              document.body.style.display = 'none';
              document.body.offsetHeight;
              document.body.style.display = 'block';
            ` : ''}
          } catch (error) {
            console.error('Error removing dark mode:', error);
          }
        })();
        true;
      `;
    }

    const colors = DARK_MODE_CONFIG.colors.dark;
    const { selectors, effects } = DARK_MODE_CONFIG.webview;

    const basicRules = generateCSSRules(selectors.basic, {
      'background-color': colors.background,
      'color': colors.text,
      'border-color': colors.border,
    });

    const inputRules = generateCSSRules(
      [...selectors.inputs, ...selectors.classes.filter(c => c.includes('form'))],
      {
        'background-color': colors.surface,
        'color': colors.text,
        'border': `1px solid ${colors.border}`,
      }
    );

    const buttonRules = generateCSSRules(
      [...selectors.buttons, ...selectors.classes.filter(c => c.includes('btn'))],
      {
        'background-color': colors.button,
        'color': colors.text,
        'border-color': colors.border,
      }
    );

    const linkRules = generateCSSRules(
      [...selectors.links, ...selectors.classes.filter(c => c.includes('link'))],
      {
        'color': colors.link,
      }
    );

    const containerRules = generateCSSRules(
      selectors.classes.filter(c => c.includes('card') || c.includes('modal') || c.includes('table')),
      {
        'background-color': colors.surface,
        'color': colors.text,
        'border-color': colors.border,
      }
    );

    const imageRules = `
      img {
        opacity: ${effects.images.opacity};
        filter: brightness(${effects.images.brightness}) contrast(${effects.images.contrast});
      }
    `;

    const overrideRules = `
      [style*="background-color: white"], 
      [style*="background-color: #fff"],
      [style*="background-color: #ffffff"] {
        background-color: ${colors.background} !important;
      }

      [style*="color: black"],
      [style*="color: #000"],
      [style*="color: #000000"] {
        color: ${colors.text} !important;
      }
    `;

    return `
      (function() {
        try {
          const existingStyle = document.getElementById('darkModeStyle');
          if (existingStyle) {
            existingStyle.remove();
          }

          const style = document.createElement('style');
          style.id = 'darkModeStyle';
          style.innerHTML = \`
            ${basicRules}
            ${inputRules}
            ${buttonRules}
            ${linkRules}
            ${containerRules}
            ${imageRules}
            ${overrideRules}
          \`;
          document.head.appendChild(style);

          ${effects.forceRerender ? `
            document.body.style.display = 'none';
            document.body.offsetHeight;
            document.body.style.display = 'block';
          ` : ''}
        } catch (error) {
          console.error('Error applying dark mode:', error);
        }
      })();
      true;
    `;
  };

  const toggleTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      DARK_MODE_CONFIG.toggle.positions.left,
      DARK_MODE_CONFIG.toggle.positions.right
    ],
  });

  const getToggleBackgroundColor = () =>
    isDarkMode ? DARK_MODE_CONFIG.toggle.backgroundColor.dark : DARK_MODE_CONFIG.toggle.backgroundColor.light;

  const getIconColor = (iconType: IconType) => {
    const icon = DARK_MODE_CONFIG.icons[iconType];
    const isActive = iconType === 'moon' ? isDarkMode : !isDarkMode;
    return isActive ? icon.colors.active : icon.colors.inactive;
  };

  const getCircleColor = () =>
    isDarkMode ? DARK_MODE_CONFIG.colors.dark.background : DARK_MODE_CONFIG.colors.light.background;

  const createIconStyle = (iconType: IconType): Record<string, number> => {
    const icon = DARK_MODE_CONFIG.icons[iconType];
    return {
      [icon.position]: icon.offset,
    };
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: "License Form",
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: DARK_MODE_CONFIG.colors.light.header,
          },
          headerTitleStyle: {
            fontSize: 20,
            color: '#FFFFFF',
          },
          headerTintColor: '#FFFFFF',
          headerLeft: () => (
            <Pressable 
            onPress={() => router.back()}
            style={styles.headerBackButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        ),
        headerRight: () => (
          <View style={styles.darkModeContainer}>
            <Pressable onPress={toggleDarkMode} style={styles.toggleContainer}>
              <Animated.View
                style={[
                  styles.toggleBackground,
                  {
                    backgroundColor: getToggleBackgroundColor(),
                    width: DARK_MODE_CONFIG.toggle.width,
                    height: DARK_MODE_CONFIG.toggle.height,
                    borderRadius: DARK_MODE_CONFIG.toggle.height / 2,
                  }
                ]}
              >
                {/* Moon Icon */}
                <View style={[styles.iconContainer, createIconStyle('moon')]}>
                  <Ionicons
                    name={DARK_MODE_CONFIG.icons.moon.name as any}
                    size={DARK_MODE_CONFIG.icons.moon.size}
                    color={getIconColor('moon')}
                  />
                </View>

                {/* Sun Icon */}
                <View style={[styles.iconContainer, createIconStyle('sun')]}>
                  <Ionicons
                    name={DARK_MODE_CONFIG.icons.sun.name as any}
                    size={DARK_MODE_CONFIG.icons.sun.size}
                    color={getIconColor('sun')}
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
                      transform: [{ translateX: toggleTranslateX }],
                      backgroundColor: getCircleColor()
                    }
                  ]}
                />
              </Animated.View>
            </Pressable>
          </View>
        ),
      }}
    />
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: DARK_MODE_CONFIG.webview.url }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        onLoadEnd={() => {
          if (isDarkMode && webViewRef.current) {
            webViewRef.current.injectJavaScript(generateDarkModeJS(true));
          }
        }}
        onMessage={(event) => {
          console.log('WebView message:', event.nativeEvent.data);
        }}
      />
    </View>
  </>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#fff',
},
webview: {
  flex: 1,
},
headerBackButton: {
  padding: 8,
  marginLeft: 10,
  borderRadius: 20,
},
darkModeContainer: {
  marginRight: 15,
  alignItems: 'center',
  justifyContent: 'center',
},
toggleContainer: {
  padding: 5,
},
toggleBackground: {
  justifyContent: 'center',
  position: 'relative',
  flexDirection: 'row',
  alignItems: 'center',
},
toggleCircle: {
  position: 'absolute',
  elevation: 3,
  marginRight: 28,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  zIndex: 2,
},
iconContainer: {
  position: 'absolute',
  width: 20,
  height: 20,
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
},
});
