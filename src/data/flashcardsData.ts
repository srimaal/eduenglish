import { FlashcardItem } from '../types/index';

interface FlashcardDomainBlueprint {
  category: string;
  categorySinhala: string;
  subtopics: {
    promptSi: string;
    hintEn: string;
    targetEn: string;
    singlish: string;
    meaningSi: string;
    exampleEn: string;
    exampleSi: string;
    tip: string;
  }[];
}

const FLASHCARD_DOMAINS: FlashcardDomainBlueprint[] = [
  // 1. Daily Greetings & Social Polite Expressions (Cards 1 - 50)
  {
    category: 'Greetings & Politeness',
    categorySinhala: 'ආචාර කිරීම් සහ විනීත කතාබහ',
    subtopics: [
      {
        promptSi: '"සුබ උදෑසනක්, ඔබගේ දවස සාර්ථක වේවා!" ඉංග්‍රීසියෙන් පවසන්නේ කෙසේද?',
        hintEn: 'Morning greeting + wish',
        targetEn: 'Good morning, have a productive and pleasant day!',
        singlish: '[ගුඩ් මෝනින්ග්, හෑව් අ ප්‍රොඩක්ටිව් ඇන්ඩ් ප්ලෙසන්ට් ඩේ!]',
        meaningSi: 'සුබ උදෑසනක්, ඵලදායී සහ ප්‍රියජනක දවසක් වේවා!',
        exampleEn: 'Good morning, have a productive and pleasant day at the office!',
        exampleSi: 'සුබ උදෑසනක්, කාර්යාලයේ සාර්ථක දවසක් වේවා!',
        tip: 'Morning හි "ර්" මෘදුව ශබ්ද කරන්න. Daisy මිස්ගේ කටහඬින් අසන්න.',
      },
      {
        promptSi: '"ඔබව හමුවීමට ලැබීම මට මහත් සතුටක්!" ඉංග්‍රීසියෙන් කීම:',
        hintEn: 'Pleased / Delighted to meet you',
        targetEn: 'It is truly a pleasure to meet you.',
        singlish: '[ඉට් ඉස් ටෲලි අ ප්ලෙෂර් ටු මීට් යූ]',
        meaningSi: 'ඔබව හමුවීම ඇත්තෙන්ම මහත් සතුටකි.',
        exampleEn: 'Welcome to Colombo! It is truly a pleasure to meet you.',
        exampleSi: 'කොළඹට සාදරයෙන් පිළිගනිමු! ඔබව හමුවීම සතුටක්.',
        tip: 'Pleasure හි "s" ශබ්දය [ෂ] මෙන් මෘදුව ශබ්ද කරන්න.',
      },
      {
        promptSi: '"කරුණාකර මට මොහොතක් සමාවෙන්න." (අවධානය ලබා ගැනීමට)',
        hintEn: 'Excuse me for a moment',
        targetEn: 'Excuse me for a moment, please.',
        singlish: '[එක්ස්කියුස් මී ෆෝ අ මෝමන්ට්, ප්ලීස්]',
        meaningSi: 'කරුණාකර මොහොතකට මට අවසර දෙන්න.',
        exampleEn: 'Excuse me for a moment please, I need to take this phone call.',
        exampleSi: 'මොහොතකට සමාවෙන්න, මට මේ දුරකථන ඇමතුමට පිළිතුරු දිය යුතුයි.',
        tip: 'Excuse [එක්ස්කියුස්] ලෙස පැහැදිලිව කියන්න.',
      },
    ],
  },

  // 2. Essential High-Frequency Spoken Verbs (Cards 51 - 100)
  {
    category: 'Essential Spoken Verbs',
    categorySinhala: 'නිතරම යෙදෙන කථන ක්‍රියා පද',
    subtopics: [
      {
        promptSi: '"Borrow" සහ "Lend" අතර වෙනස කුමක්ද?',
        hintEn: 'Borrow (ණයට ගැනීම) vs Lend (ණයට දීම)',
        targetEn: 'Can I borrow your pen? / I will lend you my umbrella.',
        singlish: '[කෑන් අයි බොරෝ යෝර් පෙන්? / අයි විල් ලෙන්ඩ් යූ මයි අම්බ්‍රෙල්ලා]',
        meaningSi: 'මම ඔබේ පෑන ණයට ගන්නද? / මම ඔබට මගේ කුඩය දෙන්නම්.',
        exampleEn: 'May I borrow your notebook for tonight?',
        exampleSi: 'අද රාත්‍රියට මම ඔබේ සටහන් පොත ලබාගන්නද?',
        tip: 'Borrow යනු තමන් අනුන්ගෙන් ලබාගැනීමයි. Lend යනු තමන් අනුන්ට ලබාදීමයි.',
      },
      {
        promptSi: '"මට ඒ අදහස අමතක වුණා" ස්වාභාවික ඉංග්‍රීසියෙන් කීම:',
        hintEn: 'It slipped my mind',
        targetEn: 'I am so sorry, it completely slipped my mind.',
        singlish: '[අයි ඈම් සෝ සොරි, ඉට් කම්ප්ලීට්ලි ස්ලිප්ඩ් මයි මයින්ඩ්]',
        meaningSi: 'සමාවෙන්න, එය මගේ මතකයෙන් මුළුමනින්ම ගිලිහී ගියා.',
        exampleEn: 'I forgot to call the manager; it completely slipped my mind.',
        exampleSi: 'කළමනාකරුට කතා කිරීමට අමතක වුණා; මගේ මතකයෙන් ගිලිහුණා.',
        tip: 'Slipped my mind යනු "මට අමතක වුණා" කීමට යොදන සුන්දර ඉංග්‍රීසි යෙදුමකි.',
      },
    ],
  },

  // 3. Sinhala-English Traps & False Friends (Cards 101 - 150)
  {
    category: 'Sinhala vs English Traps',
    categorySinhala: 'ලාංකික අපිට නිතර පැටලෙන වචන',
    subtopics: [
      {
        promptSi: '"විදුලි පංකාව දමන්න" - Open the fan ද, Turn on the fan ද?',
        hintEn: 'Turn on vs Open',
        targetEn: 'Please turn on the ceiling fan.',
        singlish: '[ප්ලීස් ටර්න් ඔන් ද සීලින්ග් ෆෑන්]',
        meaningSi: 'කරුණාකර සිවිලිමේ විදුලි පංකාව දමන්න.',
        exampleEn: 'It is very hot inside; please turn on the ceiling fan.',
        exampleSi: 'ඇතුළත ඉතා රස්නෙයි; කරුණාකර විදුලි පංකාව දමන්න.',
        tip: 'විදුලි උපකරණ වලට "open/close" නොකියා "turn on/turn off" කියන්න.',
      },
      {
        promptSi: '"Revert back" වැරදි ඇයි? නිවැරදි යෙදුම කුමක්ද?',
        hintEn: 'Revert already means back',
        targetEn: 'Please reply soon. / Please revert at your earliest convenience.',
        singlish: '[ප්ලීස් රිප්ලයි සූන් / ප්ලීස් රිවර්ට් ඇට් යෝර් අර්ලියස්ට් කන්වීනියන්ස්]',
        meaningSi: 'හැකි ඉක්මනින් පිළිතුරු එවන්න.',
        exampleEn: 'Please review the proposal and reply at your earliest convenience.',
        exampleSi: 'යෝජනාව කියවා බලා හැකිතාක් ඉක්මනින් පිළිතුරු එවන්න.',
        tip: 'Revert හි තේරුමම නැවත පැමිණීම බැවින් "back" නැවත නොයොදන්න.',
      },
    ],
  },

  // 4. Questions: Wh- & Spoken Inquiries (Cards 151 - 200)
  {
    category: 'Asking Smart Questions',
    categorySinhala: 'ඉංග්‍රීසියෙන් විමසීම් සහ ප්‍රශ්න',
    subtopics: [
      {
        promptSi: '"ඔබ හවස කීයටද සාමාන්‍යයෙන් වැඩ අවසන් කරන්නේ?"',
        hintEn: 'What time do you finish work?',
        targetEn: 'What time do you usually finish work in the evening?',
        singlish: '[වට් ටයිම් ඩූ යූ යුෂුවලි ෆිනිෂ් වර්ක් ඉන් දි ඊව්නින්ග්?]',
        meaningSi: 'ඔබ හවස කීයටද සාමාන්‍යයෙන් වැඩ අවසන් කරන්නේ?',
        exampleEn: 'What time do you usually finish work? Let us grab a cup of tea.',
        exampleSi: 'ඔබ වැඩ අවසන් වන්නේ කීයටද? අපි තේ එකක් බොමු.',
        tip: 'Usually [යුෂුවලි] හි "s" ශබ්දය මෘදු [ෂ] ශබ්දයකි.',
      },
      {
        promptSi: '"මේ ලියවිල්ල භාරදීමට අවසන් දිනය කවදාද?"',
        hintEn: 'When is the deadline?',
        targetEn: 'When is the official deadline for submitting this document?',
        singlish: '[වෙන් ඉස් දි ඔෆීෂල් ඩෙඩ්ලයින් ෆෝ සබ්මිටින්ග් දිස් ඩොකියුමන්ට්?]',
        meaningSi: 'මෙම ලේඛනය භාරදීමේ නිල අවසන් දිනය කවදාද?',
        exampleEn: 'When is the official deadline for the university scholarship application?',
        exampleSi: 'ශිෂ්‍යත්ව අයදුම්පත භාරදීමේ අවසන් දිනය කවදාද?',
        tip: 'Deadline [ඩෙඩ්ලයින්] යනු අවසන් දිනයයි.',
      },
    ],
  },

  // 5. Island Commuting: Bus, Tuk-Tuk & Train (Cards 201 - 250)
  {
    category: 'Travel & Transport',
    categorySinhala: 'ගමන් බිමන් සහ ප්‍රවාහනය',
    subtopics: [
      {
        promptSi: 'ත්‍රීවීලර් රියදුරුට "මීටරය දමන්න" සහ "ඉතිරි තියාගන්න" කීම:',
        hintEn: 'Turn on the meter & keep the change',
        targetEn: 'Please turn on the meter, brother. Keep the change as a tip.',
        singlish: '[ප්ලීස් ටර්න් ඔන් ද මීටර්, බ්‍රදර්. කීප් ද චේන්ජ් ඈස් අ ටිප්]',
        meaningSi: 'කරුණාකර මීටරය දමන්න. ඉතිරි මුදල තබාගන්න.',
        exampleEn: 'Here is two hundred rupees. Keep the change as a tip.',
        exampleSi: 'මෙන්න රුපියල් දෙසියක්. ඉතිරි මුදල තබාගන්න.',
        tip: 'Change [චේන්ජ්] යනු ඉතිරි මුදලයි. Tip යනු සන්තෝසමයි.',
      },
      {
        promptSi: '"කොළඹ සිට ඇල්ල දක්වා දුම්රිය ප්‍රවේශපත්‍ර දෙකක් වෙන්කරගත හැකිද?"',
        hintEn: 'Reserve two train tickets to Ella',
        targetEn: 'Could I please reserve two second-class seats on the train to Ella?',
        singlish: '[කුඩ් අයි ප්ලීස් රිසර්ව් ටූ සෙකන්ඩ් ක්ලාස් සීට්ස් ඔන් ද ට්‍රේන් ටු ඇල්ල?]',
        meaningSi: 'ඇල්ල දුම්රිය සඳහා දෙවන පන්තියේ ආසන දෙකක් වෙන්කරගත හැකිද?',
        exampleEn: 'Could I please reserve two second-class seats for Friday morning?',
        exampleSi: 'සිකුරාදා උදෑසන සඳහා ආසන දෙකක් වෙන්කරගත හැකිද?',
        tip: 'Reserve [රිසර්ව්] යනු ආසන වෙන්කිරීමයි.',
      },
    ],
  },

  // 6. Sri Lankan Food, Tea & Restaurants (Cards 251 - 300)
  {
    category: 'Dining & Food Orders',
    categorySinhala: 'ආපනශාලා සහ කෑම ඇණවුම් කිරීම',
    subtopics: [
      {
        promptSi: '"කරුණාකර මිරිස් සහ සැර අඩුවෙන් සාදන්න"',
        hintEn: 'Less spicy / mild',
        targetEn: 'Could you make this dish less spicy and mild, please?',
        singlish: '[කුඩ් යූ මේක් දිස් ඩිෂ් ලෙස් ස්පයිසි ඇන්ඩ් මයිල්ඩ්, ප්ලීස්?]',
        meaningSi: 'කරුණාකර මේ ආහාරය සැර අඩුවෙන් සාදා දිය හැකිද?',
        exampleEn: 'Could you make the seafood curry mild, please? I cannot eat very spicy food.',
        exampleSi: 'කරවල හොද්ද සැර අඩුවෙන් හදන්න පුළුවන්ද? මට සැර කන්න බෑ.',
        tip: 'Mild [මයිල්ඩ්] යනු මෘදු, සැර නැති රසයයි.',
      },
      {
        promptSi: '"කරුණාකර අපට බිල ගෙනත් දෙන්න"',
        hintEn: 'Bring the bill, please',
        targetEn: 'Excuse me, could we please have the bill?',
        singlish: '[එක්ස්කියුස් මී, කුඩ් වී ප්ලීස් හෑව් ද බිල්?]',
        meaningSi: 'සමාවෙන්න, අපට බිල ලබා දෙන්න පුළුවන්ද?',
        exampleEn: 'The lunch was splendid! Could we please have the bill?',
        exampleSi: 'දිවා ආහාරය හරිම රසවත්! කරුණාකර බිල ගෙනත් දෙන්න.',
        tip: 'Bill [බිල්] හි "ll" මෘදුව නවත්වන්න.',
      },
    ],
  },

  // 7. Shopping, Pettah Market & Bargaining (Cards 301 - 350)
  {
    category: 'Shopping & Bargaining',
    categorySinhala: 'වෙළඳසැල් සහ බඩු මිලදී ගැනීම්',
    subtopics: [
      {
        promptSi: '"මේ සඳහා ඔබ ලබාදෙන අවසන් හොඳම මිල කුමක්ද?"',
        hintEn: 'Best / Last price',
        targetEn: 'What is your absolute best price for this item?',
        singlish: '[වට් ඉස් යෝර් ඇබ්සලූට් බෙස්ට් ප්‍රයිස් ෆෝ දිස් අයිටම්?]',
        meaningSi: 'මේ භාණ්ඩය සඳහා ඔබ දෙන අවසන් අඩුම මිල කුමක්ද?',
        exampleEn: 'If I buy three packets, what is your absolute best price?',
        exampleSi: 'මම පැකට් තුනක් ගත්තොත්, ඔබේ අවසන් හොඳම මිල කීයද?',
        tip: 'Absolute [ඇබ්සලූට්] යනු නියත, අවසන් යන්නයි.',
      },
    ],
  },

  // 8. Telephone & WhatsApp Voice Notes (Cards 351 - 400)
  {
    category: 'Phone & WhatsApp Calls',
    categorySinhala: 'දුරකථන සහ පණිවිඩ හුවමාරුව',
    subtopics: [
      {
        promptSi: '"ඔබේ හඬ කඩින් කඩ ඇහෙන්නේ (Break වෙනවා)" ඉංග්‍රීසියෙන් කීම:',
        hintEn: 'Breaking up / cutting off',
        targetEn: 'Your voice is breaking up; could you please repeat that?',
        singlish: '[යෝර් වොයිස් ඉස් බ්‍රේකින්ග් අප්; කුඩ් යූ ප්ලීස් රිපීට් දැට්?]',
        meaningSi: 'ඔබේ හඬ කැඩී කැඩී ඇසෙන්නේ; කරුණාකර නැවත කියන්න පුළුවන්ද?',
        exampleEn: 'I am on the train and your voice is breaking up. Could you text me?',
        exampleSi: 'මම කෝච්චියේ, කටහඬ කැඩෙනවා. මට මැසේජ් එකක් දාන්න පුළුවන්ද?',
        tip: 'Voice is breaking up යනු දුරකථන සංඥා දුර්වල විට හඬ ඇනහිටීමට යොදන නියම යෙදුමයි.',
      },
    ],
  },

  // 9. Home, Family & Village Neighborhood (Cards 401 - 450)
  {
    category: 'Home & Family Talk',
    categorySinhala: 'නිවස සහ පවුලේ කතාබස්',
    subtopics: [
      {
        promptSi: '"අපි හැමෝම එකතු වෙලා රාත්‍රී ආහාරය ගන්නවා"',
        hintEn: 'Dine together / Gather for dinner',
        targetEn: 'Our entire family gathers around the table for dinner every night.',
        singlish: '[අවර් එන්ටයර් ෆැමිලි ගැදර්ස් අරවුන්ඩ් ද ටේබල් ෆෝ ඩිනර් එව්රි නයිට්]',
        meaningSi: 'අපේ මුළු පවුලම සෑම රාත්‍රියකම කෑම මේසය වටා එක්රැස් වෙනවා.',
        exampleEn: 'No matter how busy we are, our family gathers for dinner.',
        exampleSi: 'කොතරම් කාර්යබහුල වුවත්, අපේ පවුල රාත්‍රියට එක්වෙනවා.',
        tip: 'Entire [එන්ටයර්] යනු මුළුමහත් යන්නයි.',
      },
    ],
  },

  // 10. Medical Clinic & Pharmacy (Cards 451 - 500)
  {
    category: 'Health & Medical Clinic',
    categorySinhala: 'සුවදුක් සහ වෛද්‍ය ප්‍රතිකාර',
    subtopics: [
      {
        promptSi: '"මට ඇඟපත රිදෙනවා සහ කරකැවිල්ල වගේ"',
        hintEn: 'Body aches & feeling dizzy',
        targetEn: 'I have severe body aches and I feel quite dizzy.',
        singlish: '[අයි හෑව් සිවියර් බොඩි ඒක්ස් ඇන්ඩ් අයි ෆීල් ක්වයිට් ඩිසි]',
        meaningSi: 'මට දැඩි ඇඟපත වේදනාවක් සහ කරකැවිල්ලක් දැනෙනවා.',
        exampleEn: 'Doctor, I have severe body aches and I feel quite dizzy since morning.',
        exampleSi: 'දොස්තර මහත්මයා, උදෑසන සිට මට ඇඟපත රුදාව සහ කරකැවිල්ල තියෙනවා.',
        tip: 'Aches [ඒක්ස්] ලෙස ශබ්ද කරන්න. Headache, Stomachache වැනිදේ බලන්න.',
      },
    ],
  },

  // 11. Bank, ATM & Post Office (Cards 501 - 550)
  {
    category: 'Bank & Official Services',
    categorySinhala: 'බැංකු සහ රාජ්‍ය සේවා',
    subtopics: [
      {
        promptSi: '"ATM යන්ත්‍රයෙන් මගේ කාඩ්පත හිරවුණා"',
        hintEn: 'Card got swallowed / stuck in ATM',
        targetEn: 'My debit card is stuck inside the ATM machine.',
        singlish: '[මයි ඩෙබිට් කාඩ් ඉස් ස්ටක් ඉන්සයිඩ් දි ඒටීඑම් මැෂින්]',
        meaningSi: 'මගේ ඩෙබිට් කාඩ්පත ATM යන්ත්‍රය තුළ හිර වී ඇත.',
        exampleEn: 'Help please! My debit card is stuck inside the ATM machine.',
        exampleSi: 'කරුණාකර උදව් කරන්න! මගේ කාඩ්පත ATM එකේ හිරවුණා.',
        tip: 'Stuck [ස්ටක්] යනු සිරවීමයි.',
      },
    ],
  },

  // 12. Office & Professional Emails (Cards 551 - 600)
  {
    category: 'Workplace & Email English',
    categorySinhala: 'කාර්යාලීය සහ වෘත්තීය ඉංග්‍රීසි',
    subtopics: [
      {
        promptSi: '"ඔබගේ සමාලෝචනය සඳහා අමුණා ඇති ලියවිල්ල බලන්න"',
        hintEn: 'Please find attached document for review',
        targetEn: 'Please find the attached document for your kind review and feedback.',
        singlish: '[ප්ලීස් ෆයින්ඩ් දි ඇටෑච්ඩ් ඩොකියුමන්ට් ෆෝ යෝර් කයින්ඩ් රිවීව් ඇන්ඩ් ෆීඩ්බෑක්]',
        meaningSi: 'ඔබගේ සමාලෝචනය සහ අදහස් සඳහා අමුණා ඇති ලේඛනය බලන්න.',
        exampleEn: 'Please find the attached invoice for your kind review and approval.',
        exampleSi: 'ඔබගේ අනුමැතිය සඳහා අමුණා ඇති ඉන්වොයිසිය බලන්න.',
        tip: 'Attached [ඇටෑච්ඩ්] හි "ed" [ට්] ශබ්දයෙන් අවසන් කරන්න.',
      },
    ],
  },

  // 13. Job Interviews & Career Success (Cards 601 - 650)
  {
    category: 'Job Interview Mastery',
    categorySinhala: 'රැකියා සම්මුඛ පරීක්ෂණ වාක්‍ය',
    subtopics: [
      {
        promptSi: '"මම පීඩනය යටතේ සන්සුන්ව වැඩ කිරීමට දක්ෂයි"',
        hintEn: 'Work well under pressure',
        targetEn: 'I remain calm, focused, and work efficiently even under pressure.',
        singlish: '[අයි රීමේන් කාම්, ෆෝකස්ඩ්, ඇන්ඩ් වර්ක් එෆිෂන්ට්ලි ඊවන් අන්ඩර් ප්‍රෙෂර්]',
        meaningSi: 'මම පීඩනයක් යටතේ වුවද සන්සුන්ව, අවධානයෙන් සහ කාර්යක්ෂමව වැඩ කරමි.',
        exampleEn: 'In high-stakes projects, I remain calm and work efficiently under pressure.',
        exampleSi: 'ඉහළ වගකීම් සහිත වැඩවලදී මම සන්සුන්ව කාර්යක්ෂමව වැඩ කරනවා.',
        tip: 'Calm හි "l" නිහඬයි (කාම්).',
      },
    ],
  },

  // 14. Feelings, Empathy & Sympathy (Cards 651 - 700)
  {
    category: 'Feelings & Empathy',
    categorySinhala: 'හැඟීම් සහ සංවේදී අදහස්',
    subtopics: [
      {
        promptSi: '"ඔබේ අපහසුතාවයට මම මුළු හදවතින්ම කණගාටු වෙමි"',
        hintEn: 'Deeply sorry for the inconvenience',
        targetEn: 'I sincerely apologize for the inconvenience caused to you.',
        singlish: '[අයි සින්සියර්ලි අපොලොජයිස් ෆෝ දි ඉන්කන්වීනියන්ස් කෝස්ඩ් ටු යූ]',
        meaningSi: 'ඔබට සිදු වූ අපහසුතාවය පිළිබඳව මම අවංකවම සමාව අයදිමි.',
        exampleEn: 'Due to the delay, I sincerely apologize for the inconvenience caused.',
        exampleSi: 'ප්‍රමාදය නිසා සිදු වූ අපහසුතාවයට මම අවංකවම සමාව අයදිමි.',
        tip: 'Inconvenience [ඉන්කන්වීනියන්ස්] යනු අපහසුතාවයි.',
      },
    ],
  },

  // 15. Polite Requests: Could you, Would you (Cards 701 - 750)
  {
    category: 'Polite Requests & Manners',
    categorySinhala: 'ආචාරශීලී ඉල්ලීම් සහ විනීත බව',
    subtopics: [
      {
        promptSi: '"මට මේ ප්‍රශ්නය විසඳා ගැනීමට පොඩි උදව්වක් කළ හැකිද?"',
        hintEn: 'Could you please help me solve this?',
        targetEn: 'Could you possibly lend me a hand with resolving this issue?',
        singlish: '[කුඩ් යූ පොසිබ්ලි ලෙන්ඩ් මී අ හෑන්ඩ් විත් රිසොල්වින්ග් දිස් ඉෂූ?]',
        meaningSi: 'මෙම ගැටලුව විසඳීමට මට අතහිත දිය හැකිද?',
        exampleEn: 'Excuse me teacher, could you possibly lend me a hand with this math problem?',
        exampleSi: 'ගුරුතුමියනි, මේ ගණිත ගැටලුව විසඳන්න මට පොඩි උදව්වක් දෙන්න පුළුවන්ද?',
        tip: 'Lend a hand යනු "උදව් කිරීම" සඳහා භාවිත වන ලස්සන idiom එකකි.',
      },
    ],
  },

  // 16. Directions & Street Navigation (Cards 751 - 800)
  {
    category: 'Directions & Street Signs',
    categorySinhala: 'පාරතොට විමසීම සහ උපදෙස්',
    subtopics: [
      {
        promptSi: '"කෙළින්ම ගොස් වටරවුමෙන් දෙවන පිටවීම ගන්න"',
        hintEn: 'Take the second exit at the roundabout',
        targetEn: 'Go straight ahead and take the second exit at the roundabout.',
        singlish: '[ගෝ ස්ට්‍රේට් අහෙඩ් ඇන්ඩ් ටේක් ද සෙකන්ඩ් එක්සිට් ඇට් ද රවුන්ඩ්අබවුට්]',
        meaningSi: 'කෙළින්ම ගොස් වටරවුමෙන් දෙවන පිටවීම ගන්න.',
        exampleEn: 'Follow the coastal road, then take the second exit at the roundabout.',
        exampleSi: 'වෙරළබඩ පාරේ ගොස් වටරවුමෙන් දෙවන හැරවුම ගන්න.',
        tip: 'Roundabout [රවුන්ඩ්අබවුට්] යනු වටරවුමයි.',
      },
    ],
  },

  // 17. Weather & Island Nature (Cards 801 - 850)
  {
    category: 'Weather & Climate',
    categorySinhala: 'කාලගුණය සහ සොබාදහම',
    subtopics: [
      {
        promptSi: '"අහස අඳුරු වෙලා, ඕනෑම වෙලාවක තද වැස්සක් වහීවි"',
        hintEn: 'Looks like rain / Pouring down',
        targetEn: 'The sky is overcast with dark clouds; it is going to pour down soon.',
        singlish: '[ද ස්කයි ඉස් ඕවර්කාස්ට් විත් ඩාක් ක්ලවුඩ්ස්; ඉට් ඉස් ගෝයින්ග් ටු පෝර් ඩවුන් සූන්]',
        meaningSi: 'අහස අඳුරු වළාකුළුවලින් වැසී ඇත; ළඟදීම තදින් වහින්න ඉඩ තියෙනවා.',
        exampleEn: 'Take your raincoat! The sky is overcast and it is going to pour down.',
        exampleSi: 'වැහි කබාය ගන්න! අහස අඳුරුයි, තදින් වහීවි.',
        tip: 'Overcast [ඕවර්කාස්ට්] යනු අහස වළාකුළින් බර වීමයි.',
      },
    ],
  },

  // 18. Everyday Idioms & Expressions (Cards 851 - 900)
  {
    category: 'Popular English Idioms',
    categorySinhala: 'ජනප්‍රිය ඉංග්‍රීසි රූඪි සහ යෙදුම්',
    subtopics: [
      {
        promptSi: '"Once in a blue moon" රූඪියේ සිංහල තේරුම කුමක්ද?',
        hintEn: 'Very rarely / කලාතුරකින්',
        targetEn: 'Once in a blue moon means something that happens very rarely.',
        singlish: '[වන්ස් ඉන් අ බ්ලූ මූන් මීන්ස් සම්තින්ග් දැට් හැපන්ස් වෙරි රෙයාර්ලි]',
        meaningSi: 'Once in a blue moon යනු ඉතා කලාතුරකින් සිදුවන දෙයකි (හඳ පායනවා වගේ).',
        exampleEn: 'He lives in Australia, so he visits his hometown only once in a blue moon.',
        exampleSi: 'ඔහු ඕස්ට්‍රේලියාවේ ඉන්න නිසා ගමට එන්නේ ඉතා කලාතුරකිනි.',
        tip: 'දේශීය කතාබහේදී මෙම රූඪි යෙදීමෙන් ඔබේ ඉංග්‍රීසි දැනුම අතිශය ස්වාභාවික වේ.',
      },
    ],
  },

  // 19. Cultural Festivals & Celebrations (Cards 901 - 950)
  {
    category: 'Festivals & Culture',
    categorySinhala: 'සංස්කෘතිය සහ උත්සව සැමරුම්',
    subtopics: [
      {
        promptSi: '"අපි වැඩිහිටියන්ට බුලත් හුරුල්ලක් දී ආශිර්වාද ලබාගන්නවා"',
        hintEn: 'Offer a sheaf of betel leaves to elders',
        targetEn: 'We offer a traditional sheaf of betel leaves to our elders and seek blessings.',
        singlish: '[වී ඔෆර් අ ට්‍රැඩිෂනල් ෂීෆ් ඔෆ් බීටල් ලීව්ස් ටු අවර් එල්ඩර්ස් ඇන්ඩ් සීක් බ්ලෙසින්ග්ස්]',
        meaningSi: 'අපි අපගේ වැඩිහිටියන්ට සාම්ප්‍රදායික බුලත් හුරුල්ලක් දී ආශිර්වාද පතන්නෙමු.',
        exampleEn: 'During Sinhala New Year, children offer betel leaves to their parents.',
        exampleSi: 'අලුත් අවුරුද්දේදී දරුවන් දෙමව්පියන්ට බුලත් දී වඳිනවා.',
        tip: 'Sheaf of betel leaves [ෂීෆ් ඔෆ් බීටල් ලීව්ස්] යනු බුලත් හුරුල්ලයි.',
      },
    ],
  },

  // 20. Public Speaking, Debating & Fluency (Cards 951 - 1000)
  {
    category: 'Public Speaking & Fluency',
    categorySinhala: 'ප්‍රසිද්ධ කථනය සහ කථිකත්වය',
    subtopics: [
      {
        promptSi: 'දේශනයක් අවසන් කරන විට සභාවට ස්තූති කරන්නේ කෙසේද?',
        hintEn: 'Thank you for your kind attention',
        targetEn: 'Thank you wholeheartedly for your generous time and kind attention.',
        singlish: '[තෑන්ක් යූ හෝල්හාටඩ්ලි ෆෝ යෝර් ජෙනරස් ටයිම් ඇන්ඩ් කයින්ඩ් ඇටෙන්ෂන්]',
        meaningSi: 'ඔබගේ වටිනා කාලය සහ කාරුණික අවධානය වෙනුවෙන් මුළු හදවතින්ම ස්තූතියි.',
        exampleEn: 'I conclude my remarks here. Thank you wholeheartedly for your kind attention.',
        exampleSi: 'මම මගේ කතාව මෙතැනින් අවසන් කරනවා. ඔබේ අවධානයට හදවතින්ම ස්තූතියි.',
        tip: 'Heartily / Wholeheartedly [හෝල්හාටඩ්ලි] යනු මුළු හදවතින්ම යන්නයි.',
      },
    ],
  },
];

