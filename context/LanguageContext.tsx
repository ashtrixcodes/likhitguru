import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = '@lekhitguru/app-language';

export type AppLanguage = 'np' | 'en';

interface LanguageContextValue {
  language: AppLanguage;
  isNepali: boolean;
  setLanguage: (lang: AppLanguage) => void;
  toggleLanguage: () => void;
  fontFamily: string | undefined;
  fontFamilyBold: string | undefined;
}

const defaultLanguageContext: LanguageContextValue = {
  language: 'np',
  isNepali: true,
  setLanguage: () => {},
  toggleLanguage: () => {},
  fontFamily: 'Aakriti',
  fontFamilyBold: 'AakritiBold',
};

const LanguageContext = createContext<LanguageContextValue>(defaultLanguageContext);

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  return ctx || defaultLanguageContext;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<AppLanguage>('np');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === 'np' || stored === 'en') {
          setLanguageState(stored);
        }
      } catch (err) {
        console.warn('Failed to load language preference:', err);
      }
    })();
  }, []);

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    AsyncStorage.setItem(STORAGE_KEY, lang).catch((err) => {
      console.warn('Failed to save language preference:', err);
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === 'np' ? 'en' : 'np';
      AsyncStorage.setItem(STORAGE_KEY, next).catch((err) => {
        console.warn('Failed to save language preference:', err);
      });
      return next;
    });
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isNepali: language === 'np',
      setLanguage,
      toggleLanguage,
      fontFamily: language === 'np' ? 'Aakriti' : undefined,
      fontFamilyBold: language === 'np' ? 'AakritiBold' : undefined,
    }),
    [language, setLanguage, toggleLanguage]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
