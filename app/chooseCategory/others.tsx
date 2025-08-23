import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { knowledgeAnswerKeyLetters, knowledgeQuestions } from '../practiceMore/knowledge';
import { actRegulationAnswerKeyIndices, actRegulationQuestions, techAndMechanicalAnswerKeyIndices, techAndMechanicalQuestions, trafficSignalKnowledgeAnswerKeyIndices, trafficSignalKnowledgeQuestions, vehiclePollutionAnswerKeyIndices, vehiclePollutionQuestions } from './constant';

export default function OthersScreen() {
  // Resolve constants each render so we don't freeze empty values
  let QUESTIONS: any[] = Array.isArray(actRegulationQuestions) ? (actRegulationQuestions as any[]) : [];
  let ANSWER_KEYS: number[] = Array.isArray(actRegulationAnswerKeyIndices) ? (actRegulationAnswerKeyIndices as number[]) : [];
  let TECH_QUESTIONS: any[] = Array.isArray(techAndMechanicalQuestions) ? (techAndMechanicalQuestions as any[]) : [];
  let TECH_ANSWER_KEYS: number[] = Array.isArray(techAndMechanicalAnswerKeyIndices) ? (techAndMechanicalAnswerKeyIndices as number[]) : [];
  let POLLUTION_QUESTIONS: any[] = Array.isArray(vehiclePollutionQuestions) ? (vehiclePollutionQuestions as any[]) : [];
  let POLLUTION_ANSWER_KEYS: number[] = Array.isArray(vehiclePollutionAnswerKeyIndices) ? (vehiclePollutionAnswerKeyIndices as number[]) : [];
  let DRIVE_QUESTIONS: any[] = Array.isArray(knowledgeQuestions) ? (knowledgeQuestions as any[]) : [];
  const letterToIndex = (l: string): number => ({ a: 0, b: 1, c: 2, d: 3 } as const)[String(l).toLowerCase() as 'a'|'b'|'c'|'d'] ?? 0;
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
    } catch {}
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
    } catch {}
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
    } catch {}
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
    } catch {}
  }
  // Convert accidental awareness letters to indices if provided
  if (ACC_ANSWER_KEYS.length === 0 && ACC_ANSWER_LETTERS.length > 0) {
    ACC_ANSWER_KEYS = ACC_ANSWER_LETTERS.map((l: string) => letterToIndex(l));
  }

  // Combine all questions into one array
  const allQuestions = useMemo(() => {
    const combinedQuestions: any[] = [];
    let currentId = 0;

    // Add all questions from each section with proper ID mapping
    const addQuestions = (questions: any[], answerKeys: number[], sectionName: string) => {
      questions.forEach((q, idx) => {
        const key = Number.isFinite(answerKeys[idx]) ? Number(answerKeys[idx]) : 0;
        combinedQuestions.push({
          q: q?.question ?? '',
          opts: Array.isArray(q?.options) ? q.options : ['', '', '', ''],
          correctIndex: Math.max(0, Math.min(3, key)),
          id: currentId++,
          section: sectionName,
        });
      });
    };

    // Add questions from each section
    addQuestions(QUESTIONS, ANSWER_KEYS, 'Vehicular Act/Regulation');
    addQuestions(TECH_QUESTIONS, TECH_ANSWER_KEYS, 'Technical Knowledge');
    addQuestions(POLLUTION_QUESTIONS, POLLUTION_ANSWER_KEYS, 'Environment Pollution');
    addQuestions(DRIVE_QUESTIONS, DRIVE_ANSWER_KEYS, 'Driving Knowledge');
    addQuestions(ACC_QUESTIONS, ACC_ANSWER_KEYS, 'Accidental Awareness');
    addQuestions(SIGNAL_QUESTIONS, SIGNAL_ANSWER_KEYS, 'Traffic Signals');

    return combinedQuestions;
  }, [QUESTIONS, ANSWER_KEYS, TECH_QUESTIONS, TECH_ANSWER_KEYS, POLLUTION_QUESTIONS, POLLUTION_ANSWER_KEYS, DRIVE_QUESTIONS, DRIVE_ANSWER_KEYS, ACC_QUESTIONS, ACC_ANSWER_KEYS, SIGNAL_QUESTIONS, SIGNAL_ANSWER_KEYS]);

  const [revealedSet, setRevealedSet] = useState<Set<number>>(new Set());
  const answerAnimMapRef = useRef<Map<number, Animated.Value>>(new Map());
  const scrollViewRef = useRef<ScrollView>(null);
  const [showGoToTop, setShowGoToTop] = useState(false);

  const getAnimForId = (id: number) => {
    const map = answerAnimMapRef.current;
    if (!map.has(id)) map.set(id, new Animated.Value(0));
    return map.get(id)!;
  };

  const toggleReveal = (id: number) => {
    const anim = getAnimForId(id);
    const willShow = !revealedSet.has(id);
    Animated.timing(anim, {
      toValue: willShow ? 1 : 0,
      duration: willShow ? 450 : 180,
      delay: willShow ? 10 : 0,
      easing: willShow ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
    setRevealedSet(prev => {
      const next = new Set(prev);
      if (willShow) next.add(id); else next.delete(id);
      return next;
    });
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowGoToTop(scrollY > 200);
  };

  const router = useRouter();
  return (
    <>
      <Stack.Screen 
        options={{
          title: "Others - All Questions",
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: '#434D57',
          },
          headerTitleStyle: {
            fontSize: 18,
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
        }}
      />
      <ScrollView 
        ref={scrollViewRef}
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: 32 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Single section card showing all questions */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionRow}>
            <View style={styles.sectionIcon}>
              <Ionicons name="document-text-outline" size={22} color="#434D57" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>All Questions</Text>
              <Text style={styles.sectionSubtitle}>
                Complete collection of all driving test questions from all sections
              </Text>
            </View>
          </View>
        </View>

        {allQuestions.map((item) => {
          const show = revealedSet.has(item.id);
          const anim = getAnimForId(item.id);
          const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] });
          const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
          const letter = ['a','b','c','d'][item.correctIndex];
          return (
            <View key={item.id}>
              <View style={styles.card}>
                <View style={styles.questionHeader}>
                  <Text style={styles.sectionTag}>{item.section}</Text>
                </View>
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
              <Animated.View style={[styles.answerPill, { opacity, transform: [{ translateY }] }]} pointerEvents="none">
                {show && <Text style={styles.answerPillText}>{letter}. {stripPrefix(item.opts[item.correctIndex])}</Text>}
              </Animated.View>
            </View>
          );
        })}

        {allQuestions.length === 0 && (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>Questions will be added soon.</Text>
          </View>
        )}
      </ScrollView>

      {/* Go to top floating button */}
      {showGoToTop && (
        <Pressable 
          style={styles.goToTopButton}
          onPress={scrollToTop}
        >
          <Ionicons name="chevron-up" size={20} color="#FFFFFF" />
        </Pressable>
      )}
    </>
  );
}

function stripPrefix(text: string): string {
  return String(text).replace(/^\s*\(?[a-dA-D]\)?[.)]?\s*/, '').trim();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#434D57',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  questionHeader: {
    marginBottom: 8,
  },
  sectionTag: {
    fontSize: 11,
    color: '#434D57',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  dashed: {
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
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
    color: '#333',
  },
  optionCorrect: {
    color: '#2E7D32',
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
    color: '#FF6B35',
    fontSize: 15,
    marginRight: 4,
    textTransform: 'capitalize',
  },
  answerPill: {
    marginTop: -12,
    marginHorizontal: 24,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  answerPillText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    paddingTop: 4,
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
  goToTopButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 40,
    height: 40,
    borderRadius: 25,
    backgroundColor: '#434D57',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 1000,
    opacity: 0.6,
  },
});