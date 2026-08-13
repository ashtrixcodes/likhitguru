import { unicodeToAakriti } from '@/utils/unicodeToAakriti';
import { toNepaliDigits } from '@/utils/nepaliCalendar';

export const homeTranslations = {
  np: {
    greetings: {
      morning: 'शुभ प्रभात!',
      afternoon: 'शुभ दिन!',
      evening: 'शुभ सन्ध्या!',
      night: 'शुभ रात्री!',
    },
    usernameModal: {
      title: 'तपाईंको नाम के हो?',
      placeholder: 'तपाईंको नाम राख्नुहोस्',
      charCount: (len: number) => `${toNepaliDigits(len)} / २० अक्षरहरू`,
      cancel: 'रद्द गर्नुहोस्',
      save: 'सुरक्षित गर्नुहोस्',
      invalidTitle: 'अवैध नाम',
      invalidMsg: 'कृपया सही नाम राख्नुहोस्।',
      tooLongTitle: 'नाम धेरै लामो भयो',
      tooLongMsg: 'कृपया २० अक्षर भन्दा सानो नाम राख्नुहोस्।',
    },
    sections: {
      lekhitExam: 'लिखित परीक्षा',
      quiz: 'प्रश्नोत्तरी',
      practiceMore: 'थप अभ्यास',
      others: 'अन्य सेवाहरू',
    },
    categoryCards: {
      car: 'कार',
      bike: 'बाइक',
      others: 'अन्य सवारी',
      view: 'हेर्नुहोस्',
    },
    quizCards: {
      signTestTitle: 'चिन्ह परीक्षा',
      signTestSubtitle: 'ट्राफिक संकेतहरू',
      eyeTestTitle: 'दृष्टि परीक्षा',
      eyeTestSubtitle: 'अंक ढाँचा',
      practiceAction: 'अभ्यास →',
    },
    practiceCards: {
      informative: 'सूचनामूलक\nसंकेत',
      restrictive: 'प्रतिबन्धात्मक\nसंकेत',
      numbers: 'संख्यात्मक\nसंकेत',
      examTest: 'परीक्षण\nमोड',
    },
    otherCards: {
      licenseForm: 'अनलाइन\nफारम',
      licensePrintCheck: 'लाइसेन्स प्रिन्ट\nअवस्था',
      trafficFines: 'जरिवाना\nविवरण',
      nagdhunga: 'नागढुङ्गा टनेल\nदस्तुर',
      moreInfo: 'थप\nजानकारी',
      nepaliCalendar: 'नेपाली पात्रो\nर परीक्षा मिति',
    },
  },
  en: {
    greetings: {
      morning: 'Good Morning!',
      afternoon: 'Good Afternoon!',
      evening: 'Good Evening!',
      night: 'Good Night!',
    },
    usernameModal: {
      title: 'What should I call you?',
      placeholder: 'Enter your name',
      charCount: (len: number) => `${len}/20 characters`,
      cancel: 'Cancel',
      save: 'Save',
      invalidTitle: 'Invalid Name',
      invalidMsg: 'Please enter a valid name.',
      tooLongTitle: 'Name Too Long',
      tooLongMsg: 'Please enter a name with 20 characters or less.',
    },
    sections: {
      lekhitExam: 'Likhit Exam',
      quiz: 'Quiz',
      practiceMore: 'Practice More',
      others: 'Others',
    },
    categoryCards: {
      car: 'Car',
      bike: 'Bike',
      others: 'Others',
      view: 'View',
    },
    quizCards: {
      signTestTitle: 'Sign Test',
      signTestSubtitle: 'Traffic Signals',
      eyeTestTitle: 'Eye Test',
      eyeTestSubtitle: 'Numbers Pattern',
      practiceAction: 'Practice →',
    },
    practiceCards: {
      informative: 'Informative',
      restrictive: 'Restrictive',
      numbers: 'Numbers',
      examTest: 'Exam Test',
    },
    otherCards: {
      licenseForm: 'Online license form',
      licensePrintCheck: 'License Print Check',
      trafficFines: 'Traffic Fines Info',
      nagdhunga: 'Nagdhunga Charges',
      moreInfo: 'More Info',
      nepaliCalendar: 'Nepali Calendar\n& Exam Date',
    },
  },
};
