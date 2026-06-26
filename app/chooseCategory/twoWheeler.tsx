import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Animated, LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { knowledgeAnswerKeyLetters, knowledgeQuestions } from '../practiceMore/knowledge';
import { actRegulationAnswerKeyIndices, actRegulationQuestions, techAndMechanicalAnswerKeyIndices, techAndMechanicalQuestions, trafficSignalKnowledgeAnswerKeyIndices, trafficSignalKnowledgeQuestions, vehiclePollutionAnswerKeyIndices, vehiclePollutionQuestions } from './constant';

import { themedHeaderOptions } from '@/constants/screenHelpers';
import type { AppTheme } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';

export default function TwoWheelerScreen() {
  // Resolve constants each render so we don't freeze empty values
  let QUESTIONS: any[] = Array.isArray(actRegulationQuestions) ? (actRegulationQuestions as any[]) : [];
  let ANSWER_KEYS: number[] = Array.isArray(actRegulationAnswerKeyIndices) ? (actRegulationAnswerKeyIndices as number[]) : [];
  let TECH_QUESTIONS: any[] = Array.isArray(techAndMechanicalQuestions) ? (techAndMechanicalQuestions as any[]) : [];
  let TECH_ANSWER_KEYS: number[] = Array.isArray(techAndMechanicalAnswerKeyIndices) ? (techAndMechanicalAnswerKeyIndices as number[]) : [];
  let POLLUTION_QUESTIONS: any[] = Array.isArray(vehiclePollutionQuestions) ? (vehiclePollutionQuestions as any[]) : [];
  let POLLUTION_ANSWER_KEYS: number[] = Array.isArray(vehiclePollutionAnswerKeyIndices) ? (vehiclePollutionAnswerKeyIndices as number[]) : [];
  let DRIVE_QUESTIONS: any[] = Array.isArray(knowledgeQuestions) ? (knowledgeQuestions as any[]) : [];
  const letterToIndex = (l: string): number => ({ a: 0, b: 1, c: 2, d: 3 } as const)[String(l).toLowerCase() as 'a' | 'b' | 'c' | 'd'] ?? 0;
  let DRIVE_ANSWER_KEYS: number[] = Array.isArray(knowledgeAnswerKeyLetters) ? (knowledgeAnswerKeyLetters as any[]).map(letterToIndex) : [];
  // Accidental awareness (Section 5)
  let ACC_QUESTIONS: any[] = [];
  let ACC_ANSWER_KEYS: number[] = [];
  let ACC_ANSWER_LETTERS: any[] = [];
  // Traffic signal knowledge (Section 6)
  let SIGNAL_QUESTIONS: any[] = Array.isArray(trafficSignalKnowledgeQuestions) ? (trafficSignalKnowledgeQuestions as any[]) : [];
  let SIGNAL_ANSWER_KEYS: number[] = Array.isArray(trafficSignalKnowledgeAnswerKeyIndices) ? (trafficSignalKnowledgeAnswerKeyIndices as number[]) : [];
  if (QUESTIONS.length === 0 || TECH_QUESTIONS.length === 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('./constant');
      if (QUESTIONS.length === 0 && Array.isArray(mod?.actRegulationQuestions)) {
        QUESTIONS = mod.actRegulationQuestions;
      }
      if (ANSWER_KEYS.length === 0 && Array.isArray(mod?.actRegulationAnswerKeyIndices)) {
        ANSWER_KEYS = mod.actRegulationAnswerKeyIndices;
      }
      const techQs = mod?.techAndMechanicalQuestions ?? mod?.techaandMechanicalQuestions;
      const techKs = mod?.techAndMechanicalAnswerKeyIndices ?? mod?.techaandMechanicalAnswerKeyIndices;
      if (TECH_QUESTIONS.length === 0 && Array.isArray(techQs)) {
        TECH_QUESTIONS = techQs;
      }
      if (TECH_ANSWER_KEYS.length === 0 && Array.isArray(techKs)) {
        TECH_ANSWER_KEYS = techKs;
      }
      if (POLLUTION_QUESTIONS.length === 0 && Array.isArray(mod?.vehiclePollutionQuestions)) {
        POLLUTION_QUESTIONS = mod.vehiclePollutionQuestions;
      }
      if (POLLUTION_ANSWER_KEYS.length === 0 && Array.isArray(mod?.vehiclePollutionAnswerKeyIndices)) {
        POLLUTION_ANSWER_KEYS = mod.vehiclePollutionAnswerKeyIndices;
      }
      // Accidental Awareness fallbacks
      if (Array.isArray(mod?.accidentalAwarenessQuestions)) {
        ACC_QUESTIONS = mod.accidentalAwarenessQuestions;
      }
      if (Array.isArray(mod?.accidentalAwarenessAnswerKeyIndices)) {
        ACC_ANSWER_KEYS = mod.accidentalAwarenessAnswerKeyIndices;
      } else if (Array.isArray(mod?.accidentalAwarenessAnswerKeyLetters)) {
        ACC_ANSWER_LETTERS = mod.accidentalAwarenessAnswerKeyLetters;
      }
    } catch { }
  }
  // Fallback dynamic import for driving knowledge if needed
  if (DRIVE_QUESTIONS.length === 0 || DRIVE_ANSWER_KEYS.length === 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod2 = require('../practiceMore/knowledge');
      if (DRIVE_QUESTIONS.length === 0 && Array.isArray(mod2?.knowledgeQuestions)) {
        DRIVE_QUESTIONS = mod2.knowledgeQuestions;
      }
      if (DRIVE_ANSWER_KEYS.length === 0 && Array.isArray(mod2?.knowledgeAnswerKeyLetters)) {
        DRIVE_ANSWER_KEYS = mod2.knowledgeAnswerKeyLetters.map((l: string) => letterToIndex(l));
      }
    } catch { }
  }
  // Ensure accidental awareness is resolved even if others were already loaded
  if (ACC_QUESTIONS.length === 0 || (ACC_ANSWER_KEYS.length === 0 && ACC_ANSWER_LETTERS.length === 0)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod3 = require('./constant');
      if (ACC_QUESTIONS.length === 0 && Array.isArray(mod3?.accidentalAwarenessQuestions)) {
        ACC_QUESTIONS = mod3.accidentalAwarenessQuestions;
      }
      if (ACC_ANSWER_KEYS.length === 0 && Array.isArray(mod3?.accidentalAwarenessAnswerKeyIndices)) {
        ACC_ANSWER_KEYS = mod3.accidentalAwarenessAnswerKeyIndices;
      }
      if (ACC_ANSWER_KEYS.length === 0 && Array.isArray(mod3?.accidentalAwarenessAnswerKeyLetters)) {
        ACC_ANSWER_LETTERS = mod3.accidentalAwarenessAnswerKeyLetters;
      }
    } catch { }
  }
  // Resolve signals if needed
  if (SIGNAL_QUESTIONS.length === 0 || SIGNAL_ANSWER_KEYS.length === 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod4 = require('./constant');
      if (SIGNAL_QUESTIONS.length === 0 && Array.isArray(mod4?.trafficSignalKnowledgeQuestions)) {
        SIGNAL_QUESTIONS = mod4.trafficSignalKnowledgeQuestions;
      }
      if (SIGNAL_ANSWER_KEYS.length === 0 && Array.isArray(mod4?.trafficSignalKnowledgeAnswerKeyIndices)) {
        SIGNAL_ANSWER_KEYS = mod4.trafficSignalKnowledgeAnswerKeyIndices;
      }
    } catch { }
  }
  // Convert accidental awareness letters to indices if provided
  if (ACC_ANSWER_KEYS.length === 0 && ACC_ANSWER_LETTERS.length > 0) {
    ACC_ANSWER_KEYS = ACC_ANSWER_LETTERS.map((l: string) => letterToIndex(l));
  }

  // Fixed sections per spec; Section 1 contains all current questions
  const sections = useMemo(() => {
    const allCount = QUESTIONS.length;
    const techCount = TECH_QUESTIONS.length;
    const accCount = ACC_QUESTIONS.length;

    // Create sections array and shuffle it randomly
    const sectionsArray = [
      {
        title: 'Section 1',
        subtitle: 'Knowledge related to vehicular act/regulation.',
        start: 0,
        end: allCount,
        originalIndex: 0,
        icon: 'document-text-outline',
      },
      {
        title: 'Section 2',
        subtitle: 'Technical or mechanical knowledge of vehicle',
        start: 0,
        end: techCount,
        originalIndex: 1,
        icon: 'build-outline',
      },
      {
        title: 'Section 3',
        subtitle: 'Conceptual knowledge related to environment pollution',
        start: 0,
        end: POLLUTION_QUESTIONS.length,
        originalIndex: 2,
        icon: 'leaf-outline',
      },
      {
        title: 'Section 4',
        subtitle: 'Knowledge related to driving',
        start: 0,
        end: DRIVE_QUESTIONS.length,
        originalIndex: 3,
        icon: 'car-outline',
      },
      {
        title: 'Section 5',
        subtitle: 'Knowledge related to accidental awareness',
        start: 0,
        end: accCount,
        originalIndex: 4,
        icon: 'medkit-outline',
      },
      {
        title: 'Section 6',
        subtitle: 'Knowledge related to traffic signals',
        start: 0,
        end: SIGNAL_QUESTIONS.length,
        originalIndex: 5,
        icon: 'alert-circle-outline',
      },
    ];

    // Fisher-Yates shuffle algorithm for random sorting
    const shuffled = [...sectionsArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Reassign section numbers starting from 1 after shuffling
    return shuffled.map((section, index) => ({
      ...section,
      title: `Section ${index + 1}`,
    }));
  }, [QUESTIONS, TECH_QUESTIONS, POLLUTION_QUESTIONS, DRIVE_QUESTIONS, ACC_QUESTIONS, SIGNAL_QUESTIONS]);

  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeSection, setActiveSection] = useState(0);
  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());
  const answerAnimMapRef = useRef<Map<number, Animated.Value>>(new Map());

  const getAnimForId = (id: number) => {
    const map = answerAnimMapRef.current;
    if (!map.has(id)) map.set(id, new Animated.Value(0));
    return map.get(id)!;
  };

  const questionsForActive = useMemo(() => {
    let dataQ: any[] = [];
    let dataA: number[] = [];
    let baseId = 0;

    // Get the original index of the active section to determine which data to load
    const activeSectionData = sections[activeSection];
    const originalIndex = activeSectionData?.originalIndex ?? 0;

    if (originalIndex === 0) {
      dataQ = QUESTIONS;
      dataA = ANSWER_KEYS;
      baseId = 0;
    } else if (originalIndex === 1) {
      dataQ = TECH_QUESTIONS;
      dataA = TECH_ANSWER_KEYS;
      baseId = 1000; // ensure unique ids across sections
    } else if (originalIndex === 2) {
      dataQ = POLLUTION_QUESTIONS;
      dataA = POLLUTION_ANSWER_KEYS;
      baseId = 2000;
    } else if (originalIndex === 3) {
      dataQ = DRIVE_QUESTIONS;
      dataA = DRIVE_ANSWER_KEYS;
      baseId = 3000;
    } else if (originalIndex === 4) {
      dataQ = ACC_QUESTIONS;
      dataA = ACC_ANSWER_KEYS;
      baseId = 4000;
    } else if (originalIndex === 5) {
      dataQ = SIGNAL_QUESTIONS;
      dataA = SIGNAL_ANSWER_KEYS;
      baseId = 5000;
    } else {
      dataQ = [];
      dataA = [];
    }
    return dataQ.map((q, idx) => {
      const key = Number.isFinite(dataA[idx]) ? Number(dataA[idx]) : 0;
      return {
        q: q?.question ?? '',
        opts: Array.isArray(q?.options) ? q.options : ['', '', '', ''],
        correctIndex: Math.max(0, Math.min(3, key)),
        id: baseId + idx,
      };
    });
  }, [activeSection, sections, QUESTIONS, ANSWER_KEYS, TECH_QUESTIONS, TECH_ANSWER_KEYS, POLLUTION_QUESTIONS, POLLUTION_ANSWER_KEYS, DRIVE_QUESTIONS, DRIVE_ANSWER_KEYS, ACC_QUESTIONS, ACC_ANSWER_KEYS, SIGNAL_QUESTIONS, SIGNAL_ANSWER_KEYS]);

  const toggleReveal = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRevealedSet(prev => {
      const next = new Set(prev);
      if (!prev.has(id)) next.add(id); else next.delete(id);
      return next;
    });
  };
  return (
    <>
      <Stack.Screen
        options={{
          title: "2-Wheeler Exam",
          ...themedHeaderOptions(theme),
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerBackButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionTabs}>
          {sections.map((sec, idx) => {
            const isActive = idx === activeSection;
            return (
              <Pressable key={idx} style={[styles.sectionCard, isActive && styles.sectionCardActive]} onPress={() => setActiveSection(idx)}>
                <View style={styles.sectionRow}>
                  <View style={styles.sectionIcon}><Ionicons name={sec.icon as any} size={20} color={isActive ? theme.colors.text : theme.colors.textSecondary} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionTitle, { color: isActive ? theme.colors.text : theme.colors.textSecondary }]}>{sec.title}</Text>
                    <Text style={styles.sectionSubtitle}>{sec.subtitle}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {questionsForActive.map((item) => {
          const show = revealedSet.has(item.id);
          const letter = ['a', 'b', 'c', 'd'][item.correctIndex];
          return (
            <View key={item.id} style={{ zIndex: show ? 2 : 1 }}>
              <View style={[styles.card, { zIndex: 10 }]}>
                <Text style={styles.questionText}>{item.q}</Text>
                <View style={styles.dashed} />
                <View style={styles.optionGrid}>
                  <View style={styles.optionCell}>
                    <Text style={[styles.optionText, show && item.correctIndex === 0 && styles.optionCorrect]}>a. {stripPrefix(item.opts[0])}</Text>
                  </View>
                  <View style={styles.optionCell}>
                    <Text style={[styles.optionText, show && item.correctIndex === 1 && styles.optionCorrect]}>b. {stripPrefix(item.opts[1])}</Text>
                  </View>
                  <View style={styles.optionCell}>
                    <Text style={[styles.optionText, show && item.correctIndex === 2 && styles.optionCorrect]}>c. {stripPrefix(item.opts[2])}</Text>
                  </View>
                  <View style={styles.optionCell}>
                    <Text style={[styles.optionText, show && item.correctIndex === 3 && styles.optionCorrect]}>d. {stripPrefix(item.opts[3])}</Text>
                  </View>
                </View>
                <Pressable onPress={() => toggleReveal(item.id)} style={styles.revealTouch} hitSlop={{ top: 8, bottom: 8, left: 20, right: 20 }}>
                  <View style={styles.revealRow}>
                    <Text style={styles.revealText}>{show ? 'Hide answer' : 'see answer'}</Text>
                    <Ionicons name={show ? 'chevron-up' : 'chevron-down'} size={14} color="#FF6B35" />
                  </View>
                </Pressable>
              </View>
              {show && (
                <View style={{ overflow: 'hidden', zIndex: 1 }}>
                  <View style={styles.answerPill} pointerEvents="none">
                    <Text numberOfLines={2} ellipsizeMode="tail" style={styles.answerPillText}>
                      {letter}. {stripPrefix(item.opts[item.correctIndex])}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {questionsForActive.length === 0 && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: theme.colors.textSecondary }}>Questions will be added soon.</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

function stripPrefix(text: string): string {
  return String(text).replace(/^\s*\(?[a-dA-D]\)?[.)]?\s*/, '').trim();
}

function createStyles(theme: AppTheme) {
  const { colors, glass, isDark } = theme;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    sectionTabs: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 6,
    },
    sectionCard: {
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: isDark ? glass.borderRadius : 16,
      paddingHorizontal: 14,
      paddingVertical: 8,
      marginRight: 8,
      marginLeft: 8,
      borderWidth: isDark ? glass.borderWidth : 1,
      borderColor: isDark ? glass.borderColor : colors.cardBorder,
      width: 260,
    },
    sectionCardActive: {
      borderColor: isDark ? colors.accent : '#434D57',
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      marginTop: 12,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: isDark ? glass.backgroundColor : colors.card,
      borderRadius: isDark ? glass.borderRadius : 16,
      padding: 16,
      marginHorizontal: 16,
      marginTop: 6,
      borderWidth: isDark ? glass.borderWidth : 1,
      borderColor: isDark ? glass.borderColor : colors.cardBorder,
      position: 'relative',
      zIndex: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 8 : 6,
      elevation: isDark ? 4 : 3,
    },
    questionText: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    dashed: {
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255,255,255,0.1)' : '#D9D9D9',
      borderStyle: 'dashed',
      marginBottom: 12,
    },
    optionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    optionCell: {
      width: '48%',
      marginBottom: 10,
    },
    optionText: {
      fontSize: 14,
      color: colors.text,
    },
    optionCorrect: {
      color: '#4CAF50',
      fontWeight: '700',
    },
    revealRow: {
      marginTop: 6,
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    revealText: {
      color: colors.accent,
      fontSize: 15,
      marginRight: 4,
      textTransform: 'capitalize',
    },
    answerPill: {
      marginHorizontal: 25,
      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : '#4CAF50',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: isDark ? 1 : 0,
      borderTopWidth: 0,
      borderColor: isDark ? 'rgba(76, 175, 80, 0.3)' : 'transparent',
    },
    answerPillText: {
      color: isDark ? '#81C784' : '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
    },
    revealTouch: {
      alignSelf: 'stretch',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    headerBackButton: {
      padding: 8,
      marginLeft: 10,
      borderRadius: 20,
    },
  });
}
