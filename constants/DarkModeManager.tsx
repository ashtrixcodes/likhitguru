// utils/DarkModeManager.js
import { Animated } from 'react-native';

export const DARK_MODE_CONFIG = {
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

export class DarkModeManager {
  constructor(initialState = false) {
    this.isDarkMode = initialState;
    this.animatedValue = new Animated.Value(initialState ? 1 : 0);
    this.webViewRef = null;
    this.listeners = [];
  }

  // Set WebView reference
  setWebViewRef(ref) {
    this.webViewRef = ref;
  }

  // Add listener for state changes
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.isDarkMode));
  }

  // Toggle dark mode
  toggle() {
    const toValue = this.isDarkMode ? 0 : 1;
    
    Animated.timing(this.animatedValue, {
      toValue,
      duration: DARK_MODE_CONFIG.toggle.animationDuration,
      useNativeDriver: false,
    }).start();
    
    this.isDarkMode = !this.isDarkMode;
    
    // Apply to WebView if available
    if (this.webViewRef?.current) {
      const jsCode = this.generateDarkModeJS(this.isDarkMode);
      this.webViewRef.current.postMessage(JSON.stringify({ 
        type: 'toggleDarkMode', 
        isDark: this.isDarkMode 
      }));
      this.webViewRef.current.injectJavaScript(jsCode);
    }

    // Notify listeners
    this.notifyListeners();
  }

  // Apply dark mode when WebView loads
  applyOnLoad() {
    if (this.isDarkMode && this.webViewRef?.current) {
      this.webViewRef.current.injectJavaScript(this.generateDarkModeJS(true));
    }
  }

  // Generate CSS rules
  generateCSSRules(selectors, styles) {
    return selectors.map(selector => `
      ${selector} {
        ${Object.entries(styles).map(([prop, value]) => 
          `${prop}: ${value} !important;`
        ).join(' ')}
      }
    `).join('');
  }

  // Generate dark mode JavaScript
  generateDarkModeJS(isDark) {
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

    const basicRules = this.generateCSSRules(selectors.basic, {
      'background-color': colors.background,
      'color': colors.text,
      'border-color': colors.border,
    });

    const inputRules = this.generateCSSRules(
      [...selectors.inputs, ...selectors.classes.filter(c => c.includes('form'))],
      {
        'background-color': colors.surface,
        'color': colors.text,
        'border': `1px solid ${colors.border}`,
      }
    );

    const buttonRules = this.generateCSSRules(
      [...selectors.buttons, ...selectors.classes.filter(c => c.includes('btn'))],
      {
        'background-color': colors.button,
        'color': colors.text,
        'border-color': colors.border,
      }
    );

    const linkRules = this.generateCSSRules(
      [...selectors.links, ...selectors.classes.filter(c => c.includes('link'))],
      {
        'color': colors.link,
      }
    );

    const containerRules = this.generateCSSRules(
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
          
          console.log('Dark mode applied successfully');
        } catch (error) {
          console.error('Error applying dark mode:', error);
        }
      })();
      true;
    `;
  }

  // Get toggle animation value
  getToggleTranslateX() {
    return this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [
        DARK_MODE_CONFIG.toggle.positions.left,
        DARK_MODE_CONFIG.toggle.positions.right
      ],
    });
  }

  // Helper methods for styling
  getToggleBackgroundColor() {
    return this.isDarkMode ? 
      DARK_MODE_CONFIG.toggle.backgroundColor.dark : 
      DARK_MODE_CONFIG.toggle.backgroundColor.light;
  }

  getIconColor(iconType) {
    const icon = DARK_MODE_CONFIG.icons[iconType];
    const isActive = iconType === 'moon' ? this.isDarkMode : !this.isDarkMode;
    return isActive ? icon.colors.active : icon.colors.inactive;
  }

  getCircleColor() {
    return this.isDarkMode ? 
      DARK_MODE_CONFIG.colors.dark.background : 
      DARK_MODE_CONFIG.colors.light.background;
  }

  createIconStyle(iconType) {
    const icon = DARK_MODE_CONFIG.icons[iconType];
    return {
      [icon.position]: icon.offset,
    };
  }

  // Get current colors
  getCurrentColors() {
    return this.isDarkMode ? DARK_MODE_CONFIG.colors.dark : DARK_MODE_CONFIG.colors.light;
  }
}