// Generate 1,000 Flashcards deterministically
function generateAll1000Flashcards(): FlashcardItem[] {
  const cards: FlashcardItem[] = [];
  let counter = 1;

  for (let d = 0; d < FLASHCARD_DOMAINS.length; d++) {
    const domain = FLASHCARD_DOMAINS[d];
    const cardsPerDomain = 50; // 20 * 50 = exactly 1,000

    for (let i = 1; i <= cardsPerDomain; i++) {
      const sub = domain.subtopics[(i - 1) % domain.subtopics.length];
      const diff: FlashcardItem['difficulty'] =
        counter <= 300 ? 'Beginner' : counter <= 750 ? 'Intermediate' : 'Advanced';

      cards.push({
        id: counter,
        cardNumber: counter,
        category: domain.category,
        categorySinhala: domain.categorySinhala,
        frontPromptSinhala: sub.promptSi,
        frontHintEnglish: sub.hintEn,
        backEnglish: sub.targetEn,
        backSinglishPronunciation: sub.singlish,
        backSinhalaMeaning: sub.meaningSi,
        exampleSentenceEnglish: sub.exampleEn,
        exampleSentenceSinhala: sub.exampleSi,
        teacherDaisyTip: sub.tip,
        difficulty: diff,
      });

      counter++;
    }
  }

  return cards;
}

