import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EXAM_DATE_STORAGE_KEY, ExamDateRecord } from '@/components/ExamCountdownBanner';

const { SharedGroupBridge, ExamWidgetModule } = NativeModules;

/**
 * Saves exam countdown record to local AsyncStorage and syncs to native iOS & Android Home Screen Widgets
 */
export async function syncExamToNativeWidget(examRecord: ExamDateRecord | null): Promise<void> {
  try {
    if (examRecord) {
      const jsonStr = JSON.stringify(examRecord);
      console.log('[WidgetBridge] Saving exam data:', jsonStr);
      await AsyncStorage.setItem(EXAM_DATE_STORAGE_KEY, jsonStr);
      console.log('[WidgetBridge] AsyncStorage saved OK');

      if (Platform.OS === 'ios') {
        console.log('[WidgetBridge] Platform is iOS');
        console.log('[WidgetBridge] SharedGroupBridge module:', SharedGroupBridge ? 'EXISTS' : 'UNDEFINED');
        console.log('[WidgetBridge] saveExamData method:', SharedGroupBridge?.saveExamData ? 'EXISTS' : 'UNDEFINED');

        if (SharedGroupBridge?.saveExamData) {
          console.log('[WidgetBridge] Calling SharedGroupBridge.saveExamData...');
          const result = await SharedGroupBridge.saveExamData(jsonStr);
          console.log('[WidgetBridge] Native bridge result:', result);
        } else {
          console.warn('[WidgetBridge] SharedGroupBridge native module NOT available! Widget will NOT update.');
          console.warn('[WidgetBridge] Available NativeModules:', Object.keys(NativeModules).filter(k => k.includes('Shared') || k.includes('Bridge') || k.includes('Widget')));
        }
      } else if (Platform.OS === 'android' && ExamWidgetModule?.saveExamData) {
        await ExamWidgetModule.saveExamData(jsonStr);
      }
    } else {
      await AsyncStorage.removeItem(EXAM_DATE_STORAGE_KEY);

      if (Platform.OS === 'ios' && SharedGroupBridge?.saveExamData) {
        await SharedGroupBridge.saveExamData('');
      } else if (Platform.OS === 'android' && ExamWidgetModule?.saveExamData) {
        await ExamWidgetModule.saveExamData('');
      }
    }
  } catch (error) {
    console.error('[WidgetBridge] FAILED to sync exam record to native widget:', error);
  }
}

/**
 * Manually requests native Widget reload (WidgetKit on iOS, AppWidgetManager on Android)
 */
export async function reloadNativeWidgets(): Promise<void> {
  try {
    if (Platform.OS === 'ios' && SharedGroupBridge?.reloadWidgets) {
      await SharedGroupBridge.reloadWidgets();
    } else if (Platform.OS === 'android' && ExamWidgetModule?.reloadWidgets) {
      await ExamWidgetModule.reloadWidgets();
    }
  } catch (error) {
    console.warn('Failed to reload native widgets:', error);
  }
}
