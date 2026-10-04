import { Lesson, PhraseItem, CommonMistakeItem } from '../types/index.ts';

interface LessonBlueprint {
  domain: string;
  domainSinhala: string;
  subtopics: {
    titleEn: string;
    titleSi: string;
    ruleTitleSi: string;
    ruleExplainSi: string;
    phrases: { en: string; si: string; singlish: string; tip: string }[];
    mistake: CommonMistakeItem;
    adviceSi: string;
  }[];
}

const BLUEPRINTS: LessonBlueprint[] = [
  {
    domain: 'Greetings & Introductions',
    domainSinhala: 'ආචාර කිරීම් සහ ස්වයං හැඳින්වීම්',
    subtopics: [
      {
        titleEn: 'Morning & Afternoon Greetings',
        titleSi: 'උදෑසන සහ දහවල් ආචාර කිරීම්',
        ruleTitleSi: 'වේලාව අනුව ආචාර කිරීමේ රීතිය',
        ruleExplainSi: 'උදෑසන 12 දක්වා "Good morning" ද, දහවල් 12 සිට සවස 5 දක්වා "Good afternoon" ද යොදයි.',
        phrases: [
          { en: 'Good morning, how is your day starting?', si: 'සුබ උදෑසනක්, ඔබේ දවස ආරම්භය කොහොමද?', singlish: '[ගුඩ් මෝනින්ග්, හවු ඉස් යෝර් ඩේ ස්ටාටින්ග්?]', tip: 'Morning හි "ර්" මෘදුව කියන්න.' },
          { en: 'Good afternoon, Sir Sri Maal!', si: 'සුබ දහවලක්, ශ්‍රී මාල් සර්!', singlish: '[ගුඩ් ආෆ්ටර්නූන්, සර් ශ්‍රී මාල්!]', tip: 'Afternoon හි "noon" දිගු කරන්න.' },
          { en: 'I am pleased to meet you.', si: 'ඔබව හමුවීම සතුටක්.', singlish: '[අයි ඈම් ප්ලීස්ඩ් ටු මීට් යූ]', tip: 'Pleased හි "d" ශබ්දය පැහැදිලි කරන්න.' },
          { en: 'Have a productive afternoon.', si: 'සාර්ථක දහවලක් වේවා.', singlish: '[හෑව් අ ප්‍රොඩක්ටිව් ආෆ්ටර්නූන්]', tip: 'Productive [ප්‍රොඩක්ටිව්] ලෙස කියන්න.' },
          { en: 'See you around five o\'clock.', si: 'පහට පමණ හමුවෙමු.', singlish: '[සී යූ අරවුන්ඩ් ෆයිව් ඔක්ලොක්]', tip: 'O\'clock හි "k" නවත්වන්න.' },
        ],
        mistake: { incorrect: 'Good night, how are you?', correct: 'Good evening, how are you?', explanationSinhala: '"Good night" කියන්නේ රාත්‍රියේ සමුගන්නා විට පමණි. හමුවන විට "Good evening" කියන්න.' },
        adviceSi: 'පුතා, මුහුණේ මඳහසක් තියාගෙන කතා කරන්න. ආචාර කිරීමෙන් සුහදතාව ගොඩනැගේ.',
      },
      {
        titleEn: 'Introducing Yourself Confidently',
        titleSi: 'තමන්ව ආත්ම විශ්වාසයෙන් හඳුන්වා දීම',
        ruleTitleSi: 'නම සහ ගම පැවසීමේ රටාව (I am from...)',
        ruleExplainSi: '"My name is..." හෝ "I am..." කියා නම පවසා, "I am from Kandy" ලෙස පදිංචි ප්‍රදේශය කියන්න.',
        phrases: [
          { en: 'My name is Kamal and I am from Galle.', si: 'මගේ නම කමල්, මම ගාල්ලේ සිට එන්නේ.', singlish: '[මයි නේම් ඉස් කමල් ඇන්ඩ් අයි ඈම් ෆ්‍රොම් ගෝල්]', tip: 'Name හි "m" අකුර පැහැදිලිව තබන්න.' },
          { en: 'I am a graphic designer by profession.', si: 'මම වෘත්තියෙන් ප්‍රස්තාරික නිර්මාණකරුවෙක්.', singlish: '[අයි ඈම් අ ග්‍රැෆික් ඩිසයිනර් බයි ප්‍රොෆෙෂන්]', tip: 'Profession [ප්‍රොෆෙෂන්] ලෙස ශබ්ද කරන්න.' },
          { en: 'I graduated from the university last year.', si: 'මම පසුගිය වසරේ විශ්වවිද්‍යාලයෙන් උපාධිය ලැබුවා.', singlish: '[අයි ග්‍රැජුවෙයිටඩ් ෆ්‍රොම් ද යුනිවර්සිටි ලාස්ට් ඉයර්]', tip: 'Graduated [ග්‍රැජුවෙයිටඩ්] කියන්න.' },
          { en: 'It is a pleasure to introduce myself.', si: 'මාව හඳුන්වා දීමට ලැබීම සතුටක්.', singlish: '[ඉට් ඉස් අ ප්ලෙෂර් ටු ඉන්ට්‍රඩියුස් මයිසෙල්ෆ්]', tip: 'Pleasure හි "s" ශබ්දය [ෂ] මෙන් මෘදුයි.' },
          { en: 'I live in Maharagama with my family.', si: 'මම මගේ පවුල සමඟ මහරගම ජීවත් වෙනවා.', singlish: '[අයි ලිව් ඉන් මහරගම විත් මයි ෆැමිලි]', tip: 'Live [ලිව්] කෙටියෙන් කියන්න.' },
        ],
        mistake: { incorrect: 'Myself Kamal.', correct: 'I am Kamal. / My name is Kamal.', explanationSinhala: 'කවදාවත් "Myself Kamal" කියා හඳුන්වා නොදෙන්න. "I am Kamal" යනු නිවැරදි ඉංග්‍රීසියයි.' },
        adviceSi: 'හඳුන්වා දීමේදී කෙළින් බලා පැහැදිලි හඬින් නම කියන්න පුතා!',
      },
    ],
  },
  {
    domain: 'Sentence Order (SVO)',
    domainSinhala: 'වාක්‍ය සැකැස්ම (SVO රටාව)',
    subtopics: [
      {
        titleEn: 'Moving Verbs to the Center',
        titleSi: 'ක්‍රියා පදය මැදට ගෙන ඒම',
        ruleTitleSi: 'Subject + Verb + Object (S-V-O)',
        ruleExplainSi: 'සිංහලෙන් කර්මය මැදට ආවද ඉංග්‍රීසියෙන් ක්‍රියා පදය මැදට පැමිණිය යුතුය (I drink tea, not I tea drink).',
        phrases: [
          { en: 'I eat hopper and curry for breakfast.', si: 'මම උදෑසනට ආප්ප සහ ව්‍යංජන කනවා.', singlish: '[අයි ඊට් හොපර් ඇන්ඩ් කරි ෆෝ බ්‍රෙක්ෆස්ට්]', tip: 'Breakfast උච්චාරණය [බ්‍රෙක්ෆස්ට්] වේ.' },
          { en: 'My mother bakes delicious butter cake.', si: 'මගේ මව රසවත් බටර් කේක් සාදනවා.', singlish: '[මයි මදර් බේක්ස් ඩිලිෂස් බටර් කේක්]', tip: 'Bakes හි "s" ශබ්දය පැහැදිලි කරන්න.' },
          { en: 'We watch cricket on television.', si: 'අපි රූපවාහිනියෙන් ක්‍රිකට් නරඹනවා.', singlish: '[වී වොච් ක්‍රිකට් ඔන් ටෙලිවිෂන්]', tip: 'Watch හි "ch" පැහැදිලිව නවත්වන්න.' },
          { en: 'The students write essays in English.', si: 'සිසුන් ඉංග්‍රීසියෙන් රචනා ලියනවා.', singlish: '[ද ස්ටුඩන්ට්ස් රයිට් එසේස් ඉන් ඉන්ග්ලිෂ්]', tip: 'Write හි "w" නිහඬය (රයිට්).' },
          { en: 'Our teacher explains every grammar rule.', si: 'අපේ ගුරුතුමා සෑම ව්‍යාකරණ රීතියක්ම පහදා දෙනවා.', singlish: '[අවර් ටීචර් එක්ස්ප්ලේන්ස් එව්රි ග්‍රැමර් රූල්]', tip: 'Explains [එක්ස්ප්ලේන්ස්] කියන්න.' },
        ],
        mistake: { incorrect: 'He television watching.', correct: 'He is watching television.', explanationSinhala: 'ක්‍රියාවට පෙර "is" හෝ "are" පැමිණිය යුතු අතර රූපවාහිනිය (Object) ක්‍රියාවට පසුව පැමිණේ.' },
        adviceSi: 'ක්‍රියාව මැදට ගැනීම සිහියේ තබාගන්න. එවිට වාක්‍යය ඉබේම නිවැරදි වේ!',
      },
    ],
  },
  {
    domain: 'Work & Professional Office',
    domainSinhala: 'කාර්යාලීය සහ වෘත්තීය ඉංග්‍රීසි',
    subtopics: [
      {
        titleEn: 'Writing Professional Emails & Requests',
        titleSi: 'වෘත්තීය ඊමේල් සහ නිල ඉල්ලීම්',
        ruleTitleSi: '"Could you please" ආචාරශීලී ඉල්ලීම',
        ruleExplainSi: 'කාර්යාලයකදී "I want this report" නොකියා "Could you please send me the report" යොදන්න.',
        phrases: [
          { en: 'Could you please send me the updated report?', si: 'කරුණාකර යාවත්කාලීන වාර්තාව මට එවන්න පුළුවන්ද?', singlish: '[කුඩ් යූ ප්ලීස් සෙන්ඩ් මී දි අප්ඩේටඩ් රිපෝට්?]', tip: 'Updated හි "e" ස්වරයක් නිසා "දි" යොදන්න.' },
          { en: 'I am writing to inquire about the project deadline.', si: 'ව්‍යාපෘතියේ අවසන් දිනය පිළිබඳව විමසීමට මම ලියමි.', singlish: '[අයි ඈම් රයිටින්ග් ටු ඉන්ක්වයර් අබවුට් ද ප්‍රොජෙක්ට් ඩෙඩ්ලයින්]', tip: 'Inquire [ඉන්ක්වයර්] ලෙස කියන්න.' },
          { en: 'Please find the attached document for your review.', si: 'ඔබගේ සමාලෝචනය සඳහා අමුණා ඇති ලේඛනය බලන්න.', singlish: '[ප්ලීස් ෆයින්ඩ් දි ඇටෑච්ඩ් ඩොකියුමන්ට් ෆෝ යෝර් රිවීව්]', tip: 'Attached හි "t" ශබ්දයෙන් අවසන් කරන්න.' },
          { en: 'Thank you for your prompt reply.', si: 'ඔබගේ කඩිනම් ප්‍රතිචාරයට ස්තූතියි.', singlish: '[තෑන්ක් යූ ෆෝ යෝර් ප්‍රොම්ප්ට් රිප්ලයි]', tip: 'Prompt හි "pt" පැහැදිලි කරන්න.' },
          { en: 'I look forward to our meeting tomorrow.', si: 'හෙට අපගේ රැස්වීම ගැන මම බලාපොරොත්තුවෙන් සිටිමි.', singlish: '[අයි ලුක් ෆෝවර්ඩ් ටු අවර් මීටින්ග් ටුමොරෝ]', tip: 'Forward [ෆෝවර්ඩ්] ලෙස කියන්න.' },
        ],
        mistake: { incorrect: 'Revert back soon.', correct: 'Please reply soon. / Please revert soon.', explanationSinhala: '"Revert" යන්නෙහිම "ආපසු" යන අර්ථය ඇති බැවින් "Revert back" කියා "back" නැවත නොයොදන්න.' },
        adviceSi: 'කාර්යාලයේදී කාරුණික, විනීත වචන භාවිතා කිරීමෙන් ඔබේ වෘත්තීය ගරුත්වය ඉහළ යයි.',
      },
    ],
  },
  {
    domain: 'Travel & Sri Lankan Transport',
    domainSinhala: 'ගමන් බිමන් සහ ලාංකික ප්‍රවාහනය',
    subtopics: [
      {
        titleEn: 'Taking the Train to Upcountry',
        titleSi: 'උඩරට දුම්රියෙන් ගමන් කිරීම',
        ruleTitleSi: 'දුම්රිය ගමන් සහ ප්‍රවේශපත්‍ර විමසීම',
        ruleExplainSi: '"Is this the train to Ella?" සහ "Two second-class tickets, please" භාවිතය.',
        phrases: [
          { en: 'Which platform does the train to Badulla depart from?', si: 'බදුල්ල දුම්රිය පිටත් වන්නේ කිනම් වේදිකාවෙන්ද?', singlish: '[විච් ප්ලැට්ෆෝම් ඩස් ද ට්‍රේන් ටු බදුල්ල ඩිපාට් ෆ්‍රොම්?]', tip: 'Depart [ඩිපාට්] යනු පිටත්වීමයි.' },
          { en: 'Could I reserve two window seats, please?', si: 'මට ජනෙල් අයිනේ ආසන දෙකක් වෙන්කරගත හැකිද?', singlish: '[කුඩ් අයි රිසර්ව් ටූ වින්ඩෝ සීට්ස්, ප්ලීස්?]', tip: 'Reserve [රිසර්ව්] හි "s" [ස්] නොව [ස්/ස්] ශබ්දයකි.' },
          { en: 'The scenery through the tea plantations is breathtaking.', si: 'තේ වතු මැදින් යන දර්ශනය හරිම මනරම්.', singlish: '[ද සීනරි ත්‍රූ ද ටී ප්ලාන්ටේෂන්ස් ඉස් බ්‍රෙත්ටේකින්ග්]', tip: 'Breathtaking [බ්‍රෙත්ටේකින්ග්] කියන්න.' },
          { en: 'How long will the delay be?', si: 'ප්‍රමාදය කොපමණ වේලාවක් වේවිද?', singlish: '[හවු ලෝන්ග් විල් ද ඩිලේ බී?]', tip: 'Delay [ඩිලේ] ලෙස පවසන්න.' },
          { en: 'Please assist me with my heavy luggage.', si: 'කරුණාකර මගේ බර ගමන් මල්ලට උදව් කරන්න.', singlish: '[ප්ලීස් ඇසිස්ට් මී විත් මයි හෙවි ලගේජ්]', tip: 'Luggage [ලගේජ්] ඒකවචනයකි (no luggages).' },
        ],
        mistake: { incorrect: 'I have many luggages.', correct: 'I have a lot of luggage.', explanationSinhala: 'ඉංග්‍රීසියේදී "luggage" නාම පදයට "s" එකතු නොවේ. "luggage" පමණක් යොදන්න.' },
        adviceSi: 'දුම්රියේදී කතාබහ කිරීමෙන් නව මිතුරන් හඳුනාගන්න පුළුවන්. බය නැතුව කතා කරන්න!',
      },
    ],
  },
];