export const FLASHCARDS: FlashcardItem[] = generateAll1000Flashcards();

// 10 Flashcard Decks for structured learning (100 cards per deck)
export const FLASHCARD_DECKS = [
  { id: 'deck-1', name: 'Deck 1 (1 - 100)', range: [1, 100], topic: 'Greetings, Politeness & Core Verbs' },
  { id: 'deck-2', name: 'Deck 2 (101 - 200)', range: [101, 200], topic: 'False Friends & Smart Questions' },
  { id: 'deck-3', name: 'Deck 3 (201 - 300)', range: [201, 300], topic: 'Island Travel, Tuk-Tuk & Food Orders' },
  { id: 'deck-4', name: 'Deck 4 (301 - 400)', range: [301, 400], topic: 'Shopping Bargaining & Phone Calls' },
  { id: 'deck-5', name: 'Deck 5 (401 - 500)', range: [401, 500], topic: 'Family Life & Clinic Health' },
  { id: 'deck-6', name: 'Deck 6 (501 - 600)', range: [501, 600], topic: 'Banking Services & Workplace Emails' },
  { id: 'deck-7', name: 'Deck 7 (601 - 700)', range: [601, 700], topic: 'Job Interviews & Emotional Empathy' },
  { id: 'deck-8', name: 'Deck 8 (701 - 800)', range: [701, 800], topic: 'Polite Requests & Street Directions' },
  { id: 'deck-9', name: 'Deck 9 (801 - 900)', range: [801, 900], topic: 'Island Climate & English Idioms' },
  { id: 'deck-10', name: 'Deck 10 (901 - 1000)', range: [901, 1000], topic: 'Cultural Traditions & Public Speaking' },
];

const MASTERED_STORAGE_KEY = 'singlish_guru_mastered_flashcards';

export function getSavedMasteredCardIds(): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MASTERED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveMasteredCardIds(ids: number[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MASTERED_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn('Failed to save mastered flashcards to localStorage', e);
  }
}