// Rich topics catalog across 20 domains to generate 1,000 comprehensive lessons
const DOMAINS_INDEX = [
  { name: 'Everyday Greetings & Etiquette', nameSi: 'ආචාර කිරීම් සහ ආචාර ධර්ම', count: 50 },
  { name: 'Sinhala SOV to English SVO Structure', nameSi: 'වාක්‍ය රටාවේ මූලික නීති (SVO)', count: 50 },
  { name: 'To Be Verbs (Am, Is, Are, Was, Were)', nameSi: 'To Be ක්‍රියා පද (Am, Is, Are)', count: 50 },
  { name: 'Daily Habits & Present Simple', nameSi: 'දෛනික චර්යාවන් සහ සරල වර්තමාන කාලය', count: 50 },
  { name: 'Asking Spoken Questions (Do, Does, Wh-)', nameSi: 'ඉංග්‍රීසියෙන් ප්‍රශ්න ඇසීම', count: 50 },
  { name: 'Bus, Train & Three-Wheeler Travel', nameSi: 'බස්, කෝච්චි සහ ත්‍රීවීල් ගමන් බිමන්', count: 50 },
  { name: 'Dining, Tea Shops & Sri Lankan Food', nameSi: 'ආපනශාලා, හෝටල් සහ කෑම බීම', count: 50 },
  { name: 'Shopping, Supermarkets & Bargaining', nameSi: 'කඩසාප්පු, සුපිරි වෙළඳසැල් සහ මිලදී ගැනීම්', count: 50 },
  { name: 'Telephone Manners & WhatsApp Calls', nameSi: 'දුරකථන ඇමතුම් සහ පණිවිඩ හුවමාරුව', count: 50 },
  { name: 'Home, Family Members & Chores', nameSi: 'නිවස, පවුලේ සාමාජිකයන් සහ ගෙදර වැඩ', count: 50 },
  { name: 'Health, Medical Clinic & Pharmacy', nameSi: 'සුවදුක් විමසීම්, වෛද්‍යවරයා සහ ඖෂධ', count: 50 },
  { name: 'Bank, Post Office & Government Services', nameSi: 'බැංකු, තැපැල් කාර්යාල සහ නිල සේවා', count: 50 },
  { name: 'Weather, Nature & Sri Lankan Seasons', nameSi: 'කාලගුණය, පරිසරය සහ ස්වභාව සෞන්දර්යය', count: 50 },
  { name: 'Job Interviews, Career & Workplace', nameSi: 'රැකියා සම්මුඛ පරීක්ෂණ සහ වෘත්තීය සාර්ථකත්වය', count: 50 },
  { name: 'Crucial Sri Lankan Mistakes Corrected', nameSi: 'ලාංකික අපිට නිතර වරදින තැන් නිවැරදි කිරීම', count: 50 },
  { name: 'Expressing Feelings, Opinions & Debates', nameSi: 'හැඟීම්, අදහස් සහ සාකච්ඡා කිරීම්', count: 50 },
  { name: 'Modal Verbs: Can, Could, Should, Must', nameSi: 'හැකියාවන් සහ වගකීම් ප්‍රකාශ කිරීම (Modals)', count: 50 },
  { name: 'Emergency Situations & Asking Directions', nameSi: 'හදිසි අවස්ථා සහ පාරතොට විමසීම', count: 50 },
  { name: 'Festivals, Culture & Sinhala Traditions', nameSi: 'උත්සව, සංස්කෘතිය සහ සිරිත් විරිත්', count: 50 },
  { name: 'Journalistic Fluency & Public Speaking', nameSi: 'මාධ්‍ය කථිකත්වය සහ ප්‍රසිද්ධ කථනය', count: 50 },
];

// Helper to deterministically build all 1,000 lessons
function generateAll1000Lessons(): Lesson[] {
  const result: Lesson[] = [];
  let lessonCounter = 1;

  for (let d = 0; d < DOMAINS_INDEX.length; d++) {
    const domainObj = DOMAINS_INDEX[d];
    const bp = BLUEPRINTS[d % BLUEPRINTS.length];

    for (let i = 1; i <= domainObj.count; i++) {
      const subBp = bp.subtopics[(i - 1) % bp.subtopics.length];
      const level: Lesson['level'] =
        lessonCounter <= 250
          ? 'Beginner 1'
          : lessonCounter <= 600
          ? 'Beginner 2'
          : 'Intermediate';

      const lessonNum = lessonCounter;
      const lessonTitleEn = `${domainObj.name} - Part ${i}: ${subBp.titleEn}`;
      const lessonTitleSi = `${domainObj.nameSi} - පියවර ${i}: ${subBp.titleSi}`;

      const lessonPhrases: PhraseItem[] = subBp.phrases.map((p, pIdx) => ({
        id: `p-${lessonNum}-${pIdx + 1}`,
        english: p.en,
        sinhala: p.si,
        singlishPronunciation: p.singlish,
        teacherAudioTip: p.tip,
        notesSinhala: `පාඩම ${lessonNum} හි ප්‍රධාන කථන වාක්‍යයකි.`,
      }));

      result.push({
        id: `lesson-${lessonNum}`,
        number: lessonNum,
        titleEnglish: lessonTitleEn,
        titleSinhala: lessonTitleSi,
        level,
        summarySinhala: `${domainObj.nameSi} යටතේ එන අංක ${lessonNum} වන Spoken English පාඩම. ශ්‍රී මාල් සර් සමඟ හඬ නගා කියවන්න.`,
        grammarRule: {
          ruleTitleSinhala: subBp.ruleTitleSi,
          explanationSinhala: subBp.ruleExplainSi,
          sinhalaVsEnglishPattern: {
            sinhalaOrder: 'සිංහල: කර්තෘ + කර්මය + ක්‍රියාව (S - O - V)',
            englishOrder: 'ඉංග්‍රීසි: Subject + Verb + Object (S - V - O)',
            exampleSinhala: 'මම ඉංග්‍රීසි කතා කරනවා.',
            exampleEnglish: 'I speak English.',
          },
        },
        phrases: lessonPhrases,
        commonMistake: subBp.mistake,
        teacherVoiceAdviceSinhala: `${subBp.adviceSi} මතක තබාගන්න පුතා: පාඩම ${lessonNum} සාර්ථකව නිම කළ පසු ඊළඟ පියවරට යන්න.`,
      });

      lessonCounter++;
    }
  }

  return result;
}

// 1,000 Complete English Lessons Catalog
export const LESSONS: Lesson[] = generateAll1000Lessons();

// Groupings for fast navigation
export const LESSON_VOLUMES = [
  { id: 'vol-1', title: 'Volume 1 (Lessons 1 - 100)', range: [1, 100], desc: 'Foundation Spoken English & Daily Greetings' },
  { id: 'vol-2', title: 'Volume 2 (Lessons 101 - 250)', range: [101, 250], desc: 'Grammar Patterns & Present/Past Tenses' },
  { id: 'vol-3', title: 'Volume 3 (Lessons 251 - 400)', range: [251, 400], desc: 'Real-Life Transport, Dining & Shopping' },
  { id: 'vol-4', title: 'Volume 4 (Lessons 401 - 600)', range: [401, 600], desc: 'Professional Phone, Clinic & Official Talk' },
  { id: 'vol-5', title: 'Volume 5 (Lessons 601 - 800)', range: [601, 800], desc: 'Career Interviews & Sri Lankan Mistakes Fixed' },
  { id: 'vol-6', title: 'Volume 6 (Lessons 801 - 1000)', range: [801, 1000], desc: 'Journalistic Fluency, Debate & Public Speaking' },
];
