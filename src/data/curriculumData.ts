import type { CommonMistakeItem, Lesson, PhraseItem } from '../types';
import { FOUNDATION_LESSONS } from './foundationLessons';
import { FOUNDATION_GUIDES, FOUNDATION_LESSON_MISTAKES, FOUNDATION_PRACTICE_PROMPTS } from './foundationGuides';
import { FOUNDATION_LESSON_VOCABULARY } from './foundationVocabulary';
import { enhanceEverydayLesson } from './everydayLessons';
import { enhanceGrammarLesson } from './grammarLessons';
import { refineFoundationModel } from './foundationRefinements';

/**
 * The curriculum is organised as 10 volumes × 10 modules × 10 lessons.
 * Each module has one teachable language purpose and each numbered lesson has
 * a different objective, vocabulary combination and assessment source phrase.
 * This keeps navigation stable while making the progression explicit.
 */
type Pattern =
  | 'present' | 'be' | 'count' | 'question' | 'past' | 'past-be' | 'past-continuous'
  | 'future' | 'continuous' | 'perfect' | 'comparison' | 'modal'
  | 'polite' | 'conditional' | 'passive' | 'reported' | 'relative'
  | 'gerund' | 'formal' | 'review';

type ModuleBlueprint = {
  name: string;
  nameSi: string;
  topic: string;
  topicSi: string;
  pattern: Pattern;
};

type VolumeBlueprint = {
  title: string;
  description: string;
  modules: ModuleBlueprint[];
};

const module = (name: string, nameSi: string, topic: string, topicSi: string, pattern: Pattern): ModuleBlueprint => ({
  name, nameSi, topic, topicSi, pattern,
});

const VOLUMES: VolumeBlueprint[] = [
  {
    title: 'Volume 1 · English Foundations',
    description: 'Greetings, sentence order, basic grammar and confident first conversations',
    modules: [
      module('Greetings & Introductions', 'ආචාර සහ හඳුන්වාදීම්', 'greetings and introductions', 'ආචාර සහ හඳුන්වාදීම්', 'present'),
      module('Personal Information', 'පෞද්ගලික තොරතුරු', 'personal information', 'පෞද්ගලික තොරතුරු', 'be'),
      module('Pronouns & SVO Order', 'සර්වනාම සහ SVO රටාව', 'simple subject-verb-object sentences', 'සරල කර්තෘ-ක්‍රියා-කර්ම වාක්‍ය', 'present'),
      module('Nouns & Articles', 'නාමපද සහ articles', 'people, places and everyday things', 'පුද්ගලයන්, ස්ථාන සහ දේවල්', 'count'),
      module('This, That, These, Those', 'මේ, ඒ, මේවා, ඒවා', 'things near and far', 'ළඟ සහ දුර ඇති දේවල්', 'be'),
      module('Possession & Family', 'අයිතිය සහ පවුල', 'family members and personal belongings', 'පවුලේ අය සහ පෞද්ගලික දේපළ', 'be'),
      module('Present Simple Routines', 'සරල වර්තමාන චර්යා', 'daily routines and regular actions', 'දෛනික චර්යා සහ නිතර කරන ක්‍රියා', 'present'),
      module('Negatives & Short Answers', 'නිෂේධ වාක්‍ය සහ කෙටි පිළිතුරු', 'negative everyday statements', 'දෛනික නිෂේධ ප්‍රකාශ', 'present'),
      module('Basic Questions', 'මූලික ප්‍රශ්න', 'yes-no and WH- questions', 'ඔව්-නැහැ සහ WH ප්‍රශ්න', 'question'),
      module('Time, Dates & Numbers', 'වේලාව, දිනය සහ සංඛ්‍යා', 'time, dates and numbers', 'වේලාව, දිනයන් සහ සංඛ්‍යා', 'review'),
    ],
  },
  {
    title: 'Volume 2 · Everyday Communication',
    description: 'Home, family, food, shopping, travel, school, work, health and plans',
    modules: [
      module('Describing Family', 'පවුල විස්තර කිරීම', 'family roles and personalities', 'පවුලේ භූමිකා සහ ගතිගුණ', 'be'),
      module('Rooms & Household Objects', 'කාමර සහ ගෘහ භාණ්ඩ', 'rooms, furniture and household objects', 'කාමර, ගෘහ භාණ්ඩ සහ ගෙදර දේවල්', 'present'),
      module('Food & Drink', 'ආහාර සහ බීම', 'meals, ingredients and drinks', 'ආහාර, අමුද්‍රව්‍ය සහ බීම', 'count'),
      module('Shopping & Prices', 'සාප්පු සවාරි සහ මිල', 'shopping, prices and quantities', 'සාප්පු සවාරි, මිල සහ ප්‍රමාණ', 'polite'),
      module('Asking for Directions', 'දිශා විමසීම', 'asking for and giving walking directions', 'පයින් යන මාර්ග විමසීම සහ මඟ පෙන්වීම', 'modal'),
      module('School & Classroom English', 'පාසල් සහ පන්ති කාමර ඉංග්‍රීසි', 'classroom instructions and learning', 'පන්ති උපදෙස් සහ ඉගෙනීම', 'modal'),
      module('Work & Jobs', 'රැකියා සහ වැඩ', 'jobs, duties and workplaces', 'රැකියා, වගකීම් සහ සේවා ස්ථාන', 'present'),
      module('Health Basics', 'සෞඛ්‍ය මූලික කරුණු', 'body parts, symptoms and healthy habits', 'ශරීර කොටස්, රෝග ලක්ෂණ සහ සෞඛ්‍ය පුරුදු', 'modal'),
      module('Weather & Plans', 'කාලගුණය සහ සැලසුම්', 'weather conditions and weekend plans', 'කාලගුණ තත්ත්ව සහ සති අන්ත සැලසුම්', 'future'),
      module('Everyday Conversation Review', 'දෛනික සංවාද පුනරීක්ෂණය', 'a complete everyday conversation', 'සම්පූර්ණ දෛනික සංවාදයක්', 'review'),
    ],
  },
  {
    title: 'Volume 3 · Intermediate Grammar',
    description: 'Past, future, continuous, perfect, comparison and connected speech',
    modules: [
      module('Past Be: Was & Were', 'අතීත be: was සහ were', 'past states, descriptions and locations', 'අතීත තත්ත්ව, විස්තර සහ ස්ථාන', 'past-be'),
      module('Past Regular Verbs', 'නිත්‍ය අතීත ක්‍රියා පද', 'completed regular actions', 'නිම කළ නිත්‍ය ක්‍රියා', 'past'),
      module('Past Irregular Verbs', 'අනිත්‍ය අතීත ක්‍රියා පද', 'common irregular past actions', 'සාමාන්‍ය අනිත්‍ය අතීත ක්‍රියා', 'past'),
      module('Past Questions & Stories', 'අතීත ප්‍රශ්න සහ කතා', 'questions about yesterday and last week', 'ඊයේ සහ පසුගිය සතිය පිළිබඳ ප්‍රශ්න', 'question'),
      module('Past Continuous', 'අතීත අඛණ්ඩ කාලය', 'actions in progress in the past', 'අතීතයේ සිදුවෙමින් තිබූ ක්‍රියා', 'past-continuous'),
      module('Will & Future Decisions', 'will සහ අනාගත තීරණ', 'predictions and instant future decisions', 'අනාවැකි සහ ක්ෂණික අනාගත තීරණ', 'future'),
      module('Going To Plans', 'going to සැලසුම්', 'planned future actions', 'සැලසුම් කළ අනාගත ක්‍රියා', 'future'),
      module('Present Continuous', 'වර්තමාන අඛණ්ඩ කාලය', 'actions happening now', 'දැන් සිදුවන ක්‍රියා', 'continuous'),
      module('Present Perfect', 'වර්තමාන පූර්ණ කාලය', 'life experience and recent results', 'ජීවන අත්දැකීම් සහ මෑත ප්‍රතිඵල', 'perfect'),
      module('Comparisons & Connectors', 'සංසන්දන සහ සම්බන්ධක', 'comparisons and connected ideas', 'සංසන්දන සහ සම්බන්ධ කළ අදහස්', 'comparison'),
    ],
  },
  {
    title: 'Volume 4 · Real-World Situations',
    description: 'Travel, telephone calls, banking, clinics, appointments and emergencies',
    modules: [
      module('Bus Tickets & Train Stations', 'බස් ටිකට් සහ දුම්රිය ස්ථාන', 'tickets, platforms and train-station announcements', 'ටිකට්, වේදිකා සහ දුම්රිය ස්ථාන නිවේදන', 'polite'),
      module('Tuk-Tuk & Taxi Directions', 'ත්‍රීරෝද රථ සහ ටැක්සි දිශා', 'hiring a tuk-tuk and giving directions', 'ත්‍රීරෝද රථයක් ගැනීම සහ දිශා දීම', 'polite'),
      module('Telephone Conversations', 'දුරකථන සංවාද', 'making and receiving telephone calls', 'දුරකථන ඇමතුම් ගැනීම සහ පිළිතුරු දීම', 'polite'),
      module('Banking & Payments', 'බැංකු සහ ගෙවීම්', 'banking services, cards and payments', 'බැංකු සේවා, කාඩ්පත් සහ ගෙවීම්', 'polite'),
      module('Clinic Visits', 'සායනික හමුවීම්', 'describing symptoms to a doctor', 'වෛද්‍යවරයකුට රෝග ලක්ෂණ පැවසීම', 'modal'),
      module('Pharmacy English', 'ඖෂධසාලා ඉංග්‍රීසි', 'asking for medicine and dosage advice', 'ඖෂධ සහ මාත්‍රා උපදෙස් ඉල්ලීම', 'polite'),
      module('Appointments & Schedules', 'හමුවීම් සහ කාලසටහන්', 'booking, changing and confirming appointments', 'හමුවීම් වෙන් කිරීම, වෙනස් කිරීම සහ තහවුරු කිරීම', 'future'),
      module('Customer Service', 'පාරිභෝගික සේවා', 'requests, complaints and solutions', 'ඉල්ලීම්, පැමිණිලි සහ විසඳුම්', 'polite'),
      module('Emergency Help', 'හදිසි උපකාර', 'asking for urgent help clearly', 'හදිසි උපකාර පැහැදිලිව ඉල්ලීම', 'modal'),
      module('Situation Role-Play Review', 'තත්ත්ව භූමිකා පුහුණුව', 'complete real-world role-plays', 'සම්පූර්ණ සැබෑ ජීවන භූමිකා පුහුණුව', 'review'),
    ],
  },
  {
    title: 'Volume 5 · Useful Vocabulary',
    description: 'Education, technology, environment, culture, relationships, money and media',
    modules: [
      module('Education & Learning', 'අධ්‍යාපනය සහ ඉගෙනීම', 'subjects, study habits and learning goals', 'විෂයයන්, අධ්‍යයන පුරුදු සහ ඉගෙනුම් ඉලක්ක', 'present'),
      module('Technology & Devices', 'තාක්ෂණය සහ උපාංග', 'phones, computers and digital actions', 'දුරකථන, පරිගණක සහ ඩිජිටල් ක්‍රියා', 'modal'),
      module('Environment & Nature', 'පරිසරය සහ ස්වභාවය', 'nature, pollution and protection', 'ස්වභාවය, දූෂණය සහ ආරක්ෂාව', 'conditional'),
      module('Sri Lankan Culture & Festivals', 'ශ්‍රී ලාංකික සංස්කෘතිය සහ උත්සව', 'customs, festivals and traditions', 'චාරිත්‍ර, උත්සව සහ සම්ප්‍රදාය', 'past'),
      module('Relationships & Social Life', 'සබඳතා සහ සමාජ ජීවිතය', 'friendship, family and social invitations', 'මිත්‍රත්වය, පවුල සහ සමාජ ආරාධනා', 'present'),
      module('Feelings & Emotions', 'හැඟීම් සහ චිත්තවේග', 'feelings, reactions and empathy', 'හැඟීම්, ප්‍රතිචාර සහ අනුකම්පාව', 'be'),
      module('Money & Personal Finance', 'මුදල් සහ පෞද්ගලික මූල්‍ය', 'saving, spending and budgeting', 'ඉතිරි කිරීම, වියදම් කිරීම සහ අයවැය', 'comparison'),
      module('News & Media', 'ප්‍රවෘත්ති සහ මාධ්‍ය', 'news, headlines and reliable information', 'ප්‍රවෘත්ති, සිරස්තල සහ විශ්වාසදායක තොරතුරු', 'reported'),
      module('Hobbies & Free Time', 'විනෝදාංශ සහ විවේක කාලය', 'sports, music, books and hobbies', 'ක්‍රීඩා, සංගීතය, පොත් සහ විනෝදාංශ', 'present'),
      module('Vocabulary in Conversation', 'සංවාදයේ වචන භාවිතය', 'choosing precise words in conversation', 'සංවාදයේ නිවැරදි වචන තේරීම', 'review'),
    ],
  },
  {
    title: 'Volume 6 · Sri Lankan Accuracy Clinic',
    description: 'Articles, prepositions, agreement, word order, collocations and pronunciation',
    modules: [
      module('Articles: A, An, The', 'articles: a, an, the', 'articles with everyday nouns', 'දෛනික නාමපද සමඟ articles', 'count'),
      module('Prepositions of Place', 'ස්ථාන prepositions', 'in, on, at and near', 'in, on, at සහ near', 'present'),
      module('Prepositions of Time', 'කාල prepositions', 'at, on, in, since and for', 'at, on, in, since සහ for', 'present'),
      module('Countable & Uncountable Nouns', 'ගණන් කළ හැකි සහ නොහැකි නාමපද', 'quantities, much, many and some', 'ප්‍රමාණ, much, many සහ some', 'count'),
      module('Subject-Verb Agreement', 'කර්තෘ-ක්‍රියා එකඟතාව', 'he, she, it and plural agreement', 'he, she, it සහ බහුවචන එකඟතාව', 'present'),
      module('English Word Order', 'ඉංග්‍රීසි වචන අනුපිළිවෙළ', 'correct English sentence order', 'නිවැරදි ඉංග්‍රීසි වාක්‍ය අනුපිළිවෙළ', 'present'),
      module('Natural Collocations', 'ස්වාභාවික වචන යුගල', 'make, do, take, have and get collocations', 'make, do, take, have සහ get යුගල', 'present'),
      module('Phrasal Verbs', 'phrasal verbs', 'common spoken phrasal verbs', 'සාමාන්‍ය කථන phrasal verbs', 'present'),
      module('Pronunciation & Stress', 'උච්චාරණය සහ අවධාරණය', 'word stress, endings and clear speech', 'වචන අවධාරණය, අවසාන ශබ්ද සහ පැහැදිලි කථනය', 'present'),
      module('Accuracy Review', 'නිවැරදි භාවිත පුනරීක්ෂණය', 'repairing frequent Sri Lankan English mistakes', 'ශ්‍රී ලාංකිකයන්ගේ නිතර සිදුවන වැරදි නිවැරදි කිරීම', 'review'),
    ],
  },
  {
    title: 'Volume 7 · Functional Fluency',
    description: 'Storytelling, descriptions, explanations, opinions, presentations and meetings',
    modules: [
      module('Telling Personal Stories', 'පෞද්ගලික කතා කීම', 'sequencing a personal story', 'පෞද්ගලික කතාවක් අනුපිළිවෙළින් කීම', 'past'),
      module('Describing People & Places', 'පුද්ගලයන් සහ ස්ථාන විස්තර කිරීම', 'clear descriptions with useful details', 'ප්‍රයෝජනවත් විස්තර සහිත පැහැදිලි විස්තර', 'be'),
      module('Explaining a Process', 'ක්‍රියාවලියක් පැහැදිලි කිරීම', 'steps, instructions and how things work', 'පියවර, උපදෙස් සහ දේවල් ක්‍රියා කරන ආකාරය', 'passive'),
      module('Giving Opinions', 'අදහස් ප්‍රකාශ කිරීම', 'personal opinions with reasons', 'හේතු සහිත පෞද්ගලික අදහස්', 'present'),
      module('Agreeing & Disagreeing', 'එකඟ වීම සහ එකඟ නොවීම', 'polite agreement and disagreement', 'විනීත එකඟතාව සහ එකඟ නොවීම', 'polite'),
      module('Clarifying & Checking', 'පැහැදිලි කිරීම සහ පරීක්ෂා කිරීම', 'asking someone to repeat or explain', 'නැවත කීමට හෝ පැහැදිලි කිරීමට ඉල්ලීම', 'question'),
      module('Summarising Information', 'තොරතුරු සාරාංශ කිරීම', 'main ideas and short summaries', 'ප්‍රධාන අදහස් සහ කෙටි සාරාංශ', 'reported'),
      module('Presentations', 'ඉදිරිපත් කිරීම්', 'opening, signposting and closing a presentation', 'ඉදිරිපත් කිරීමක් ආරම්භ කිරීම, පෙන්වීම සහ අවසන් කිරීම', 'formal'),
      module('Meetings & Team Talk', 'රැස්වීම් සහ කණ්ඩායම් කතා', 'suggestions, turn-taking and decisions', 'යෝජනා, කතා වාර සහ තීරණ', 'modal'),
      module('Fluency Role-Play Review', 'චතුර කථන භූමිකා පුහුණුව', 'longer practical conversations', 'දිගු ප්‍රායෝගික සංවාද', 'review'),
    ],
  },
  {
    title: 'Volume 8 · Upper-Intermediate Grammar',
    description: 'Conditionals, passive, reported speech, clauses, phrasal verbs and register',
    modules: [
      module('First Conditional', 'පළමු conditional', 'real future possibilities', 'සැබෑ අනාගත හැකියාවන්', 'conditional'),
      module('Second Conditional', 'දෙවන conditional', 'imaginary situations and advice', 'කල්පිත තත්ත්ව සහ උපදෙස්', 'conditional'),
      module('Passive Voice', 'passive voice', 'processes and formal information', 'ක්‍රියාවලි සහ විධිමත් තොරතුරු', 'passive'),
      module('Reported Statements', 'reported speech ප්‍රකාශ', 'reporting what someone said', 'කෙනෙකු කී දේ වාර්තා කිරීම', 'reported'),
      module('Relative Clauses', 'relative clauses', 'who, which, that and where', 'who, which, that සහ where', 'relative'),
      module('Gerunds & Infinitives', 'gerunds සහ infinitives', 'verb patterns after common verbs', 'සාමාන්‍ය ක්‍රියා පද පසු verb රටා', 'gerund'),
      module('Advanced Phrasal Verbs', 'උසස් phrasal verbs', 'separable and inseparable phrasal verbs', 'වෙන් කළ හැකි සහ නොහැකි phrasal verbs', 'present'),
      module('Discourse Markers', 'කථන සම්බන්ධක', 'however, therefore, although and meanwhile', 'however, therefore, although සහ meanwhile', 'formal'),
      module('Formal & Informal Register', 'විධිමත් සහ අවිධිමත් භාෂා රටා', 'choosing the right level of politeness', 'නිවැරදි විනීත මට්ටම තේරීම', 'polite'),
      module('Grammar in Extended Speech', 'දිගු කථනයේ ව්‍යාකරණ', 'combining advanced structures naturally', 'උසස් රටා ස්වාභාවිකව එකතු කිරීම', 'review'),
    ],
  },
  {
    title: 'Volume 9 · Study & Workplace English',
    description: 'Emails, interviews, meetings, negotiation, reports and problem-solving',
    modules: [
      module('Everyday Emails', 'දෛනික emails', 'clear subject lines and short emails', 'පැහැදිලි subject lines සහ කෙටි emails', 'formal'),
      module('Formal Requests', 'විධිමත් ඉල්ලීම්', 'polite formal requests and replies', 'විනීත විධිමත් ඉල්ලීම් සහ පිළිතුරු', 'polite'),
      module('CV & Job Interviews', 'CV සහ රැකියා සම්මුඛ පරීක්ෂණ', 'experience, strengths and achievements', 'අත්දැකීම්, ශක්තීන් සහ ජයග්‍රහණ', 'past'),
      module('Workplace Meetings', 'සේවා ස්ථාන රැස්වීම්', 'agenda items, updates and actions', 'agenda කරුණු, යාවත්කාලීන කිරීම් සහ ක්‍රියා', 'formal'),
      module('Negotiating Politely', 'විනීත සාකච්ඡා', 'offers, alternatives and agreement', 'යෝජනා, විකල්ප සහ එකඟතාව', 'polite'),
      module('Reports & Data', 'වාර්තා සහ දත්ත', 'describing trends and results', 'ප්‍රවණතා සහ ප්‍රතිඵල විස්තර කිරීම', 'comparison'),
      module('Professional Presentations', 'වෘත්තීය ඉදිරිපත් කිරීම්', 'signposting evidence and conclusions', 'සාක්ෂි සහ නිගමන පෙන්වීම', 'formal'),
      module('Problem-Solving Language', 'ගැටලු විසඳීමේ භාෂාව', 'causes, options and solutions', 'හේතු, විකල්ප සහ විසඳුම්', 'conditional'),
      module('Teamwork & Leadership', 'කණ්ඩායම් වැඩ සහ නායකත්වය', 'delegating, supporting and motivating', 'වැඩ පැවරීම, සහාය දීම සහ උනන්දු කිරීම', 'modal'),
      module('Workplace Fluency Review', 'සේවා ස්ථාන චතුර කථන පුනරීක්ෂණය', 'complete study and workplace tasks', 'සම්පූර්ණ අධ්‍යයන සහ සේවා ස්ථාන කාර්ය', 'review'),
    ],
  },
  {
    title: 'Volume 10 · Sri Lankan English Mastery',
    description: 'Tourism, heritage, public speaking, community, digital life and capstone fluency',
    modules: [
      module('Sri Lankan Tourism', 'ශ්‍රී ලාංකික සංචාරක ව්‍යාපාරය', 'welcoming and guiding visitors', 'අමුත්තන් පිළිගැනීම සහ මඟ පෙන්වීම', 'polite'),
      module('Heritage & History', 'උරුමය සහ ඉතිහාසය', 'describing places, history and culture', 'ස්ථාන, ඉතිහාසය සහ සංස්කෘතිය විස්තර කිරීම', 'past'),
      module('Public Speaking', 'ප්‍රසිද්ධ කථනය', 'opening and delivering a clear speech', 'පැහැදිලි කතාවක් ආරම්භ කර ඉදිරිපත් කිරීම', 'formal'),
      module('Community Conversations', 'ප්‍රජා සංවාද', 'local issues, requests and cooperation', 'ප්‍රාදේශීය ගැටලු, ඉල්ලීම් සහ සහයෝගය', 'modal'),
      module('Digital Safety', 'ඩිජිටල් ආරක්ෂාව', 'privacy, passwords and safe online behaviour', 'පෞද්ගලිකත්වය, passwords සහ ආරක්ෂිත online හැසිරීම', 'modal'),
      module('Entrepreneurship', 'ව්‍යවසායකත්වය', 'customers, products and small-business plans', 'ගනුදෙනුකරුවන්, නිෂ්පාදන සහ කුඩා ව්‍යාපාර සැලසුම්', 'future'),
      module('Leadership & Service', 'නායකත්වය සහ සේවය', 'leading with empathy and responsibility', 'අනුකම්පාව සහ වගකීම සහිත නායකත්වය', 'conditional'),
      module('Climate & Civic Action', 'දේශගුණය සහ පුරවැසි ක්‍රියා', 'community solutions for the environment', 'පරිසරය සඳහා ප්‍රජා විසඳුම්', 'conditional'),
      module('Cross-Cultural Communication', 'අන්තර් සංස්කෘතික සන්නිවේදනය', 'respectful communication across cultures', 'සංස්කෘති අතර ගෞරවාන්විත සන්නිවේදනය', 'polite'),
      module('Mastery Capstone', 'අවසාන ප්‍රවීණතා ව්‍යාපෘතිය', 'a confident spoken-English capstone', 'විශ්වාසයෙන් කරන spoken-English අවසාන ව්‍යාපෘතිය', 'review'),
    ],
  },
];

const STEP_BLUEPRINTS = [
  { title: 'Key vocabulary', titleSi: 'ප්‍රධාන වචන', goal: 'name and recognise the key words', goalSi: 'ප්‍රධාන වචන හඳුනාගෙන නම් කිරීම' },
  { title: 'Positive sentences', titleSi: 'ධනාත්මක වාක්‍ය', goal: 'make a clear positive sentence', goalSi: 'පැහැදිලි ධනාත්මක වාක්‍යයක් සෑදීම' },
  { title: 'Negative sentences', titleSi: 'නිෂේධ වාක්‍ය', goal: 'make a natural negative sentence', goalSi: 'ස්වාභාවික නිෂේධ වාක්‍යයක් සෑදීම' },
  { title: 'Asking questions', titleSi: 'ප්‍රශ්න ඇසීම', goal: 'ask a useful question', goalSi: 'ප්‍රයෝජනවත් ප්‍රශ්නයක් ඇසීම' },
  { title: 'Short answers', titleSi: 'කෙටි පිළිතුරු', goal: 'answer briefly and clearly', goalSi: 'කෙටියෙන් සහ පැහැදිලිව පිළිතුරු දීම' },
  { title: 'Time and place details', titleSi: 'වේලා සහ ස්ථාන විස්තර', goal: 'add a time or place detail', goalSi: 'වේලා හෝ ස්ථාන විස්තරයක් එකතු කිරීම' },
  { title: 'Joining ideas', titleSi: 'අදහස් සම්බන්ධ කිරීම', goal: 'join two ideas with a connector', goalSi: 'සම්බන්ධකයකින් අදහස් දෙකක් එකතු කිරීම' },
  { title: 'Repairing a common mistake', titleSi: 'සාමාන්‍ය වැරදි නිවැරදි කිරීම', goal: 'repair a common Sri Lankan English mistake', goalSi: 'ශ්‍රී ලාංකිකයන්ගේ සාමාන්‍ය ඉංග්‍රීසි වැරැද්දක් නිවැරදි කිරීම' },
  { title: 'Role-play language', titleSi: 'භූමිකා කථනය', goal: 'use the language in a practical role-play', goalSi: 'ප්‍රායෝගික භූමිකාවකදී භාෂාව භාවිත කිරීම' },
  { title: 'Personal fluency', titleSi: 'පෞද්ගලික චතුර කථනය', goal: 'give a short personal response confidently', goalSi: 'විශ්වාසයෙන් කෙටි පෞද්ගලික පිළිතුරක් දීම' },
];

type CuratedLesson = { title: string; titleSi: string; phrases: [string, string][] };
const CURATED_MISTAKES: Record<string, CommonMistakeItem> = {
  'Pronouns & SVO Order': {
    incorrect: 'I every morning drink tea.', correct: 'I drink tea every morning.',
    explanationSinhala: 'ඉංග්‍රීසි සරල වාක්‍යයක සාමාන්‍ය අනුපිළිවෙළ Subject + Verb + Object යි. කාලය හඟවන every morning වැනි කොටස බොහෝවිට වාක්‍යයේ අවසානයට යොදන්න.',
  },
  'Nouns & Articles': {
    incorrect: 'She is teacher.', correct: 'She is a teacher.',
    explanationSinhala: 'ඒකවචන countable නාමපදයක් තනිව භාවිත කළ නොහැක. teacher වැනි නාමපදයකට පෙර a හෝ an යොදන්න.',
  },
  'This, That, These, Those': {
    incorrect: 'These book is mine.', correct: 'These books are mine.',
    explanationSinhala: 'these සහ those බහුවචන නාමපද සමඟ යෙදේ. එබැවින් නාමපදයට බහුවචන -s යොදා are භාවිත කරන්න.',
  },
  'Possession & Family': {
    incorrect: 'This is mine brother.', correct: 'This is my brother.',
    explanationSinhala: 'නාමපදයකට පෙර අයිතිය දක්වන my, your, his, her වැනි possessive adjective යොදන්න. mine වැනි possessive pronoun එකක් නාමපදයක් ඉදිරියේ යොදන්නේ නැත.',
  },
  'Personal Information': {
    incorrect: 'Myself Kasun.', correct: 'I am Kasun. / My name is Kasun.',
    explanationSinhala: 'ස්වයං හැඳින්වීමකදී Myself Kasun නොකියන්න. I am Kasun හෝ My name is Kasun කියන්න.',
  },
  'Describing Family': {
    incorrect: 'My sister very kind.', correct: 'My sister is very kind.',
    explanationSinhala: 'පවුලේ කෙනෙකුගේ ගතිගුණ විස්තර කරන විට subject එකට පසු am, is හෝ are යොදන්න. He, she, it සහ ඒකවචන නාමපද සමඟ is යෙදේ.',
  },
  'Past Be: Was & Were': {
    incorrect: 'They was at the station yesterday.', correct: 'They were at the station yesterday.',
    explanationSinhala: 'අතීතයේ තත්ත්වයක් හෝ ස්ථානයක් ගැන කියන විට I/he/she/it සමඟ was ද, you/we/they සහ බහුවචන නාමපද සමඟ were ද යොදන්න. මෙහි ප්‍රශ්න සහ නිෂේධ සඳහා did භාවිත නොකරයි.',
  },
  'Past Regular Verbs': {
    incorrect: 'She didn’t visited her aunt.', correct: 'She didn’t visit her aunt.',
    explanationSinhala: 'didn’t පසු ප්‍රධාන ක්‍රියා පදයේ මූලික රූපය යොදන්න: didn’t visit. අතීත කාලය දැනටමත් did තුළ ඇත.',
  },
  'Past Irregular Verbs': {
    incorrect: 'He didn’t went to school.', correct: 'He didn’t go to school.',
    explanationSinhala: 'didn’t පසු අනිත්‍ය ක්‍රියා පදයේ අතීත රූපය නොව මූලික රූපය යොදන්න: go. went යනු did නොමැති ධනාත්මක අතීත වාක්‍යයකදී යෙදේ.',
  },
  'Present Simple Routines': {
    incorrect: 'She wake up at six.', correct: 'She wakes up at six.',
    explanationSinhala: 'Present simple හි he, she, it සමඟ ක්‍රියා පදයට s හෝ es එක් කරන්න.',
  },
  'Food & Drink': {
    incorrect: 'Give me rice.', correct: 'I would like some rice, please.',
    explanationSinhala: 'ආහාර ඇණවුම් කිරීමේදී සෘජු Give me වෙනුවට I would like... please යොදා විනීතව ඉල්ලන්න.',
  },
  'Shopping & Prices': {
    incorrect: 'How much these shoes?', correct: 'How much are these shoes?',
    explanationSinhala: 'බහුවචන භාණ්ඩයක මිල අසන විට are යොදා How much are these shoes? කියන්න.',
  },
  'Greetings & Introductions': {
    incorrect: 'Good night, how are you?', correct: 'Good evening, how are you?',
    explanationSinhala: 'Good night යනු සාමාන්‍යයෙන් නිදාගැනීමට හෝ සමුගැනීමට පෙර කියන වචනයකි. සවස කෙනෙකු හමුවන විට Good evening කියන්න.',
  },
  'Asking for Directions': {
    incorrect: 'Where the post office?', correct: 'Where is the post office?',
    explanationSinhala: 'ස්ථානයක් ගැන ප්‍රශ්නයක් අසන විට is හෝ are වැනි උපකාරක ක්‍රියා පදය අමතක නොකරන්න.',
  },
  'Bus Tickets & Train Stations': {
    incorrect: 'Which platform the train leaves from?', correct: 'Which platform does the train leave from?',
    explanationSinhala: 'Present simple ප්‍රශ්නයක ප්‍රධාන ක්‍රියාවට පෙර does යොදා, ක්‍රියා පදය මූලික රූපයෙන් තබන්න.',
  },
  'Negatives & Short Answers': {
    incorrect: 'She doesn’t likes tea.', correct: 'She doesn’t like tea.',
    explanationSinhala: 'doesn’t තුළම he/she/it සඳහා අවශ්‍ය s ලකුණ තිබෙන නිසා, ඉන් පසු ප්‍රධාන ක්‍රියා පදය මූලික රූපයෙන් යොදන්න: doesn’t like.',
  },
  'Basic Questions': {
    incorrect: 'Where you live?', correct: 'Where do you live?',
    explanationSinhala: 'Present simple ප්‍රශ්නයක do/does කර්තෘට පෙර යොදන්න. do හෝ does භාවිත කළ පසු ප්‍රධාන ක්‍රියා පදය මූලික රූපයෙන් තබන්න.',
  },
  'Time, Dates & Numbers': {
    incorrect: 'My birthday is in 12 June.', correct: 'My birthday is on 12 June.',
    explanationSinhala: 'නිශ්චිත දිනයක් සමඟ on යොදන්න. මාසයක් පමණක් කියන විට in යොදන්න: in June, on 12 June.',
  },
};

const FOUNDATION_GRAMMAR: Record<string, { titleSinhala: string; explanation: string; englishPattern: string }> = {
  'Negatives & Short Answers': {
    titleSinhala: 'සරල වර්තමානයේ නිෂේධ, ප්‍රශ්න සහ කෙටි පිළිතුරු',
    explanation: 'I/you/we/they සමඟ don’t ද, he/she/it සමඟ doesn’t ද යොදා මූලික ක්‍රියා පදය තබන්න. ප්‍රශ්නයේ Do/Does කර්තෘට පෙර යෙදේ; පිළිතුරේද එම auxiliary එක නැවත භාවිත වේ. be ක්‍රියා පදය සමඟ do/does නොයොදන්න.',
    englishPattern: 'Negative: Subject + don’t/doesn’t + base verb. Question: Do/Does + subject + base verb? Short answer: Yes/No + subject + do/does (not).',
  },
  'Basic Questions': {
    titleSinhala: 'ප්‍රශ්න වචන සහ ඉංග්‍රීසි ප්‍රශ්න අනුපිළිවෙළ',
    explanation: 'Be ක්‍රියා පදය තිබේ නම් am/is/are කර්තෘට පෙර තබන්න. අනෙක් present simple ක්‍රියා සඳහා Do/Does කර්තෘට පෙර යොදා මූලික ක්‍රියා පදය භාවිත කරන්න. WH- වචනය ප්‍රශ්නයේ මුලට යෙදේ.',
    englishPattern: 'WH-word + am/is/are + subject?  |  WH-word + do/does + subject + base verb?',
  },
  'Time, Dates & Numbers': {
    titleSinhala: 'වේලාව, දිනය සහ සංඛ්‍යා ප්‍රකාශන',
    explanation: 'වේලාවක් සමඟ at, සතියේ දිනයක් හෝ නිශ්චිත දිනයක් සමඟ on, මාසයක් හෝ වසරක් සමඟ in යොදන්න. මිල සහ ප්‍රමාණ අසන විට how much සහ how many වෙන වෙනම භාවිත කරන්න.',
    englishPattern: 'at + time; on + day/date; in + month/year; How much + uncountable noun?; How many + plural countable noun?',
  },
};

/** These high-frequency Sri Lankan learner situations are written as lessons,
 * not assembled by putting a generic verb in front of a topic label. */
const CURATED_LESSONS: Record<string, CuratedLesson[]> = {
  'This, That, These, Those': [
    { title: 'Point to one object nearby with this', titleSi: 'ළඟ ඇති එක දෙයක් this යොදා පෙන්වන්න', phrases: [
      ['This is my notebook.', 'මේ මගේ සටහන් පොත.'], ['This cup is still warm.', 'මේ කෝප්පය තවමත් උණුසුම්.'],
      ['This seat is free.', 'මේ ආසනය හිස්.'], ['Is this your umbrella?', 'මේ ඔබේ කුඩයද?'], ['This is the classroom entrance.', 'මේ පන්ති කාමරයේ පිවිසුම.'],
    ] },
    { title: 'Point to one object farther away with that', titleSi: 'දුර ඇති එක දෙයක් that යොදා පෙන්වන්න', phrases: [
      ['That is the bus to Colombo.', 'අර කොළඹට යන බස් රථය.'], ['That building is the town library.', 'අර ගොඩනැගිල්ල නගර පුස්තකාලය.'],
      ['Is that your father near the gate?', 'ගේට්ටුව අසල ඉන්නේ ඔබේ පියාද?'], ['That shop sells fresh bread.', 'අර වෙළඳසැල නැවුම් පාන් විකුණනවා.'],
      ['That road leads to the hospital.', 'අර පාර රෝහලට යනවා.'],
    ] },
    { title: 'Point to nearby plural objects with these', titleSi: 'ළඟ ඇති බහු දේ these යොදා පෙන්වන්න', phrases: [
      ['These mangoes are ripe.', 'මේ අඹ ඉදුණුයි.'], ['These books belong to the students.', 'මේ පොත් සිසුන්ට අයිතියි.'],
      ['These shoes are too small for me.', 'මේ සපත්තු මට කුඩා වැඩියි.'], ['Are these your keys?', 'මේ ඔබේ යතුරුද?'],
      ['These flowers smell wonderful.', 'මේ මල් ඉතා සුවඳයි.'],
    ] },
    { title: 'Point to distant plural objects with those', titleSi: 'දුර ඇති බහු දේ those යොදා පෙන්වන්න', phrases: [
      ['Those houses are near the lake.', 'අර ගෙවල් වැව ළඟයි.'], ['Those students are waiting for the school bus.', 'අර සිසුන් පාසල් බස් රථය එනතුරු බලාගෙන ඉන්නවා.'],
      ['Are those coconuts ready to pick?', 'අර පොල් කඩන්න සූදානම්ද?'], ['Those lights are at the railway station.', 'අර විදුලි පහන් තියෙන්නේ දුම්රිය ස්ථානයේ.'],
      ['Those are the files I need.', 'අර මට අවශ්‍ය ලිපිගොනු.'],
    ] },
    { title: 'Ask and answer what something is', titleSi: 'දෙයක් කුමක්දැයි අසා පිළිතුරු දෙන්න', phrases: [
      ['What is this?', 'මේ මොකක්ද?'], ['It is a spice box.', 'ඒ කුළුබඩු පෙට්ටියක්.'], ['What are those?', 'අරවා මොනවාද?'],
      ['They are the new library books.', 'ඒවා අලුත් පුස්තකාල පොත්.'], ['What is that beside the door?', 'අර දොර ළඟ තියෙන්නේ මොකක්ද?'],
    ] },
    { title: 'Use this and that with places', titleSi: 'ස්ථාන ගැන this සහ that යොදන්න', phrases: [
      ['This is our classroom.', 'මේ අපේ පන්ති කාමරය.'], ['That is the principal’s office.', 'අර විදුහල්පතිගේ කාර්යාලය.'],
      ['This is the road to the market.', 'මේ වෙළඳපොළට යන පාර.'], ['That is where the train stops.', 'දුම්රිය නවත්වන්නේ අර තැන.'],
      ['Is this the right platform?', 'මේ නිවැරදි වේදිකාවද?'],
    ] },
    { title: 'Describe colour and condition', titleSi: 'වර්ණය සහ තත්ත්වය විස්තර කරන්න', phrases: [
      ['This red bag is mine.', 'මේ රතු බෑගය මගේ.'], ['That old bridge is still safe.', 'අර පැරණි පාලම තවමත් ආරක්ෂිතයි.'],
      ['These green leaves are fresh.', 'මේ කොළ පැහැති කොළ නැවුම්.'], ['Those empty bottles can be recycled.', 'අර හිස් බෝතල් ප්‍රතිචක්‍රීකරණය කළ හැකියි.'],
      ['Is that blue umbrella yours?', 'අර නිල් කුඩය ඔබේද?'],
    ] },
    { title: 'Use this one and that one', titleSi: 'this one සහ that one යොදන්න', phrases: [
      ['I will take this one, please.', 'මම මේ එක ගන්නම්.'], ['That one is cheaper.', 'අර එක මිල අඩුයි.'],
      ['These are made of cotton.', 'මේවා කපු රෙදිවලින් හදලා.'], ['Those need to be washed.', 'අරවා සෝදන්න ඕනේ.'],
      ['Which one do you prefer, this one or that one?', 'ඔබ කැමති මේ එකටද අර එකටද?'],
    ] },
    { title: 'Use demonstratives in a shop', titleSi: 'වෙළඳසැලක demonstratives යොදන්න', phrases: [
      ['How much is this shirt?', 'මේ කමිසය කීයද?'], ['Do you have these in a larger size?', 'මේවා විශාල ප්‍රමාණයෙන් තිබෙනවාද?'],
      ['That colour looks better.', 'අර වර්ණය වඩා හොඳයි වගේ.'], ['I would like to try those shoes.', 'මට අර සපත්තු ඇඳලා බලන්න ඕනේ.'],
      ['Are these items on sale?', 'මේ භාණ්ඩ වට්ටමට විකුණනවාද?'],
    ] },
    { title: 'Choose the correct demonstrative', titleSi: 'නිවැරදි demonstrative එක තෝරන්න', phrases: [
      ['This is my seat, and that is yours.', 'මේ මගේ ආසනය, අරක ඔබේ.'], ['These are fresh, but those are overripe.', 'මේවා නැවුම්, නමුත් අරවා වැඩියෙන් ඉඳිලා.'],
      ['This road is shorter than that road.', 'මේ පාර අර පාරට වඩා කෙටියි.'], ['These bags are lighter than those bags.', 'මේ බෑග් අර බෑග්වලට වඩා සැහැල්ලුයි.'],
      ['That is the book I borrowed from you.', 'ඒ ඔබගෙන් මම ණයට ගත් පොත.'],
    ] },
  ],
  'Possession & Family': [
    { title: 'Use my, your, his and her', titleSi: 'my, your, his සහ her යොදන්න', phrases: [
      ['This is my younger sister.', 'මේ මගේ නංගි.'], ['Is that your school bag?', 'අර ඔබේ පාසල් බෑගයද?'],
      ['His father works in Galle.', 'ඔහුගේ පියා ගාල්ලේ වැඩ කරනවා.'], ['Her mother is a science teacher.', 'ඇගේ මව විද්‍යා ගුරුවරියක්.'],
      ['Our house is near the temple.', 'අපේ ගෙදර පන්සල අසලයි.'],
    ] },
    { title: 'Talk about brothers and sisters', titleSi: 'සහෝදර සහෝදරියන් ගැන කතා කරන්න', phrases: [
      ['I have two older brothers.', 'මට වැඩිමහල් සහෝදරයන් දෙදෙනෙක් ඉන්නවා.'], ['My sister studies at the university.', 'මගේ සහෝදරිය විශ්වවිද්‍යාලයේ ඉගෙන ගන්නවා.'],
      ['Their younger brother plays football.', 'ඔවුන්ගේ බාල සහෝදරයා පාපන්දු ක්‍රීඩා කරනවා.'], ['Does your brother live with you?', 'ඔබේ සහෝදරයා ඔබ සමඟ ජීවත් වෙනවාද?'],
      ['We help our little sister with her homework.', 'අපි අපේ නංගිට ගෙදර වැඩවලට උදව් කරනවා.'],
    ] },
    { title: 'Talk about parents and grandparents', titleSi: 'දෙමාපියන් සහ ආච්චි සීයා ගැන කියන්න', phrases: [
      ['My parents live in Negombo.', 'මගේ දෙමාපියන් ජීවත් වෙන්නේ මීගමුවේ.'], ['Her grandmother tells us stories.', 'ඇගේ ආච්චි අපට කතා කියනවා.'],
      ['His grandfather grows vegetables.', 'ඔහුගේ සීයා එළවළු වගා කරනවා.'], ['Our mother works at a clinic.', 'අපේ අම්මා සායනයක වැඩ කරනවා.'],
      ['Do your grandparents live nearby?', 'ඔබේ ආච්චි සීයා ළඟපාත ජීවත් වෙනවාද?'],
    ] },
    { title: 'Say who owns an object', titleSi: 'භාණ්ඩයක් අයිති කාටදැයි කියන්න', phrases: [
      ['This phone is mine.', 'මේ දුරකථනය මගේ.'], ['The blue umbrella is hers.', 'නිල් කුඩය ඇගේ.'],
      ['Those shoes are his.', 'අර සපත්තු ඔහුගේ.'], ['Is the red bicycle yours?', 'රතු බයිසිකලය ඔබේද?'],
      ['These books are ours, not theirs.', 'මේ පොත් අපේ, ඔවුන්ගේ නොවේ.'],
    ] },
    { title: 'Use possessive apostrophe s', titleSi: 'අයිතිය පෙන්වීමට apostrophe s යොදන්න', phrases: [
      ['This is my mother’s recipe.', 'මේ මගේ අම්මාගේ වට්ටෝරුව.'], ['Kamal’s bicycle is outside.', 'කමල්ගේ බයිසිකලය පිටත තිබෙනවා.'],
      ['The children’s shoes are by the door.', 'ළමයින්ගේ සපත්තු දොර ළඟයි.'], ['My parents’ room is upstairs.', 'මගේ දෙමාපියන්ගේ කාමරය උඩුමහලේ.'],
      ['Where is the teacher’s book?', 'ගුරුවරයාගේ පොත කොහෙද?'],
    ] },
    { title: 'Describe a family relationship', titleSi: 'පවුලේ සබඳතාවක් විස්තර කරන්න', phrases: [
      ['My aunt is my mother’s older sister.', 'මගේ නැන්දා මගේ අම්මාගේ වැඩිමහල් සහෝදරිය.'],
      ['Ruwan is my cousin.', 'රුවන් මගේ ඥාති සහෝදරයෙක්.'], ['She is the youngest child in the family.', 'ඇය පවුලේ බාලම දරුවා.'],
      ['Their uncle visits them every month.', 'ඔවුන්ගේ මාමා හැම මාසයකම ඔවුන් බලන්න එනවා.'],
      ['My niece starts school next year.', 'මගේ සහෝදරයාගේ දුව ලබන අවුරුද්දේ පාසල් යන්න පටන් ගන්නවා.'],
    ] },
    { title: 'Describe what family members do', titleSi: 'පවුලේ අය කරන දේ විස්තර කරන්න', phrases: [
      ['My father repairs radios as a hobby.', 'මගේ පියා විනෝදාංශයක් ලෙස රේඩියෝ අලුත්වැඩියා කරනවා.'],
      ['My sister helps our grandmother cook.', 'මගේ සහෝදරිය ආච්චිට උයන්න උදව් කරනවා.'],
      ['Our family visits the beach on holidays.', 'නිවාඩු දිනවල අපේ පවුල වෙරළට යනවා.'],
      ['Their parents run a small grocery shop.', 'ඔවුන්ගේ දෙමාපියන් කුඩා සිල්ලර වෙළඳසැලක් කරනවා.'],
      ['Who takes care of your garden?', 'ඔබේ වත්ත බලාගන්නේ කවුද?'],
    ] },
    { title: 'Ask about family members', titleSi: 'පවුලේ අය ගැන ප්‍රශ්න අසන්න', phrases: [
      ['How many people are there in your family?', 'ඔබේ පවුලේ කී දෙනෙක් ඉන්නවාද?'],
      ['What is your brother’s name?', 'ඔබේ සහෝදරයාගේ නම මොකක්ද?'], ['Where does your mother work?', 'ඔබේ අම්මා වැඩ කරන්නේ කොහේද?'],
      ['Are your grandparents at home?', 'ඔබේ ආච්චි සීයා ගෙදරද?'], ['Who is the oldest person in your family?', 'ඔබේ පවුලේ වැඩිමල්ම පුද්ගලයා කවුද?'],
    ] },
    { title: 'Talk about shared family belongings', titleSi: 'පවුලේ අය බෙදාගන්නා දේ ගැන කියන්න', phrases: [
      ['We share one computer at home.', 'අපි ගෙදරදී එක පරිගණකයක් බෙදාගෙන භාවිත කරනවා.'],
      ['This room is for my brothers and me.', 'මේ කාමරය මටයි මගේ සහෝදරයන්ටයි.'],
      ['The family car is parked behind the house.', 'පවුලේ මෝටර් රථය ගෙදර පිටුපස නවතා තිබෙනවා.'],
      ['Their dining table seats six people.', 'ඔවුන්ගේ කෑම මේසයේ හය දෙනෙකුට ඉඳගන්න පුළුවන්.'],
      ['We keep our important documents in this drawer.', 'අපි වැදගත් ලේඛන මේ ලාච්චුවේ තබනවා.'],
    ] },
    { title: 'Introduce your family to someone', titleSi: 'කෙනෙකුට ඔබේ පවුල හඳුන්වා දෙන්න', phrases: [
      ['This is my wife, Sanduni.', 'මේ මගේ බිරිඳ සඳුනි.'], ['These are our children, Dinu and Ravi.', 'මේ අපේ දරුවන් වන දිනු සහ රවි.'],
      ['My father is a retired teacher.', 'මගේ පියා විශ්‍රාමික ගුරුවරයෙක්.'], ['We all live together in Kurunegala.', 'අපි හැමෝම කුරුණෑගල එකට ජීවත් වෙනවා.'],
      ['My family is very important to me.', 'මගේ පවුල මට ඉතා වැදගත්.'],
    ] },
  ],
  'Pronouns & SVO Order': [
    { title: 'Name the subject with a pronoun', titleSi: 'කර්තෘ පුද්ගල නාම පදයකින් කියන්න', phrases: [
      ['I speak English with my neighbour.', 'මම මගේ අසල්වැසියා සමඟ ඉංග්‍රීසි කතා කරනවා.'], ['She reads the newspaper every morning.', 'ඇය හැම උදෑසනකම පුවත්පත කියවනවා.'],
      ['They play cricket after school.', 'ඔවුන් පාසලෙන් පසු ක්‍රිකට් ක්‍රීඩා කරනවා.'], ['We visit our grandparents on Sundays.', 'අපි ඉරිදා දිනවල අපේ ආච්චිලා සීයලා බලන්න යනවා.'],
      ['He works at the post office.', 'ඔහු තැපැල් කාර්යාලයේ වැඩ කරනවා.'],
    ] },
    { title: 'Put the verb after the subject', titleSi: 'කර්තෘට පසු ක්‍රියාව යොදන්න', phrases: [
      ['The children play in the garden.', 'ළමයි වත්තේ සෙල්ලම් කරනවා.'], ['My aunt sells vegetables at the market.', 'මගේ නැන්දා වෙළඳපොළේ එළවළු විකුණනවා.'],
      ['Our teacher explains the new lesson.', 'අපේ ගුරුවරයා අලුත් පාඩම පැහැදිලි කරනවා.'], ['The bus arrives at seven.', 'බස් රථය හතට එනවා.'],
      ['The dog follows its owner.', 'බල්ලා තම හිමිකරු පසුපස යනවා.'],
    ] },
    { title: 'Put the object after the verb', titleSi: 'ක්‍රියාවට පසු කර්මය යොදන්න', phrases: [
      ['I drink tea after lunch.', 'මම දිවා ආහාරයෙන් පසු තේ බොනවා.'], ['She writes a message to her friend.', 'ඇය මිතුරියට පණිවිඩයක් ලියනවා.'],
      ['We clean the classroom together.', 'අපි එකට පන්ති කාමරය පිරිසිදු කරනවා.'], ['He buys bread from the bakery.', 'ඔහු බේකරියෙන් පාන් මිලදී ගන්නවා.'],
      ['They watch a film on Saturday.', 'ඔවුන් සෙනසුරාදා චිත්‍රපටයක් නරඹනවා.'],
    ] },
    { title: 'Build a clear subject-verb-object sentence', titleSi: 'කර්තෘ-ක්‍රියා-කර්ම වාක්‍යයක් සාදන්න', phrases: [
      ['My sister cooks dinner.', 'මගේ සහෝදරිය රාත්‍රී ආහාරය උයනවා.'], ['The driver opens the bus door.', 'රියදුරු බස් දොර අරිනවා.'],
      ['Our team won the match.', 'අපේ කණ්ඩායම තරගය ජයගත්තා.'], ['The nurse checked my temperature.', 'හෙදිය මගේ උෂ්ණත්වය පරීක්ෂා කළා.'],
      ['The students completed their project.', 'සිසුන් ඔවුන්ගේ ව්‍යාපෘතිය සම්පූර්ණ කළා.'],
    ] },
    { title: 'Add a place to the sentence', titleSi: 'වාක්‍යයට ස්ථානයක් එකතු කරන්න', phrases: [
      ['I study English at the library.', 'මම පුස්තකාලයේදී ඉංග්‍රීසි ඉගෙන ගන්නවා.'], ['She buys fruit at the Sunday market.', 'ඇය ඉරිදා පොළෙන් පලතුරු මිලදී ගන්නවා.'],
      ['They play volleyball on the beach.', 'ඔවුන් වෙරළේ වොලිබෝල් ක්‍රීඩා කරනවා.'], ['We have lunch in the canteen.', 'අපි ආපනශාලාවේ දිවා ආහාරය ගන්නවා.'],
      ['My father repairs bicycles in his workshop.', 'මගේ පියා ඔහුගේ වැඩපොළේ බයිසිකල් අලුත්වැඩියා කරනවා.'],
    ] },
    { title: 'Add a time to the sentence', titleSi: 'වාක්‍යයට වේලාවක් එකතු කරන්න', phrases: [
      ['The shop opens at eight o’clock.', 'වෙළඳසැල අටට විවෘත වෙනවා.'], ['I call my mother every evening.', 'මම හැම සවසකම අම්මාට කතා කරනවා.'],
      ['The train leaves at 6:45.', 'දුම්රිය 6:45ට පිටත් වෙනවා.'], ['She practises the piano after school.', 'ඇය පාසලෙන් පසු පියානෝව පුහුණු කරනවා.'],
      ['We visited the temple last Friday.', 'අපි පසුගිය සිකුරාදා විහාරයට ගියා.'],
    ] },
    { title: 'Use object pronouns naturally', titleSi: 'කර්ම පුද්ගල නාම පද ස්වාභාවිකව යොදන්න', phrases: [
      ['Please call me after the meeting.', 'රැස්වීමෙන් පසු මට කතා කරන්න.'], ['I will meet her at the station.', 'මම ඇයව දුම්රිය ස්ථානයේදී හමුවන්නම්.'],
      ['The teacher helped us with the exercise.', 'ගුරුවරයා අභ්‍යාසයට අපට උදව් කළා.'], ['Can you give them the address?', 'ඔවුන්ට ලිපිනය දෙන්න පුළුවන්ද?'],
      ['My brother invited him to dinner.', 'මගේ සහෝදරයා ඔහුට රාත්‍රී ආහාරයට ආරාධනා කළා.'],
    ] },
    { title: 'Make a sentence longer without changing its order', titleSi: 'අනුපිළිවෙළ වෙනස් නොකර වාක්‍යය දිගු කරන්න', phrases: [
      ['The girl reads a book quietly in the classroom.', 'ගැහැණු ළමයා පන්ති කාමරයේ නිහඬව පොතක් කියවනවා.'],
      ['My uncle drives his van to the shop every morning.', 'මගේ මාමා හැම උදෑසනකම ඔහුගේ වෑන් රථය වෙළඳසැලට පදවනවා.'],
      ['We planted three mango trees behind our house.', 'අපි අපේ ගෙදර පිටුපස අඹ පැළ තුනක් සිටෙව්වා.'],
      ['The doctor explained the medicine to my father carefully.', 'වෛද්‍යවරයා මගේ පියාට බෙහෙත ගැන ප්‍රවේශමෙන් පැහැදිලි කළා.'],
      ['They are preparing a cultural show for the school concert.', 'ඔවුන් පාසල් ප්‍රසංගයට සංස්කෘතික වැඩසටහනක් සූදානම් කරනවා.'],
    ] },
    { title: 'Correct Sinhala-to-English word order', titleSi: 'සිංහලෙන් ඉංග්‍රීසියට වචන අනුපිළිවෙළ නිවැරදි කරන්න', phrases: [
      ['I drink milk before bed.', 'මම නින්දට පෙර කිරි බොනවා.'], ['She sent the documents yesterday.', 'ඇය ඊයේ ලේඛන යැව්වා.'],
      ['We watch the news after dinner.', 'අපි රාත්‍රී ආහාරයෙන් පසු ප්‍රවෘත්ති බලනවා.'], ['He gave the keys to his sister.', 'ඔහු යතුරු ඔහුගේ සහෝදරියට දුන්නා.'],
      ['The children carried their bags into the classroom.', 'ළමයි ඔවුන්ගේ බෑග් පන්ති කාමරයට ගෙන ගියා.'],
    ] },
    { title: 'Describe a simple action clearly', titleSi: 'සරල ක්‍රියාවක් පැහැදිලිව විස්තර කරන්න', phrases: [
      ['I open the window because the room is warm.', 'කාමරය රස්නෙ නිසා මම ජනේලය අරිනවා.'],
      ['She waters the plants because the soil is dry.', 'පස වියළි නිසා ඇය පැළවලට වතුර දානවා.'],
      ['My cousin teaches maths because he enjoys helping children.', 'දරුවන්ට උදව් කිරීමට කැමති නිසා මගේ ඥාති සහෝදරයා ගණිතය උගන්වනවා.'],
      ['The mechanic fixed our car because it would not start.', 'මෝටර් රථය පණ ගැන්වුණේ නැති නිසා කාර්මිකයා එය අලුත්වැඩියා කළා.'],
      ['We sent a thank-you card because our neighbour helped us.', 'අපේ අසල්වැසියා අපට උදව් කළ නිසා අපි ස්තුති කාඩ්පතක් යැව්වා.'],
    ] },
  ],
  'Nouns & Articles': [
    { title: 'Use a and an with singular nouns', titleSi: 'ඒකවචන නාමපද සමඟ a සහ an යොදන්න', phrases: [
      ['I saw a bird in the mango tree.', 'මම අඹ ගසේ කුරුල්ලෙක් දැක්කා.'], ['She bought an umbrella at the shop.', 'ඇය වෙළඳසැලෙන් කුඩයක් මිලදී ගත්තා.'],
      ['He is a university student.', 'ඔහු විශ්වවිද්‍යාල ශිෂ්‍යයෙක්.'], ['We waited for an hour.', 'අපි පැයක් බලාගෙන සිටියා.'],
      ['My aunt is an engineer.', 'මගේ නැන්දා ඉංජිනේරුවරියක්.'],
    ] },
    { title: 'Use the when the listener knows which one', titleSi: 'නිශ්චිත දෙයක් ගැන කතා කරන විට the යොදන්න', phrases: [
      ['Please close the door.', 'කරුණාකර දොර වහන්න.'], ['The bus to Galle is at the front gate.', 'ගාල්ලට යන බස් රථය ඉදිරිපස ගේට්ටුව අසලයි.'],
      ['I left my keys on the kitchen table.', 'මම මගේ යතුරු කුස්සියේ මේසය මත තැබුවා.'],
      ['The teacher gave us our exam papers.', 'ගුරුවරයා අපට විභාග පත්‍ර දුන්නා.'], ['Can you pass me the salt?', 'ලුණු ටික මට දෙන්න පුළුවන්ද?'],
    ] },
    { title: 'Use a and an with occupations', titleSi: 'රැකියා සමඟ a සහ an යොදන්න', phrases: [
      ['My sister is a doctor.', 'මගේ සහෝදරිය වෛද්‍යවරියක්.'], ['He is an electrician.', 'ඔහු විදුලි කාර්මිකයෙක්.'],
      ['Their neighbour is a police officer.', 'ඔවුන්ගේ අසල්වැසියා පොලිස් නිලධාරියෙක්.'], ['I want to become an architect.', 'මට ගෘහ නිර්මාණ ශිල්පියෙකු වීමට අවශ්‍යයි.'],
      ['She works as a hotel receptionist.', 'ඇය හෝටල් පිළිගැනීමේ නිලධාරිනියක් ලෙස වැඩ කරනවා.'],
    ] },
    { title: 'Use plural nouns without an article', titleSi: 'බහුවචන නාමපද සමඟ article නොයොදන්න', phrases: [
      ['Children need time to play.', 'ළමයින්ට සෙල්ලම් කිරීමට කාලය අවශ්‍යයි.'], ['Books are expensive this year.', 'මේ අවුරුද්දේ පොත් මිල වැඩියි.'],
      ['Dogs can hear sounds that people cannot.', 'මිනිසුන්ට ඇසෙන්නේ නැති ශබ්ද බල්ලන්ට ඇසෙනවා.'], ['Students use computers in the laboratory.', 'සිසුන් පර්යේෂණාගාරයේ පරිගණක භාවිත කරනවා.'],
      ['Mangoes grow well in this area.', 'මේ ප්‍රදේශයේ අඹ හොඳින් වැවෙනවා.'],
    ] },
    { title: 'Use the with rivers, seas and landmarks', titleSi: 'ගංගා, මුහුදු සහ සුවිශේෂී ස්ථාන සමඟ the යොදන්න', phrases: [
      ['The Mahaweli is the longest river in Sri Lanka.', 'මහවැලි ගඟ ශ්‍රී ලංකාවේ දිගම ගඟයි.'],
      ['We watched the sunset over the Indian Ocean.', 'අපි ඉන්දියානු සාගරයට ඉහළින් හිරු බැස යෑම නැරඹුවා.'],
      ['The bus stopped near the clock tower.', 'බස් රථය ඔරලෝසු කණුව අසල නැවැත්තුවා.'],
      ['The train crossed the bridge slowly.', 'දුම්රිය පාලම හරහා හෙමින් ගියා.'],
      ['They visited the Temple of the Tooth in Kandy.', 'ඔවුන් මහනුවර දළදා මාළිගාව නැරඹුවා.'],
    ] },
    { title: 'Use some and any with plural nouns', titleSi: 'බහුවචන සමඟ some සහ any යොදන්න', phrases: [
      ['We bought some oranges at the market.', 'අපි වෙළඳපොළෙන් දොඩම් කිහිපයක් මිලදී ගත්තා.'],
      ['Are there any clean cups in the cupboard?', 'අල්මාරියේ පිරිසිදු කෝප්ප තිබෙනවාද?'],
      ['There are some letters on your desk.', 'ඔබේ මේසය මත ලිපි කිහිපයක් තිබෙනවා.'],
      ['I do not have any questions.', 'මට කිසිදු ප්‍රශ්නයක් නැහැ.'],
      ['Would you like some biscuits with your tea?', 'තේ සමඟ බිස්කට් ටිකක් අවශ්‍යද?'],
    ] },
    { title: 'Use much and many with quantities', titleSi: 'ප්‍රමාණ සමඟ much සහ many යොදන්න', phrases: [
      ['How many passengers are on the bus?', 'බස් රථයේ මගීන් කී දෙනෙක් ඉන්නවාද?'],
      ['How much water should I drink?', 'මම වතුර කොපමණ බොන්න ඕනේද?'], ['There are not many seats left.', 'ආසන වැඩි ගණනක් ඉතිරි නැහැ.'],
      ['We do not have much time before the train leaves.', 'දුම්රිය පිටත් වීමට පෙර අපට වැඩි වෙලාවක් නැහැ.'],
      ['How many mangoes would you like?', 'ඔබට අඹ කීයක් අවශ්‍යද?'],
    ] },
    { title: 'Choose an article by sound', titleSi: 'ශබ්දය අනුව article එක තෝරන්න', phrases: [
      ['She is an honest person.', 'ඇය අවංක කෙනෙක්.'], ['I need a uniform for school.', 'මට පාසලට නිල ඇඳුමක් අවශ්‍යයි.'],
      ['He waited for an hour outside.', 'ඔහු පැයක් පිටත බලාගෙන සිටියා.'], ['We visited a European museum.', 'අපි යුරෝපීය කෞතුකාගාරයක් නැරඹුවා.'],
      ['An umbrella is useful during the rainy season.', 'වැසි කාලයේදී කුඩයක් ප්‍රයෝජනවත්.'],
    ] },
    { title: 'Correct article mistakes', titleSi: 'article වැරදි නිවැරදි කරන්න', phrases: [
      ['She is a teacher at our school.', 'ඇය අපේ පාසලේ ගුරුවරියක්.'], ['I bought a new phone yesterday.', 'මම ඊයේ අලුත් දුරකථනයක් මිලදී ගත්තා.'],
      ['The sun is very bright today.', 'අද හිරු එළිය ඉතා දීප්තිමත්.'], ['We had lunch at a small café.', 'අපි කුඩා ආපනශාලාවක දිවා ආහාරය ගත්තා.'],
      ['My father reads the newspaper every morning.', 'මගේ පියා හැම උදෑසනකම පුවත්පත කියවනවා.'],
    ] },
    { title: 'Describe objects with correct articles', titleSi: 'නිවැරදි articles සමඟ දේවල් විස්තර කරන්න', phrases: [
      ['There is a blue pen beside the notebook.', 'සටහන් පොත අසල නිල් පෑනක් තිබෙනවා.'],
      ['The pen belongs to my younger brother.', 'ඒ පෑන මගේ මල්ලීට අයිතියි.'],
      ['An old clock hangs above the classroom door.', 'පන්ති කාමරයේ දොරට ඉහළින් පැරණි ඔරලෝසුවක් එල්ලා තිබෙනවා.'],
      ['The clock stopped at half past three.', 'ඔරලෝසුව තුනයි තිහට නැවතුණා.'],
      ['I put the notebook in my school bag.', 'මම සටහන් පොත පාසල් බෑගයට දැම්මා.'],
    ] },
  ],
  'Personal Information': [
    { title: 'Share your name and preferred name', titleSi: 'නම සහ කැමති නම කියන්න', phrases: [
      ['My full name is Anushka Perera.', 'මගේ සම්පූර්ණ නම අනුෂ්කා පෙරේරා.'], ['Please call me Anu.', 'කරුණාකර මට අනු කියන්න.'],
      ['My name is spelled A-N-U-S-H-K-A.', 'මගේ නම A-N-U-S-H-K-A ලෙස අකුරු කියනවා.'], ['My friends call me Nimal.', 'මගේ මිතුරන් මට නිමල් කියනවා.'],
      ['It is pronounced “Tharushi”.', 'එය උච්චාරණය කරන්නේ “තරූෂි” ලෙසයි.'],
    ] },
    { title: 'Say where you live', titleSi: 'ඔබ ජීවත් වන තැන කියන්න', phrases: [
      ['I live in a small town near Kandy.', 'මම මහනුවරට ආසන්න කුඩා නගරයක ජීවත් වෙනවා.'],
      ['I live with my parents in Gampaha.', 'මම ගම්පහ මගේ දෙමාපියන් සමඟ ජීවත් වෙනවා.'],
      ['I have recently moved to Colombo.', 'මම මෑතකදී කොළඹට පදිංචියට ආවා.'],
      ['Our house is close to the railway station.', 'අපේ ගෙදර දුම්රිය ස්ථානයට ළඟයි.'],
      ['I grew up in a village in the Southern Province.', 'මම හැදී වැඩුණේ දකුණු පළාතේ ගමක.'],
    ] },
    { title: 'Talk about your hometown', titleSi: 'උපන් නගරය ගැන කතා කරන්න', phrases: [
      ['My hometown is Matara.', 'මගේ උපන් නගරය මාතර.'], ['It is famous for its beaches.', 'එය වෙරළ තීරයන් සඳහා ප්‍රසිද්ධයි.'],
      ['The town is quiet during the week.', 'සතියේ දිනවල නගරය නිස්කලංකයි.'], ['There is a large market near the bus station.', 'බස් නැවතුම අසල විශාල වෙළඳපොළක් තිබෙනවා.'],
      ['I visit my hometown during the holidays.', 'නිවාඩු කාලයේදී මම මගේ උපන් නගරයට යනවා.'],
    ] },
    { title: 'Describe your job or studies', titleSi: 'රැකියාව හෝ අධ්‍යාපනය විස්තර කරන්න', phrases: [
      ['I work as a cashier at a supermarket.', 'මම සුපිරි වෙළඳසැලක මුදල් අයකැමියෙකු ලෙස වැඩ කරනවා.'],
      ['I am studying accounting at college.', 'මම විද්‍යාලයේ ගිණුම්කරණය හදාරනවා.'],
      ['I teach English to primary-school students.', 'මම ප්‍රාථමික පාසල් සිසුන්ට ඉංග්‍රීසි උගන්වනවා.'],
      ['My main responsibility is helping customers.', 'මගේ ප්‍රධාන වගකීම ගනුදෙනුකරුවන්ට උදව් කිරීමයි.'],
      ['I hope to become a nurse after graduation.', 'උපාධියෙන් පසු හෙදියක වීමට මම බලාපොරොත්තු වෙනවා.'],
    ] },
    { title: 'Talk about your family', titleSi: 'පවුල ගැන තොරතුරු කියන්න', phrases: [
      ['There are five people in my family.', 'මගේ පවුලේ පස් දෙනෙක් ඉන්නවා.'], ['I have one older sister and a younger brother.', 'මට වැඩිමහල් සහෝදරියක් සහ බාල සහෝදරයෙක් ඉන්නවා.'],
      ['My father works in a bank.', 'මගේ පියා බැංකුවක වැඩ කරනවා.'], ['We usually have dinner together.', 'අපි සාමාන්‍යයෙන් එකට රාත්‍රී ආහාරය ගන්නවා.'],
      ['My grandparents live in the same village.', 'මගේ ආච්චි සහ සීයා ජීවත් වෙන්නේ ඒ ගමේමයි.'],
    ] },
    { title: 'Give and check contact details', titleSi: 'සම්බන්ධතා තොරතුරු දෙන්න සහ තහවුරු කරන්න', phrases: [
      ['My phone number is 077 234 5678.', 'මගේ දුරකථන අංකය 077 234 5678.'], ['Could you repeat your email address?', 'ඔබේ ඊමේල් ලිපිනය නැවත කියන්න පුළුවන්ද?'],
      ['That is N-I-M-A-L at gmail dot com.', 'එය N-I-M-A-L at gmail dot com.'], ['Let me check that I wrote it correctly.', 'මම එය නිවැරදිව ලියාගත්තාදැයි පරීක්ෂා කරන්නම්.'],
      ['You can contact me after six in the evening.', 'සවස හයෙන් පසුව ඔබට මාව සම්බන්ධ කරගන්න පුළුවන්.'],
    ] },
    { title: 'Ask for personal details politely', titleSi: 'පෞද්ගලික තොරතුරු විනීතව අසන්න', phrases: [
      ['Where do you live?', 'ඔබ ජීවත් වෙන්නේ කොහෙද?'], ['What do you do for a living?', 'ඔබ ජීවිකාව සඳහා කරන්නේ මොනවාද?'],
      ['Which school did you attend?', 'ඔබ ඉගෙන ගත්තේ කුමන පාසලේද?'], ['Would you mind telling me your hometown?', 'ඔබේ උපන් නගරය කියන්න පුළුවන්ද?'],
      ['Is this your first time in Colombo?', 'ඔබ කොළඹට පැමිණි පළමු වතාවද?'],
    ] },
    { title: 'Explain your likes and interests', titleSi: 'කැමැත්ත සහ උනන්දුව විස්තර කරන්න', phrases: [
      ['I enjoy reading historical novels.', 'මම ඓතිහාසික නවකතා කියවීමට කැමතියි.'], ['I am interested in learning Japanese.', 'මම ජපන් භාෂාව ඉගෙනීමට උනන්දුයි.'],
      ['I spend my weekends playing cricket.', 'මම සති අන්තයේ ක්‍රිකට් ක්‍රීඩා කරමින් කාලය ගත කරනවා.'],
      ['I do not watch much television.', 'මම වැඩිපුර රූපවාහිනිය නරඹන්නේ නැහැ.'], ['I would like to learn how to cook.', 'මම උයන්න ඉගෙන ගැනීමට කැමතියි.'],
    ] },
    { title: 'Describe a typical weekday', titleSi: 'සාමාන්‍ය සතියේ දිනයක් විස්තර කරන්න', phrases: [
      ['I leave home at half past seven.', 'මම හතයි තිහට ගෙදරින් පිටත් වෙනවා.'], ['My commute takes about forty minutes.', 'ගමනට විනාඩි හතළිහක් පමණ ගත වෙනවා.'],
      ['I have lunch with my colleagues.', 'මම මගේ සහකාර සේවකයන් සමඟ දිවා ආහාරය ගන්නවා.'],
      ['I return home before it gets dark.', 'අඳුරු වෙන්න කලින් මම ගෙදර එනවා.'], ['In the evening, I study English for an hour.', 'සවස මම පැයක් ඉංග්‍රීසි ඉගෙන ගන්නවා.'],
    ] },
    { title: 'Give a short self-introduction', titleSi: 'කෙටි ස්වයං හැඳින්වීමක් කරන්න', phrases: [
      ['Hello, I am Kavindu from Kurunegala.', 'ආයුබෝවන්, මම කුරුණෑගලින් පැමිණි කවිඳු.'],
      ['I am a university student, and I study engineering.', 'මම විශ්වවිද්‍යාල ශිෂ්‍යයෙක්, මම ඉංජිනේරු විද්‍යාව හදාරනවා.'],
      ['In my free time, I play the guitar.', 'විවේක කාලයේදී මම ගිටාරය වාදනය කරනවා.'],
      ['I am learning English to communicate confidently at work.', 'රැකියාවේදී විශ්වාසයෙන් සන්නිවේදනය කිරීමට මම ඉංග්‍රීසි ඉගෙන ගන්නවා.'],
      ['It is a pleasure to meet you.', 'ඔබ හමුවීම සතුටක්.'],
    ] },
  ],
  'Present Simple Routines': [
    { title: 'Describe your morning routine', titleSi: 'උදෑසන චර්යාව විස්තර කරන්න', phrases: [
      ['I wake up at six every morning.', 'මම හැමදාම උදේ හයට අවදි වෙනවා.'], ['I make my bed before breakfast.', 'උදෑසන ආහාරයට පෙර මම ඇඳ සකස් කරනවා.'],
      ['My mother prepares tea for the family.', 'මගේ අම්මා පවුලට තේ සකස් කරනවා.'], ['I leave home at seven fifteen.', 'මම හතයි පහළොවට ගෙදරින් පිටත් වෙනවා.'],
      ['My brother catches the school bus at the junction.', 'මගේ සහෝදරයා හන්දියෙන් පාසල් බස් රථයට නගිනවා.'],
    ] },
    { title: 'Talk about getting ready', titleSi: 'සූදානම් වන ආකාරය ගැන කියන්න', phrases: [
      ['I take a shower and get dressed.', 'මම නාගෙන ඇඳුම් ඇඳගන්නවා.'], ['She brushes her teeth after breakfast.', 'ඇය උදෑසන ආහාරයෙන් පසු දත් මදිනවා.'],
      ['He packs his books the night before.', 'ඔහු පෙර රාත්‍රියේම පොත් බෑගයට දානවා.'], ['We check the weather before we leave.', 'පිටත් වීමට පෙර අපි කාලගුණය බලනවා.'],
      ['Do you usually have breakfast at home?', 'ඔබ සාමාන්‍යයෙන් ගෙදරදී උදෑසන ආහාරය ගන්නවාද?'],
    ] },
    { title: 'Describe travel to school or work', titleSi: 'පාසලට හෝ රැකියාවට යන ගමන කියන්න', phrases: [
      ['I walk to the bus stop with my neighbour.', 'මම අසල්වැසියා සමඟ බස් නැවතුමට ඇවිදගෙන යනවා.'],
      ['She takes the train to Colombo every day.', 'ඇය හැමදාම දුම්රියෙන් කොළඹට යනවා.'],
      ['My father drives to work before the traffic gets busy.', 'වාහන තදබදය වැඩිවීමට පෙර මගේ පියා රැකියාවට රිය පදවනවා.'],
      ['The journey takes about half an hour.', 'ගමනට පැය භාගයක් පමණ ගත වෙනවා.'], ['How do you get to the office?', 'ඔබ කාර්යාලයට යන්නේ කොහොමද?'],
    ] },
    { title: 'Talk about study and work habits', titleSi: 'අධ්‍යයන සහ රැකියා පුරුදු ගැන කියන්න', phrases: [
      ['I review my notes after each class.', 'සෑම පන්තියකටම පසු මම සටහන් නැවත බලනවා.'], ['Our teacher gives us homework on Fridays.', 'අපේ ගුරුවරයා සිකුරාදා දිනවල ගෙදර වැඩ දෙනවා.'],
      ['She answers customer calls in the morning.', 'ඇය උදෑසන පාරිභෝගික ඇමතුම්වලට පිළිතුරු දෙනවා.'],
      ['We take a short break at eleven.', 'අපි එකොළහට කෙටි විවේකයක් ගන්නවා.'], ['Do you work on Saturdays?', 'ඔබ සෙනසුරාදා වැඩ කරනවාද?'],
    ] },
    { title: 'Describe meals in your day', titleSi: 'දවසේ ආහාර වේල් විස්තර කරන්න', phrases: [
      ['I usually eat string hoppers for breakfast.', 'මම සාමාන්‍යයෙන් උදෑසනට ඉඳිආප්ප කනවා.'],
      ['We have rice and curry for lunch.', 'අපි දිවා ආහාරයට බත් සහ ව්‍යංජන කනවා.'],
      ['My sister drinks a cup of tea in the afternoon.', 'මගේ සහෝදරිය සවස තේ කෝප්පයක් බොනවා.'],
      ['Our family eats dinner together at eight.', 'අපේ පවුල අටට එකට රාත්‍රී ආහාරය ගන්නවා.'], ['What do you normally have for breakfast?', 'ඔබ සාමාන්‍යයෙන් උදෑසනට කන්නේ මොනවාද?'],
    ] },
    { title: 'Talk about household chores', titleSi: 'ගෙදර වැඩ ගැන කියන්න', phrases: [
      ['I wash the dishes after dinner.', 'රාත්‍රී ආහාරයෙන් පසු මම පිඟන් සෝදනවා.'], ['My brother sweeps the garden on Sundays.', 'මගේ සහෝදරයා ඉරිදා දිනවල මිදුල අතුගානවා.'],
      ['We do the laundry twice a week.', 'අපි සතියට දෙවරක් රෙදි සෝදනවා.'], ['My parents share the cooking.', 'මගේ දෙමාපියන් උයන වැඩ බෙදාගන්නවා.'],
      ['Who takes out the rubbish in your house?', 'ඔබේ ගෙදර කුණු ඉවත් කරන්නේ කවුද?'],
    ] },
    { title: 'Use frequency words', titleSi: 'නිතර සිදුවන බව දැක්වෙන වචන යොදන්න', phrases: [
      ['I always carry a water bottle.', 'මම හැමවිටම වතුර බෝතලයක් රැගෙන යනවා.'], ['She often calls her grandmother.', 'ඇය නිතරම ආච්චිට කතා කරනවා.'],
      ['We sometimes visit the library after school.', 'අපි සමහරවිට පාසලෙන් පසු පුස්තකාලයට යනවා.'], ['He rarely eats fast food.', 'ඔහු කලාතුරකින් ක්ෂණික ආහාර කනවා.'],
      ['They never leave the gate unlocked.', 'ඔවුන් කිසිවිටෙක ගේට්ටුව අගුළු නොදා තබන්නේ නැහැ.'],
    ] },
    { title: 'Ask about someone’s routine', titleSi: 'කෙනෙකුගේ දෛනික චර්යාව අසන්න', phrases: [
      ['What time do you get up?', 'ඔබ අවදි වන්නේ කීයටද?'], ['Does your bus arrive on time?', 'ඔබේ බස් රථය නියමිත වේලාවට එනවාද?'],
      ['Where does your sister study?', 'ඔබේ සහෝදරිය ඉගෙන ගන්නේ කොහේද?'], ['How often do you practise English?', 'ඔබ කොපමණ වාරයක් ඉංග්‍රීසි පුහුණු වෙනවාද?'],
      ['What do you do after work?', 'වැඩෙන් පසු ඔබ මොනවාද කරන්නේ?'],
    ] },
    { title: 'Make routine sentences negative', titleSi: 'චර්යා පිළිබඳ නිෂේධ වාක්‍ය සාදන්න', phrases: [
      ['I do not drink coffee at night.', 'මම රාත්‍රියේ කෝපි බොන්නේ නැහැ.'], ['He does not drive to work.', 'ඔහු රැකියාවට රිය පදවන්නේ නැහැ.'],
      ['We do not have classes on Sundays.', 'අපට ඉරිදා දිනවල පන්ති නැහැ.'], ['She does not watch television before school.', 'ඇය පාසලට පෙර රූපවාහිනිය නරඹන්නේ නැහැ.'],
      ['They do not eat lunch at their desks.', 'ඔවුන් තම මේසවලදී දිවා ආහාරය ගන්නේ නැහැ.'],
    ] },
    { title: 'Describe a full ordinary day', titleSi: 'සාමාන්‍ය දවසක් සම්පූර්ණයෙන් විස්තර කරන්න', phrases: [
      ['I get up early, but my brother sleeps until seven.', 'මම වේලාසනින් අවදි වෙනවා, නමුත් මගේ සහෝදරයා හත වන තුරු නිදාගන්නවා.'],
      ['After work, I buy vegetables at the market.', 'වැඩෙන් පසු මම වෙළඳපොළෙන් එළවළු මිලදී ගන්නවා.'],
      ['We eat dinner, talk about our day, and then study.', 'අපි රාත්‍රී ආහාරය ගෙන, දවස ගැන කතා කරලා, පසුව පාඩම් කරනවා.'],
      ['My grandmother listens to the radio before bed.', 'මගේ ආච්චි නින්දට පෙර ගුවන්විදුලියට සවන් දෙනවා.'],
      ['What is one thing you do every day?', 'ඔබ හැමදාම කරන එක දෙයක් මොකක්ද?'],
    ] },
  ],
  'Food & Drink': [
    { title: 'Read a menu and choose a meal', titleSi: 'මෙනුව කියවා ආහාර වේලක් තෝරන්න', phrases: [
      ['Could I see the menu, please?', 'කරුණාකර මෙනුව බලන්න පුළුවන්ද?'], ['What do you recommend today?', 'අද ඔබ නිර්දේශ කරන්නේ මොනවාද?'],
      ['I would like the rice and curry.', 'මට බත් සහ ව්‍යංජන අවශ්‍යයි.'], ['Does this meal come with a drink?', 'මේ ආහාර වේලට බීමක් ඇතුළත්ද?'],
      ['I will have the vegetable kottu, please.', 'මට එළවළු කොත්තු එකක් දෙන්න.'],
    ] },
    { title: 'Order food politely', titleSi: 'විනීතව ආහාර ඇණවුම් කරන්න', phrases: [
      ['Could I have a chicken hoppers portion?', 'මට කුකුළු මස් ආප්ප කොටසක් ගන්න පුළුවන්ද?'],
      ['Please make the curry mild.', 'කරුණාකර ව්‍යංජනය මිරිස් අඩුවෙන් හදන්න.'],
      ['I would like two vegetable rotis.', 'මට එළවළු රොටි දෙකක් අවශ්‍යයි.'],
      ['Can we have some extra sambol?', 'අපට අමතර සම්බෝල ටිකක් ගන්න පුළුවන්ද?'],
      ['Please bring the food when it is ready.', 'ආහාර සූදානම් වූ විට කරුණාකර ගෙන එන්න.'],
    ] },
    { title: 'Ask about ingredients', titleSi: 'අමුද්‍රව්‍ය ගැන විමසන්න', phrases: [
      ['Does this curry contain coconut milk?', 'මේ ව්‍යංජනයට පොල් කිරි දාලා තිබෙනවාද?'],
      ['Is there any fish in this dish?', 'මේ කෑමට මාළු දාලා තිබෙනවාද?'],
      ['What ingredients are in the salad?', 'සලාදයට දාලා තිබෙන අමුද්‍රව්‍ය මොනවාද?'],
      ['This sauce contains peanuts.', 'මේ සෝස් එකේ රටකජු තිබෙනවා.'],
      ['I am allergic to prawns.', 'මට ඉස්සන් අසාත්මිකයි.'],
    ] },
    { title: 'Talk about Sri Lankan dishes', titleSi: 'ශ්‍රී ලාංකික ආහාර ගැන කතා කරන්න', phrases: [
      ['Kiribath is often served for special occasions.', 'විශේෂ අවස්ථාවලදී කිරිබත් බොහෝවිට පිළිගන්වනවා.'],
      ['String hoppers go well with dhal curry.', 'ඉඳිආප්ප පරිප්පු ව්‍යංජනය සමඟ හොඳින් ගැළපෙනවා.'],
      ['Pol sambol is made with coconut and chilli.', 'පොල් සම්බෝල හදන්නේ පොල් සහ මිරිස්වලින්.'],
      ['Have you tried ambul thiyal?', 'ඔබ අම්බුල් තියල් කාලා තිබෙනවාද?'],
      ['This is my first time tasting watalappan.', 'මම වටලප්පන් රස බලන පළමු වතාව මෙයයි.'],
    ] },
    { title: 'Order drinks and refreshments', titleSi: 'බීම සහ සුළු ආහාර ඇණවුම් කරන්න', phrases: [
      ['A plain tea without sugar, please.', 'කරුණාකර සීනි නැති ප්ලේන්ටියක් දෙන්න.'],
      ['Could I have a fresh lime juice?', 'මට නැවුම් දෙහි යුෂ එකක් ගන්න පුළුවන්ද?'],
      ['Would you like your tea with milk?', 'ඔබට කිරි සහිත තේ අවශ්‍යද?'],
      ['We will share a plate of cutlets.', 'අපි කට්ලට් පිඟානක් බෙදාගන්නම්.'],
      ['The king coconut water is very refreshing.', 'තැඹිලි වතුර ඉතාමත් ප්‍රබෝධජනකයි.'],
    ] },
    { title: 'Describe taste and texture', titleSi: 'රස සහ ස්වභාවය විස්තර කරන්න', phrases: [
      ['The curry is spicy but delicious.', 'ව්‍යංජනය සැරයි, නමුත් රසයි.'], ['The bananas are ripe and sweet.', 'කෙසෙල් ඉදුණු සහ පැණි රසයි.'],
      ['This bread is still warm.', 'මේ පාන් තවමත් උණුසුම්.'], ['The soup tastes a little salty.', 'සුප් එක ටිකක් ලුණු වැඩියි.'],
      ['The hopper is crispy around the edges.', 'ආප්පයේ වටේ හැපෙනසුළුයි.'],
    ] },
    { title: 'Ask for portions and serving sizes', titleSi: 'කොටස් සහ ප්‍රමාණ විමසන්න', phrases: [
      ['Is this portion enough for two people?', 'මේ කොටස දෙදෙනෙකුට ප්‍රමාණවත්ද?'], ['Could we have a smaller serving of rice?', 'අපට බත් ටිකක් අඩුවෙන් ගන්න පුළුවන්ද?'],
      ['Please bring another plate.', 'කරුණාකර තවත් පිඟානක් ගෙන එන්න.'], ['We would like one large bottle of water.', 'අපට විශාල වතුර බෝතලයක් අවශ්‍යයි.'],
      ['Can you split this dish into three portions?', 'මේ කෑම කොටස් තුනකට බෙදන්න පුළුවන්ද?'],
    ] },
    { title: 'Ask for the bill and pay', titleSi: 'බිල ඉල්ලා ගෙවන්න', phrases: [
      ['Could we have the bill, please?', 'කරුණාකර අපට බිල ගෙන එන්න පුළුවන්ද?'], ['Is the service charge included?', 'සේවා ගාස්තුව ඇතුළත්ද?'],
      ['Can I pay by card?', 'මට කාඩ්පතෙන් ගෙවන්න පුළුවන්ද?'], ['Let us split the bill equally.', 'අපි බිල සමානව බෙදාගමු.'],
      ['Please check the change; I think it is short.', 'කරුණාකර ඉතිරි මුදල බලන්න; එය අඩුයි වගේ.'],
    ] },
    { title: 'Explain food preferences', titleSi: 'ආහාර කැමැත්ත පැහැදිලි කරන්න', phrases: [
      ['I do not eat meat, but I eat fish.', 'මම මස් කන්නේ නැහැ, නමුත් මාළු කනවා.'],
      ['I prefer less chilli in my food.', 'මගේ කෑමට මිරිස් අඩුවෙන් දානවාට මම කැමතියි.'],
      ['Could you prepare this without onions?', 'ලූනු නැතුව මේක හදන්න පුළුවන්ද?'],
      ['I am vegetarian, so I would like the vegetable curry.', 'මම නිර්මාංශ නිසා එළවළු ව්‍යංජනය ගන්න කැමතියි.'],
      ['I cannot eat food that contains dairy.', 'කිරි ආහාර අඩංගු කෑම මට කන්න බැහැ.'],
    ] },
    { title: 'Complete a restaurant conversation', titleSi: 'ආපනශාලා සංවාදයක් සම්පූර්ණ කරන්න', phrases: [
      ['Are you ready to order?', 'ඔබ ඇණවුම් කිරීමට සූදානම්ද?'], ['Yes. I would like the fish curry and rice.', 'ඔව්. මට මාළු ව්‍යංජනය සහ බත් අවශ්‍යයි.'],
      ['Would you like anything to drink?', 'ඔබට බොන්න යමක් අවශ්‍යද?'], ['A lime juice, please, without added sugar.', 'කරුණාකර සීනි නොදැමූ දෙහි යුෂ එකක් දෙන්න.'],
      ['Certainly. I will bring your order shortly.', 'හොඳයි. මම ඉක්මනින් ඔබේ ඇණවුම ගෙන එන්නම්.'],
    ] },
  ],
  'Shopping & Prices': [
    { title: 'Ask for an item in a shop', titleSi: 'වෙළඳසැලක භාණ්ඩයක් ඉල්ලන්න', phrases: [
      ['Do you have this shirt in a medium size?', 'මේ කමිසය මධ්‍යම ප්‍රමාණයෙන් තිබෙනවාද?'],
      ['I am looking for a phone charger.', 'මම දුරකථන චාජරයක් සොයනවා.'], ['Where can I find the cooking oil?', 'ඉවුම් පිහුම් තෙල් සොයාගන්නේ කොහෙන්ද?'],
      ['Do you sell school exercise books?', 'ඔබ පාසල් අභ්‍යාස පොත් විකුණනවාද?'], ['I need a pair of black shoes.', 'මට කළු සපත්තු ජෝඩුවක් අවශ්‍යයි.'],
    ] },
    { title: 'Ask and understand prices', titleSi: 'මිල අසන්න සහ තේරුම් ගන්න', phrases: [
      ['How much is this kilo of mangoes?', 'මේ අඹ කිලෝව කීයද?'], ['How much do these notebooks cost?', 'මේ සටහන් පොත් කීයක් වෙනවාද?'],
      ['Is that the price for one or for both?', 'ඒ මිල එකකටද දෙකටමද?'], ['It costs twelve hundred rupees.', 'එහි මිල රුපියල් එක්දහස් දෙසියයි.'],
      ['Could you tell me the total, please?', 'කරුණාකර මුළු මිල කියන්න පුළුවන්ද?'],
    ] },
    { title: 'Buy quantities at the market', titleSi: 'වෙළඳපොළෙන් ප්‍රමාණ මිලදී ගන්න', phrases: [
      ['Please give me half a kilo of carrots.', 'කරුණාකර කැරට් ග්‍රෑම් පන්සියයක් දෙන්න.'],
      ['I would like two coconuts.', 'මට පොල් ගෙඩි දෙකක් අවශ්‍යයි.'], ['Can I have a dozen eggs?', 'මට බිත්තර දොළහක් ගන්න පුළුවන්ද?'],
      ['Please weigh one kilo of rice.', 'කරුණාකර සහල් කිලෝවක් කිරන්න.'], ['That is enough, thank you.', 'ඒ ඇති, ස්තුතියි.'],
    ] },
    { title: 'Compare products and quality', titleSi: 'භාණ්ඩ සහ ගුණාත්මකභාවය සසඳන්න', phrases: [
      ['This brand is cheaper than the other one.', 'මේ වෙළඳ නාමය අනෙක් එකට වඩා ලාභයි.'],
      ['The larger packet is better value.', 'විශාල පැකට්ටුවෙන් වැඩි වටිනාකමක් ලැබෙනවා.'],
      ['Which phone has the longer battery life?', 'වැඩි වෙලාවක් බැටරි පවතින්නේ කුමන දුරකථනයේද?'],
      ['These mangoes look fresher.', 'මේ අඹ වඩාත් නැවුම් වගේ.'], ['I prefer the blue one because it is more durable.', 'නිල් එක වඩා කල් පවතින නිසා මම එයට කැමතියි.'],
    ] },
    { title: 'Ask about sizes and fitting', titleSi: 'ප්‍රමාණ සහ ඇඳුම් ගැළපීම විමසන්න', phrases: [
      ['Could I try this dress on?', 'මට මේ ගවුම ඇඳලා බලන්න පුළුවන්ද?'], ['Do you have a larger size?', 'මීට වඩා විශාල ප්‍රමාණයක් තිබෙනවාද?'],
      ['The sleeves are too long for me.', 'අත් මට දිග වැඩියි.'], ['Where is the fitting room?', 'ඇඳුම් ඇඳලා බලන කාමරය කොහෙද?'],
      ['This pair of shoes fits comfortably.', 'මේ සපත්තු ජෝඩුව පහසුවෙන් ගැළපෙනවා.'],
    ] },
    { title: 'Make a polite request or bargain', titleSi: 'විනීත ඉල්ලීමක් හෝ මිල සාකච්ඡාවක් කරන්න', phrases: [
      ['Could you give me a small discount?', 'මට පොඩි වට්ටමක් දෙන්න පුළුවන්ද?'], ['Is this your best price?', 'මේ ඔබට දිය හැකි හොඳම මිලද?'],
      ['Would you reduce the price if I buy two?', 'මම දෙකක් ගත්තොත් මිල අඩු කරනවාද?'],
      ['That is a little over my budget.', 'ඒ මිල මගේ අයවැයට ටිකක් වැඩියි.'], ['Thank you, but I will think about it.', 'ස්තුතියි, නමුත් මම ඒ ගැන හිතන්නම්.'],
    ] },
    { title: 'Pay by cash or card', titleSi: 'මුදලින් හෝ කාඩ්පතෙන් ගෙවන්න', phrases: [
      ['Can I pay with a debit card?', 'මට ඩෙබිට් කාඩ්පතෙන් ගෙවන්න පුළුවන්ද?'], ['Do you accept cash?', 'ඔබ මුදල් භාරගන්නවාද?'],
      ['Could I have a receipt, please?', 'කරුණාකර මට රිසිට්පතක් දෙන්න පුළුවන්ද?'], ['I have a five-thousand-rupee note.', 'මගේ ළඟ රුපියල් පන්දහසේ නෝට්ටුවක් තිබෙනවා.'],
      ['Please check that the card payment went through.', 'කාඩ්පත් ගෙවීම සාර්ථක වුණාදැයි පරීක්ෂා කරන්න.'],
    ] },
    { title: 'Return or exchange an item', titleSi: 'භාණ්ඩයක් ආපසු දෙන්න හෝ මාරු කරන්න', phrases: [
      ['I would like to exchange this shirt.', 'මට මේ කමිසය මාරු කරගන්න අවශ්‍යයි.'],
      ['The zip is broken.', 'සිපරය කැඩිලා.'], ['I bought the wrong size yesterday.', 'මම ඊයේ වැරදි ප්‍රමාණය මිලදී ගත්තා.'],
      ['Do I need the receipt to return it?', 'එය ආපසු දෙන්න රිසිට්පත අවශ්‍යද?'], ['Could I get a refund instead?', 'ඒ වෙනුවට මුදල් ආපසු ගන්න පුළුවන්ද?'],
    ] },
    { title: 'Shop for household essentials', titleSi: 'ගෘහස්ථ අවශ්‍ය දේ මිලදී ගන්න', phrases: [
      ['We need washing powder and dish soap.', 'අපට රෙදි සෝදන කුඩු සහ පිඟන් සෝදන දියර අවශ්‍යයි.'],
      ['Please add a packet of tea to the basket.', 'කරුණාකර තේ පැකට්ටුවක් කූඩයට දාන්න.'],
      ['The cooking gas cylinder is nearly empty.', 'ගෑස් සිලින්ඩරය ඉවර වෙන්න ළඟයි.'],
      ['Where are the batteries and light bulbs?', 'බැටරි සහ විදුලි බුබුළු තියෙන්නේ කොහෙද?'],
      ['We have enough rice for this week.', 'මේ සතියට අපට සහල් ඇති.'],
    ] },
    { title: 'Complete a shopping conversation', titleSi: 'සාප්පු සංවාදයක් සම්පූර්ණ කරන්න', phrases: [
      ['Can I help you find anything?', 'මට ඔබට යමක් සොයාගැනීමට උදව් කරන්න පුළුවන්ද?'],
      ['Yes, I need a school bag for my daughter.', 'ඔව්, මගේ දුවට පාසල් බෑගයක් අවශ්‍යයි.'],
      ['This one has stronger straps and more pockets.', 'මේකේ ශක්තිමත් පටි සහ සාක්කු වැඩියි.'],
      ['How much is it, and can I pay by card?', 'මේක කීයද, මට කාඩ්පතෙන් ගෙවන්න පුළුවන්ද?'],
      ['It is 4,500 rupees. Yes, we accept cards.', 'රුපියල් 4,500යි. ඔව්, අපි කාඩ්පත් භාරගන්නවා.'],
    ] },
  ],
  'Greetings & Introductions': [
    { title: 'Choose the right greeting', titleSi: 'නිවැරදි ආචාරය තෝරන්න', phrases: [
      ['Good morning, Miss Perera.', 'සුබ උදෑසනක්, පෙරේරා ගුරුතුමියනි.'], ['Good afternoon, everyone.', 'සුබ දහවලක්, හැමෝටම.'],
      ['Good evening, Mr Silva.', 'සුබ සන්ධ්‍යාවක්, සිල්වා මහතා.'], ['Hello, Nimal. It is nice to see you.', 'ආයුබෝවන් නිමල්. ඔබව දැකීම සතුටක්.'],
      ['Hi, Kasuni. How are you?', 'හායි කසුනි. ඔබට කොහොමද?'],
    ] },
    { title: 'Ask how someone is', titleSi: 'කෙනෙකුගේ සුවදුක් අසන්න', phrases: [
      ['How are you today?', 'අද ඔබට කොහොමද?'], ['How have you been?', 'ඔබට මේ දවස්වල කොහොමද?'],
      ['Is everything all right?', 'හැම දෙයක්ම හොඳින්ද?'], ['How is your family?', 'ඔබේ පවුලේ අයට කොහොමද?'],
      ['How was your journey to school?', 'පාසලට ආ ගමන කොහොමද?'],
    ] },
    { title: 'Reply politely to a greeting', titleSi: 'ආචාරයකට විනීතව පිළිතුරු දෙන්න', phrases: [
      ['I am well, thank you. How are you?', 'මට හොඳයි, ස්තුතියි. ඔබට කොහොමද?'], ['I am fine, thanks.', 'මට හොඳයි, ස්තුතියි.'],
      ['I am doing well today.', 'මම අද හොඳින් ඉන්නවා.'], ['Not bad, thank you for asking.', 'වරදක් නැහැ, ඇසුවාට ස්තුතියි.'],
      ['I am a little tired, but I am all right.', 'මට ටිකක් මහන්සියි, ඒත් මම හොඳින්.'],
    ] },
    { title: 'Say your name naturally', titleSi: 'ඔබේ නම ස්වාභාවිකව කියන්න', phrases: [
      ['My name is Amali.', 'මගේ නම අමාලි.'], ['I am Kasun.', 'මම කසුන්.'], ['Please call me Sahan.', 'කරුණාකර මට සහන් කියන්න.'],
      ['Everyone calls me Nadee.', 'හැමෝම මට නදී කියනවා.'], ['It is lovely to meet you. I am Tharushi.', 'ඔබ හමුවීම සතුටක්. මම තරූෂි.'],
    ] },
    { title: 'Say where you are from', titleSi: 'ඔබ පැමිණි ප්‍රදේශය කියන්න', phrases: [
      ['I am from Kandy.', 'මම මහනුවරින්.'], ['I come from Galle.', 'මම ගාල්ලෙන් පැමිණියේ.'],
      ['I live in Kurunegala now.', 'මම දැන් කුරුණෑගල ජීවත් වෙනවා.'], ['I grew up in Jaffna.', 'මම හැදී වැඩුණේ යාපනයේ.'],
      ['My family comes from Matara.', 'මගේ පවුලේ අය මාතරින්.'],
    ] },
    { title: 'Introduce your role', titleSi: 'ඔබේ රැකියාව හෝ භූමිකාව හඳුන්වා දෙන්න', phrases: [
      ['I am a nursing student.', 'මම හෙද සිසුවෙක්.'], ['I work as an accountant.', 'මම ගණකාධිකාරීවරයෙකු ලෙස වැඩ කරනවා.'],
      ['I teach science at a school.', 'මම පාසලක විද්‍යාව උගන්වනවා.'], ['I am studying information technology.', 'මම තොරතුරු තාක්ෂණය හදාරනවා.'],
      ['I run a small shop with my family.', 'මම මගේ පවුල සමඟ කුඩා වෙළඳසැලක් පවත්වාගෙන යනවා.'],
    ] },
    { title: 'Ask someone’s name and hometown', titleSi: 'නම සහ උපන් ප්‍රදේශය විමසන්න', phrases: [
      ['What is your name?', 'ඔබේ නම මොකක්ද?'], ['Where are you from?', 'ඔබ කොහෙන්ද?'],
      ['Which town do you live in?', 'ඔබ ජීවත් වන නගරය කුමක්ද?'], ['What do you do for work?', 'ඔබ කරන රැකියාව මොකක්ද?'],
      ['May I ask your name?', 'ඔබේ නම දැනගන්න පුළුවන්ද?'],
    ] },
    { title: 'Introduce another person', titleSi: 'වෙනත් කෙනෙකු හඳුන්වා දෙන්න', phrases: [
      ['This is my friend, Dilini.', 'මේ මගේ මිතුරිය දිලිනි.'], ['Let me introduce my brother, Ravi.', 'මගේ සහෝදරයා රවිව හඳුන්වා දෙන්නම්.'],
      ['Have you met our teacher, Mrs Fernando?', 'ඔබ අපේ ගුරුතුමිය වන ප්‍රනාන්දු මහත්මිය හමුවී තිබෙනවාද?'],
      ['She works with me at the hospital.', 'ඇය රෝහලේ මා සමඟ වැඩ කරනවා.'], ['We studied together in Colombo.', 'අපි කොළඹදී එකට ඉගෙන ගත්තා.'],
    ] },
    { title: 'Respond when you meet someone', titleSi: 'කෙනෙකු හමුවූ විට ප්‍රතිචාර දක්වන්න', phrases: [
      ['Nice to meet you, too.', 'ඔබ හමුවීමත් සතුටක්.'], ['I have heard a lot about you.', 'මම ඔබ ගැන බොහෝ දේ අසා තිබෙනවා.'],
      ['It is good to finally meet in person.', 'අවසානයේ මුහුණට මුහුණ හමුවීම සතුටක්.'],
      ['Thank you for introducing us.', 'අපිව හඳුන්වා දුන්නාට ස්තුතියි.'], ['I hope we can work together.', 'අපට එකට වැඩ කිරීමට හැකිවේවි කියා මම හිතනවා.'],
    ] },
    { title: 'End a conversation politely', titleSi: 'සංවාදයක් විනීතව අවසන් කරන්න', phrases: [
      ['It was nice talking to you.', 'ඔබ සමඟ කතා කිරීම සතුටක්.'], ['I have to go now. See you tomorrow.', 'මට දැන් යන්න වෙනවා. හෙට හමුවෙමු.'],
      ['Have a good day.', 'ඔබට සුබ දවසක්.'], ['Good night. Sleep well.', 'සුබ රාත්‍රියක්. හොඳින් නිදාගන්න.'],
      ['See you later, Kasun.', 'පසුව හමුවෙමු, කසුන්.'],
    ] },
  ],
  'Asking for Directions': [
    { title: 'Ask where a place is', titleSi: 'ස්ථානයක් තිබෙන තැන අසන්න', phrases: [
      ['Excuse me, where is the post office?', 'සමාවන්න, තැපැල් කාර්යාලය කොහෙද?'],
      ['Could you tell me where the bus stand is?', 'බස් නැවතුම කොහෙද කියා කියන්න පුළුවන්ද?'],
      ['Is the railway station near here?', 'දුම්රිය ස්ථානය මෙතැනට ළඟද?'],
      ['How can I get to the public library?', 'මහජන පුස්තකාලයට යන්නේ කොහොමද?'],
      ['I am looking for the entrance to the hospital.', 'මම රෝහලේ පිවිසුම සොයනවා.'],
    ] },
    { title: 'Understand left and right', titleSi: 'වම සහ දකුණ තේරුම් ගන්න', phrases: [
      ['Turn left at the traffic lights.', 'රථවාහන සංඥා ළඟින් වමට හැරෙන්න.'], ['Turn right after the bank.', 'බැංකුව පසුකර දකුණට හැරෙන්න.'],
      ['The school is on your left.', 'පාසල ඔබේ වම් පැත්තේ.'], ['The pharmacy is on your right.', 'ඖෂධසාලාව ඔබේ දකුණු පැත්තේ.'],
      ['Take the second road on the left.', 'වමේ ඇති දෙවන පාරට හැරෙන්න.'],
    ] },
    { title: 'Follow straight and turn instructions', titleSi: 'කෙළින් යන සහ හැරෙන උපදෙස් අනුගමනය කරන්න', phrases: [
      ['Go straight for about two hundred metres.', 'මීටර් දෙසියයක් පමණ කෙළින් යන්න.'],
      ['Continue until you reach the bridge.', 'පාලමට ළඟා වන තුරු ඉදිරියට යන්න.'],
      ['Cross the road at the pedestrian crossing.', 'පදික මාරුවෙන් පාර මාරු වන්න.'],
      ['Walk past the temple and turn left.', 'විහාරය පසුකර ඇවිද ගොස් වමට හැරෙන්න.'],
      ['Do not cross here; use the footbridge.', 'මෙතැනින් පාර මාරු වෙන්න එපා; ගුවන් පාලම භාවිත කරන්න.'],
    ] },
    { title: 'Use landmarks to find a place', titleSi: 'ස්ථානයක් සොයාගැනීමට සලකුණු භාවිත කරන්න', phrases: [
      ['The clinic is opposite the town hall.', 'සායනය නගර ශාලාවට ඉදිරිපිටයි.'],
      ['You will see the supermarket beside the petrol station.', 'ඉන්ධන පිරවුම්හල අසල සුපිරි වෙළඳසැල පෙනේවි.'],
      ['The post office is next to the clock tower.', 'තැපැල් කාර්යාලය ඔරලෝසු කණුව අසලයි.'],
      ['The entrance is behind the main building.', 'පිවිසුම ප්‍රධාන ගොඩනැගිල්ල පිටුපසයි.'],
      ['The lake is across the road from the park.', 'වැව උද්‍යානයට පාරෙන් එහා පැත්තේයි.'],
    ] },
    { title: 'Ask how far and how long', titleSi: 'දුර සහ කාලය විමසන්න', phrases: [
      ['How far is the market from here?', 'වෙළඳපොළ මෙතැන සිට කොච්චර දුරද?'],
      ['Is it within walking distance?', 'පයින් යා හැකි දුරකද?'],
      ['How long does it take to get there on foot?', 'එතැනට පයින් යන්න කොපමණ වේලාවක් ගත වෙනවාද?'],
      ['It is about a ten-minute walk.', 'එතැනට පයින් විනාඩි දහයක් පමණයි.'],
      ['You can reach it in five minutes by tuk-tuk.', 'ත්‍රීරෝද රථයකින් විනාඩි පහකින් එතැනට යන්න පුළුවන්.'],
    ] },
    { title: 'Check that you understood', titleSi: 'ඔබට නිවැරදිව තේරුණාදැයි තහවුරු කරන්න', phrases: [
      ['So I turn left at the bank, correct?', 'එහෙනම් බැංකුව ළඟින් වමට හැරෙනවා, හරිද?'],
      ['Do I cross the bridge or turn before it?', 'මම පාලමෙන් එගොඩ වෙනවාද, නැත්නම් ඊට පෙර හැරෙනවාද?'],
      ['Could you show me on this map?', 'මේ සිතියමේ පෙන්වන්න පුළුවන්ද?'],
      ['Is the entrance on this side of the building?', 'පිවිසුම ගොඩනැගිල්ලේ මේ පැත්තේද?'],
      ['Thank you. I understand now.', 'ස්තුතියි. දැන් මට තේරුණා.'],
    ] },
    { title: 'Give directions to a visitor', titleSi: 'අමුත්තෙකුට මඟ පෙන්වන්න', phrases: [
      ['Walk along this road until you see the school.', 'පාසල පෙනෙන තුරු මේ පාර දිගේ යන්න.'],
      ['At the junction, take the road on your right.', 'හන්දියේදී ඔබේ දකුණු පැත්තේ පාර ගන්න.'],
      ['The museum is directly opposite the railway station.', 'කෞතුකාගාරය දුම්රිය ස්ථානයට හරියටම ඉදිරිපිටයි.'],
      ['You cannot miss it; it has a blue gate.', 'එය මඟහැරෙන්නේ නැහැ; එහි නිල් ගේට්ටුවක් තිබෙනවා.'],
      ['I can walk with you as far as the junction.', 'මට හන්දිය දක්වා ඔබ සමඟ ඇවිදගෙන යන්න පුළුවන්.'],
    ] },
    { title: 'Ask for directions politely', titleSi: 'විනීතව මඟ විමසන්න', phrases: [
      ['Excuse me, could you help me find the museum?', 'සමාවන්න, කෞතුකාගාරය සොයාගැනීමට උදව් කරන්න පුළුවන්ද?'],
      ['Would you mind pointing me towards the bus stand?', 'බස් නැවතුම තිබෙන දිශාව පෙන්වන්න පුළුවන්ද?'],
      ['Could you please repeat the last instruction?', 'අවසාන උපදෙස නැවත කියන්න පුළුවන්ද?'],
      ['I am sorry to bother you. Is this the way to the lake?', 'බාධා කළාට සමාවන්න. වැවට යන පාර මේකද?'],
      ['Thank you very much for your help.', 'ඔබගේ උදව්වට බොහොම ස්තුතියි.'],
    ] },
    { title: 'Handle a wrong turn', titleSi: 'වැරදි මඟක් ගත් විට විමසන්න', phrases: [
      ['I think I have taken the wrong road.', 'මම හිතන්නේ මම වැරදි පාරක ඇවිත්.'],
      ['Could you tell me how to get back to the main road?', 'ප්‍රධාන පාරට ආපසු යන්නේ කොහොමද කියන්න පුළුවන්ද?'],
      ['I have passed the temple. Should I turn back?', 'මම විහාරය පසුකර ආවා. ආපසු හැරෙන්නද?'],
      ['Is there another way to reach the station?', 'දුම්රිය ස්ථානයට යන්න වෙනත් පාරක් තිබෙනවාද?'],
      ['I will check the map before I continue.', 'ඉදිරියට යන්න කලින් මම සිතියම බලන්නම්.'],
    ] },
    { title: 'Complete a directions role-play', titleSi: 'මඟ විමසීමේ සංවාදයක් සම්පූර්ණ කරන්න', phrases: [
      ['Excuse me, how do I get to the library?', 'සමාවන්න, පුස්තකාලයට යන්නේ කොහොමද?'],
      ['Go straight and turn right at the post office.', 'කෙළින් ගොස් තැපැල් කාර්යාලය ළඟින් දකුණට හැරෙන්න.'],
      ['Will I see the library from the junction?', 'හන්දියේ සිට පුස්තකාලය පෙනේවිද?'],
      ['Yes. It is beside the community centre.', 'ඔව්. එය ප්‍රජා මධ්‍යස්ථානය අසලයි.'],
      ['Thank you for explaining the route.', 'ගමන් මඟ පැහැදිලි කළාට ස්තුතියි.'],
    ] },
  ],
  'Bus Tickets & Train Stations': [
    { title: 'Buy the correct bus ticket', titleSi: 'නිවැරදි බස් ටිකට් පත මිලදී ගන්න', phrases: [
      ['One ticket to Kandy, please.', 'කරුණාකර මහනුවරට ටිකට් පතක් දෙන්න.'], ['Does this bus go to Pettah?', 'මේ බස් එක පිටකොටුවට යනවාද?'],
      ['How much is the fare to Galle?', 'ගාල්ලට ගාස්තුව කීයද?'], ['Is this the express bus?', 'මේ අධිවේගී බස් රථයද?'],
      ['Please tell me when we reach the bus stand.', 'අපි බස් නැවතුමට ආ විට මට කියන්න.'],
    ] },
    { title: 'Ask about a train ticket', titleSi: 'දුම්රිය ටිකට් පතක් ගැන විමසන්න', phrases: [
      ['I need a second-class ticket to Matara.', 'මට මාතරට දෙවන පන්තියේ ටිකට් පතක් අවශ්‍යයි.'],
      ['Are there any seats available on the 10:30 train?', 'දහයයි තිහේ දුම්රියේ ආසන තිබෙනවාද?'],
      ['Can I buy a return ticket?', 'ආපසු පැමිණීමේ ටිකට් පතක් ගන්න පුළුවන්ද?'],
      ['Which platform does the train leave from?', 'දුම්රිය පිටත් වන්නේ කුමන වේදිකාවෙන්ද?'],
      ['Does this ticket include a reserved seat?', 'මේ ටිකට් පතට වෙන් කළ ආසනයක් ඇතුළත්ද?'],
    ] },
    { title: 'Find the right platform and train', titleSi: 'නිවැරදි වේදිකාව සහ දුම්රිය සොයාගන්න', phrases: [
      ['Where is platform number three?', 'තුන්වන වේදිකාව කොහෙද?'], ['Is this the train to Badulla?', 'මේ බදුල්ලට යන දුම්රියද?'],
      ['The train to Jaffna leaves from platform four.', 'යාපනයට යන දුම්රිය පිටත් වන්නේ හතරවන වේදිකාවෙන්.'],
      ['Please check the departure board.', 'කරුණාකර පිටත්වීමේ පුවරුව බලන්න.'],
      ['The platform has changed to number two.', 'වේදිකාව අංක දෙකට මාරු කර තිබෙනවා.'],
    ] },
    { title: 'Ask about departure and arrival times', titleSi: 'පිටත්වීමේ සහ පැමිණීමේ වේලාව අසන්න', phrases: [
      ['What time does the next train leave?', 'ඊළඟ දුම්රිය පිටත් වන්නේ කීයටද?'],
      ['When will we arrive in Anuradhapura?', 'අපි අනුරාධපුරයට ළඟා වන්නේ කවදාද?'],
      ['Is the 8:15 train running on time?', 'අටයි පහළොවේ දුම්රිය නියමිත වේලාවට යනවාද?'],
      ['The bus is due to leave in ten minutes.', 'බස් රථය තව විනාඩි දහයකින් පිටත් වීමට නියමිතයි.'],
      ['The train is delayed by about half an hour.', 'දුම්රිය පැය භාගයක් පමණ ප්‍රමාදයි.'],
    ] },
    { title: 'Ask the conductor for help', titleSi: 'කොන්දොස්තරගෙන් උදව් ඉල්ලන්න', phrases: [
      ['Please let me know when we reach the hospital.', 'රෝහලට ආ විට මට කියන්න.'], ['Does this bus stop near the university?', 'මේ බස් එක විශ්වවිද්‍යාලය අසල නවත්වනවාද?'],
      ['I think I have got on the wrong bus.', 'මම වැරදි බස් එකට නැගලා කියා මට හිතෙනවා.'],
      ['Could you help me find a seat for my mother?', 'මගේ අම්මාට ආසනයක් සොයාගන්න උදව් කරන්න පුළුවන්ද?'],
      ['Where should I get off for the museum?', 'කෞතුකාගාරයට යන්න මම බැසිය යුත්තේ කොතැනින්ද?'],
    ] },
    { title: 'Get off at the correct stop', titleSi: 'නිවැරදි නැවතුමේදී බසින්න', phrases: [
      ['Is this the stop for the town centre?', 'නගර මධ්‍යයට යන නැවතුම මේකද?'], ['Please stop at the next bus stop.', 'කරුණාකර ඊළඟ බස් නැවතුමේ නවත්වන්න.'],
      ['I need to get off at the railway station.', 'මට දුම්රිය ස්ථානයෙන් බහින්න ඕනේ.'],
      ['How many stops are there before the market?', 'වෙළඳපොළට කලින් නැවතුම් කීයක් තිබෙනවාද?'],
      ['We have passed my stop. What should I do?', 'අපි මගේ නැවතුම පසුකරලා. දැන් මම මොකද කරන්නේ?'],
    ] },
    { title: 'Change buses or trains', titleSi: 'බස් හෝ දුම්රිය මාරු කරන්න', phrases: [
      ['Where can I change to the number 138 bus?', '138 බස් රථයට මාරු විය හැක්කේ කොතැනින්ද?'],
      ['Do I need to change trains at Fort?', 'මට කොටුවේදී දුම්රිය මාරු කරන්න ඕනේද?'],
      ['This ticket is valid for the connecting train.', 'මෙම ටිකට් පත සම්බන්ධක දුම්රියට වලංගුයි.'],
      ['How long is the wait for the next bus?', 'ඊළඟ බස් රථය සඳහා කොපමණ වේලාවක් බලා සිටිය යුතුද?'],
      ['The connection leaves from the opposite platform.', 'සම්බන්ධක දුම්රිය පිටත් වන්නේ විරුද්ධ වේදිකාවෙන්.'],
    ] },
    { title: 'Understand station announcements', titleSi: 'ස්ථාන නිවේදන තේරුම් ගන්න', phrases: [
      ['The train on platform one is arriving now.', 'පළමු වේදිකාවට දුම්රිය දැන් ළඟා වෙමින් තිබෙනවා.'],
      ['The express train to Colombo is delayed.', 'කොළඹට යන සීඝ්‍රගාමී දුම්රිය ප්‍රමාදයි.'],
      ['Passengers for Kandy should board now.', 'මහනුවරට යන මගීන් දැන් දුම්රියට නගින්න.'],
      ['The next service will stop at all stations.', 'ඊළඟ දුම්රිය සියලුම ස්ථානවල නවත්වනවා.'],
      ['Please keep away from the platform edge.', 'කරුණාකර වේදිකාවේ අයිනෙන් ඈත්ව සිටින්න.'],
    ] },
    { title: 'Ask for help when plans change', titleSi: 'ගමන් සැලසුම් වෙනස් වූ විට උදව් ඉල්ලන්න', phrases: [
      ['My train has been cancelled. What are my options?', 'මගේ දුම්රිය අවලංගු කරලා. මට තිබෙන විකල්ප මොනවාද?'],
      ['Can I use this ticket on the next service?', 'මේ ටිකට් පත ඊළඟ දුම්රියට භාවිත කළ හැකිද?'],
      ['Where is the information desk?', 'තොරතුරු කවුළුව කොහෙද?'],
      ['Could you help me arrange another route?', 'වෙනත් ගමන් මාර්ගයක් සොයාගන්න උදව් කරන්න පුළුවන්ද?'],
      ['I will call my family to tell them I am delayed.', 'මම ප්‍රමාද බව කියන්න පවුලට දුරකථන ඇමතුමක් දෙන්නම්.'],
    ] },
    { title: 'Complete a public-transport role-play', titleSi: 'පොදු ප්‍රවාහන සංවාදයක් සම්පූර්ණ කරන්න', phrases: [
      ['Excuse me, is this the queue for tickets to Ella?', 'සමාවන්න, ඇල්ලට ටිකට් ගන්න පෝලිම මේකද?'],
      ['Yes. The next train leaves at 9:20 from platform two.', 'ඔව්. ඊළඟ දුම්රිය 9:20ට දෙවන වේදිකාවෙන් පිටත් වෙනවා.'],
      ['Are there any seats left in second class?', 'දෙවන පන්තියේ ආසන ඉතිරිව තිබෙනවාද?'],
      ['There are a few seats, but they are not reserved.', 'ආසන කිහිපයක් තිබෙනවා, නමුත් ඒවා වෙන් කරලා නැහැ.'],
      ['Thank you. I will buy one ticket, please.', 'ස්තුතියි. කරුණාකර මට එක ටිකට් පතක් දෙන්න.'],
    ] },
  ],
};

// These two units are deliberately task-led: every model sentence is about
// the stated family/past-be objective rather than an abstract module label.
Object.assign(CURATED_LESSONS, {
  'Describing Family': [
    { title: 'Name close family members', titleSi: 'ළඟම පවුලේ අය හඳුන්වන්න', phrases: [['This is my mother, and this is my father.', 'මේ මගේ අම්මා, මේ මගේ තාත්තා.'], ['I have one older brother.', 'මට වැඩිමහල් සහෝදරයෙක් ඉන්නවා.'], ['My younger sister is called Nadeesha.', 'මගේ බාල සහෝදරියගේ නම නදීෂා.'], ['We live together in Kurunegala.', 'අපි කුරුණෑගල එකට ජීවත් වෙනවා.'], ['My parents are both teachers.', 'මගේ දෙමාපියන් දෙදෙනාම ගුරුවරු.']] },
    { title: 'Describe sibling relationships', titleSi: 'සහෝදර සහෝදරියන් ගැන කතා කරන්න', phrases: [['I have two sisters but no brothers.', 'මට සහෝදරියන් දෙදෙනෙක් ඉන්නවා, නමුත් සහෝදරයන් නැහැ.'], ['My brother is three years older than me.', 'මගේ සහෝදරයා මට වඩා අවුරුදු තුනක් වැඩිමල්.'], ['Do you have any brothers or sisters?', 'ඔයාට සහෝදර සහෝදරියන් ඉන්නවාද?'], ['Yes, I have one younger brother.', 'ඔව්, මට එක් බාල සහෝදරයෙක් ඉන්නවා.'], ['We often help each other with our studies.', 'අපි නිතරම ඉගෙනීමේදී එකිනෙකාට උදව් කරනවා.']] },
    { title: 'Introduce your extended family', titleSi: 'විස්තෘත පවුල හඳුන්වා දෙන්න', phrases: [['My grandmother lives with my aunt in Galle.', 'මගේ ආච්චි ගාල්ලේ නැන්දා සමඟ ජීවත් වෙනවා.'], ['Uncle Sunil is my father’s older brother.', 'සුනිල් මාමා මගේ තාත්තාගේ වැඩිමහල් සහෝදරයා.'], ['We visit our cousins during the school holidays.', 'පාසල් නිවාඩුවේදී අපි ඥාති සහෝදර සහෝදරියන් බලන්න යනවා.'], ['How many cousins have you got?', 'ඔයාට ඥාති සහෝදර සහෝදරියන් කී දෙනෙක් ඉන්නවාද?'], ['I have four cousins on my mother’s side.', 'අම්මාගේ පාර්ශ්වයෙන් මට ඥාති සහෝදර සහෝදරියන් හතර දෙනෙක් ඉන්නවා.']] },
    { title: 'Describe a relative’s appearance', titleSi: 'ඥාතියෙකුගේ පෙනුම විස්තර කරන්න', phrases: [['My grandfather is tall and wears glasses.', 'මගේ සීයා උසයි, කණ්ණාඩි පළඳිනවා.'], ['My aunt has long, curly hair.', 'මගේ නැන්දාට දිග රැලි සහිත කොණ්ඩයක් තියෙනවා.'], ['My cousin has bright brown eyes.', 'මගේ ඥාති සහෝදරයාට දීප්තිමත් දුඹුරු ඇස් තියෙනවා.'], ['What does your sister look like?', 'ඔයාගේ සහෝදරියගේ පෙනුම කොහොමද?'], ['She is short and has a friendly smile.', 'ඇය මිටි වන අතර සුහද සිනහවක් තියෙනවා.']] },
    { title: 'Describe family members’ personalities', titleSi: 'පවුලේ අයගේ ගතිගුණ විස්තර කරන්න', phrases: [['My father is patient and hard-working.', 'මගේ තාත්තා ඉවසිලිවන්ත සහ මහන්සි වී වැඩ කරන කෙනෙක්.'], ['My sister is cheerful and helpful.', 'මගේ සහෝදරිය සතුටින් සිටින, උදව් කරන කෙනෙක්.'], ['My grandfather is quiet but very kind.', 'මගේ සීයා නිහඬයි, නමුත් ඉතා කරුණාවන්තයි.'], ['Who is the funniest person in your family?', 'ඔයාගේ පවුලේ විහිළුම පුද්ගලයා කවුද?'], ['My uncle tells the best stories.', 'හොඳම කතා කියන්නේ මගේ මාමා.']] },
    { title: 'Talk about relatives’ jobs and studies', titleSi: 'ඥාතීන්ගේ රැකියා සහ ඉගෙනීම ගැන කතා කරන්න', phrases: [['My mother works at a hospital.', 'මගේ අම්මා රෝහලක වැඩ කරනවා.'], ['My older brother studies engineering.', 'මගේ වැඩිමහල් සහෝදරයා ඉංජිනේරු විද්‍යාව හදාරනවා.'], ['My aunt runs a small shop near our house.', 'අපේ ගෙදර ළඟ කුඩා කඩයක් මගේ නැන්දා පවත්වාගෙන යනවා.'], ['What does your father do?', 'ඔයාගේ තාත්තාගේ රැකියාව මොකක්ද?'], ['He is a bus driver, and he starts work early.', 'ඔහු බස් රියදුරෙක්, ඔහු උදෙන්ම වැඩ පටන් ගන්නවා.']] },
    { title: 'Describe family routines', titleSi: 'පවුලේ දෛනික පුරුදු විස්තර කරන්න', phrases: [['We have dinner together at seven.', 'අපි හතට එකට රාත්‍රී ආහාරය ගන්නවා.'], ['My grandmother tells us a story after dinner.', 'රාත්‍රී ආහාරයෙන් පසු ආච්චි අපට කතාවක් කියනවා.'], ['My parents usually visit the market on Saturday.', 'මගේ දෙමාපියන් සාමාන්‍යයෙන් සෙනසුරාදා වෙළඳපොළට යනවා.'], ['Who cooks at your home?', 'ඔයාලගේ ගෙදර කෑම හදන්නේ කවුද?'], ['My father cooks when my mother is busy.', 'අම්මා කාර්යබහුල වෙලාවට තාත්තා කෑම හදනවා.']] },
    { title: 'Ask and answer about relatives', titleSi: 'ඥාතීන් ගැන ප්‍රශ්න අසා පිළිතුරු දෙන්න', phrases: [['Is your grandmother at home today?', 'අද ඔයාගේ ආච්චි ගෙදරද?'], ['No, she is visiting my uncle.', 'නැහැ, ඇය මගේ මාමා බලන්න ගිහින්.'], ['Where does your cousin live?', 'ඔයාගේ ඥාති සහෝදරයා ජීවත් වෙන්නේ කොහේද?'], ['He lives in Matara with his parents.', 'ඔහු තම දෙමාපියන් සමඟ මාතර ජීවත් වෙනවා.'], ['When will your family visit us?', 'ඔයාලගේ පවුල අපිව බලන්න එන්නේ කවදාද?']] },
    { title: 'Describe a family celebration', titleSi: 'පවුලේ උත්සවයක් විස්තර කරන්න', phrases: [['Last April, our whole family met at my aunt’s house.', 'පසුගිය අප්‍රේල් මාසයේ අපේ මුළු පවුලම නැන්දාගේ ගෙදරදී හමුවුණා.'], ['My cousins helped decorate the garden.', 'උයන සැරසීමට මගේ ඥාති සහෝදර සහෝදරියන් උදව් කළා.'], ['Grandmother made kiribath for everyone.', 'ආච්චි හැමෝටම කිරිබත් හැදුවා.'], ['We took a photograph before the guests left.', 'අමුත්තන් පිටත්ව යාමට පෙර අපි ඡායාරූපයක් ගත්තා.'], ['It was a lovely day with the people I love.', 'මම ආදරය කරන අය සමඟ එය ලස්සන දවසක් වුණා.']] },
    { title: 'Give a short introduction to your family', titleSi: 'ඔබේ පවුල ගැන කෙටි හැඳින්වීමක් කරන්න', phrases: [['There are five people in my family.', 'මගේ පවුලේ පස් දෙනෙක් ඉන්නවා.'], ['I live with my parents, my sister and my grandmother.', 'මම දෙමාපියන්, සහෝදරිය සහ ආච්චි සමඟ ජීවත් වෙනවා.'], ['My sister is studying for her A-level examinations.', 'මගේ සහෝදරිය උසස් පෙළ විභාගයට පාඩම් කරනවා.'], ['We support one another when someone has a problem.', 'කෙනෙකුට ප්‍රශ්නයක් ඇති විට අපි එකිනෙකාට සහයෝගය දෙනවා.'], ['I feel lucky to have such a caring family.', 'මෙතරම් සැලකිලිමත් පවුලක් සිටීම ගැන මට සතුටුයි.']] },
  ],
  'Past Regular Verbs': [
    { title: 'Add -ed to regular verbs', titleSi: 'නිත්‍ය ක්‍රියා පදවලට -ed එක් කරන්න', phrases: [['I walked to school with my friend.', 'මම මගේ මිතුරා සමඟ පාසලට පයින් ගියා.'], ['We watched a film after dinner.', 'රාත්‍රී ආහාරයෙන් පසු අපි චිත්‍රපටයක් බැලුවා.'], ['She cleaned her room on Saturday.', 'ඇය සෙනසුරාදා ඇගේ කාමරය පිරිසිදු කළා.'], ['They visited the museum in Colombo.', 'ඔවුන් කොළඹ කෞතුකාගාරය නැරඹුවා.'], ['He helped his father wash the car.', 'ඔහු තාත්තාට කාර් එක සෝදන්න උදව් කළා.']] },
    { title: 'Add -d to verbs ending in e', titleSi: 'e අකුරින් අවසන් වන ක්‍රියා පදවලට -d එක් කරන්න', phrases: [['We arrived at the station early.', 'අපි දුම්රිය ස්ථානයට වේලාසනින් ආවා.'], ['My uncle lived in Kandy for five years.', 'මගේ මාමා අවුරුදු පහක් මහනුවර ජීවත් වුණා.'], ['I baked a cake for my sister.', 'මම මගේ සහෝදරිය වෙනුවෙන් කේක් එකක් පිළිස්සුවා.'], ['She smiled when she saw the baby.', 'දරුවා දැකලා ඇය සිනාසුණා.'], ['They closed the shop at nine.', 'ඔවුන් නවයට කඩය වසා දැමුවා.']] },
    { title: 'Change consonant + y to -ied', titleSi: 'ව්‍යංජනයක් සහ y අවසානය -ied ලෙස වෙනස් කරන්න', phrases: [['I studied English for an hour.', 'මම පැයක් ඉංග්‍රීසි ඉගෙන ගත්තා.'], ['She carried the shopping bags home.', 'ඇය බඩු මලු ගෙදරට ගෙන ගියා.'], ['The children played cricket after school.', 'පාසලෙන් පසු ළමයි ක්‍රිකට් ක්‍රීඩා කළා.'], ['He tried to call the clinic twice.', 'ඔහු සායනයට දෙවරක් දුරකථන ඇමතුමක් දෙන්න උත්සාහ කළා.'], ['We enjoyed the New Year celebration.', 'අපි අලුත් අවුරුදු උත්සවය රස වින්දා.']] },
    { title: 'Double the final consonant in short verbs', titleSi: 'කෙටි ක්‍රියා පදයක අවසාන ව්‍යංජනය දෙගුණ කරන්න', phrases: [['The bus stopped near the school.', 'බස් රථය පාසල ළඟ නැවැත්තුවා.'], ['I planned a picnic with my cousins.', 'මම මගේ ඥාති සහෝදරයන් සමඟ විනෝද චාරිකාවක් සැලසුම් කළා.'], ['She dropped her keys outside the shop.', 'ඇය කඩයෙන් පිටත යතුරු බිම දැම්මා.'], ['We travelled to Ella by train.', 'අපි දුම්රියෙන් ඇල්ලට ගමන් කළා.'], ['He begged his friend to wait.', 'ඔහු තම මිතුරාට ටිකක් ඉන්න කියලා ඉල්ලා සිටියා.']] },
    { title: 'Make past negatives with didn’t + base verb', titleSi: 'didn’t සහ මූලික ක්‍රියා පදය යොදා අතීත නිෂේධ සාදන්න', phrases: [['I didn’t walk to school yesterday.', 'මම ඊයේ පාසලට පයින් ගියේ නැහැ.'], ['She didn’t visit her aunt last weekend.', 'ඇය පසුගිය සති අන්තයේ නැන්දා බලන්න ගියේ නැහැ.'], ['We didn’t watch television after dinner.', 'අපි රාත්‍රී ආහාරයෙන් පසු රූපවාහිනිය බැලුවේ නැහැ.'], ['They didn’t clean the classroom on Friday.', 'ඔවුන් සිකුරාදා පන්ති කාමරය පිරිසිදු කළේ නැහැ.'], ['He didn’t call the hotel before he travelled.', 'ගමනට පෙර ඔහු හෝටලයට කතා කළේ නැහැ.']] },
    { title: 'Ask yes-or-no questions with did', titleSi: 'did යොදා ඔව්-නැහැ ප්‍රශ්න අසන්න', phrases: [['Did you finish your homework?', 'ඔයා ගෙදර වැඩ අවසන් කළාද?'], ['Did she arrive before the meeting?', 'රැස්වීමට පෙර ඇය ආවාද?'], ['Did they book a room in advance?', 'ඔවුන් කලින් කාමරයක් වෙන් කළාද?'], ['Did your brother repair the bicycle?', 'ඔයාගේ සහෝදරයා බයිසිකලය අලුත්වැඩියා කළාද?'], ['Did we turn off the lights?', 'අපි විදුලි පහන් නිවා දැමුවාද?']] },
    { title: 'Ask where, when and why about past actions', titleSi: 'අතීත ක්‍රියා ගැන where, when සහ why අසන්න', phrases: [['Where did you stay in Galle?', 'ඔයා ගාල්ලේ නැවතුණේ කොහේද?'], ['When did the class start?', 'පන්තිය පටන් ගත්තේ කවදාද?'], ['Why did she change her appointment?', 'ඇය හමුවීමේ වේලාව වෙනස් කළේ ඇයි?'], ['Who did you invite to the birthday party?', 'ඔයා උපන්දිනයට ආරාධනා කළේ කාටද?'], ['How did they travel to the village?', 'ඔවුන් ගමට ගියේ කොහොමද?']] },
    { title: 'Add a clear past-time expression', titleSi: 'පැහැදිලි අතීත කාල වචනයක් එක් කරන්න', phrases: [['I called my grandmother last night.', 'මම ඊයේ රාත්‍රියේ ආච්චිට කතා කළා.'], ['We visited the temple two days ago.', 'අපි දවස් දෙකකට පෙර පන්සලට ගියා.'], ['He worked at the hotel in 2024.', 'ඔහු 2024 දී හෝටලයේ වැඩ කළා.'], ['They moved to Kandy last month.', 'ඔවුන් පසුගිය මාසයේ මහනුවරට පදිංචියට ගියා.'], ['She finished the report yesterday morning.', 'ඇය ඊයේ උදේ වාර්තාව අවසන් කළා.']] },
    { title: 'Put past actions in order', titleSi: 'අතීත ක්‍රියා අනුපිළිවෙළට කියන්න', phrases: [['First, we packed our bags; then we called a taxi.', 'මුලින්ම අපි බෑග් සූදානම් කළා; ඊට පස්සේ ටැක්සියක් කැඳෙව්වා.'], ['I reached the station, bought a ticket and boarded the train.', 'මම දුම්රිය ස්ථානයට ගිහින් ටිකට් එකක් ගෙන දුම්රියට නැග්ගා.'], ['She cooked dinner, and her brother washed the dishes.', 'ඇය රාත්‍රී ආහාරය හැදුවා, ඇගේ සහෝදරයා පිඟන් සේදුවා.'], ['After we finished the lesson, we practised the dialogue.', 'පාඩම අවසන් කළාට පස්සේ අපි සංවාදය පුහුණු කළා.'], ['He missed the bus, so he walked to work.', 'ඔහුට බස් එක මඟහැරුණු නිසා පයින් වැඩට ගියා.']] },
    { title: 'Tell what you did last weekend', titleSi: 'පසුගිය සති අන්තයේ කළ දේ කියන්න', phrases: [['On Saturday, I visited my grandparents.', 'සෙනසුරාදා මම ආච්චි සීයා බලන්න ගියා.'], ['We talked for a long time and shared lunch.', 'අපි දිගු වේලාවක් කතා කරලා දවල් කෑම බෙදාගෙන කෑවා.'], ['In the afternoon, I helped my uncle in his garden.', 'හවස මම මාමාගේ වත්තේ වැඩට උදව් කළා.'], ['On Sunday, I studied for my English class.', 'ඉරිදා මම ඉංග්‍රීසි පන්තියට පාඩම් කළා.'], ['I enjoyed the weekend because I spent time with my family.', 'පවුලේ අය සමඟ කාලය ගත කළ නිසා මම සති අන්තය සතුටින් ගත කළා.']] },
  ],
  'Past Irregular Verbs': [
    { title: 'Learn common irregular verb pairs', titleSi: 'සාමාන්‍ය අනිත්‍ය ක්‍රියා පද යුගල ඉගෙන ගන්න', phrases: [['I go to work by bus every day; yesterday I went by train.', 'මම හැමදාම බස් එකෙන් වැඩට යනවා; ඊයේ දුම්රියෙන් ගියා.'], ['She eats rice for lunch; yesterday she ate noodles.', 'ඇය දවල්ට බත් කනවා; ඊයේ නූඩ්ල්ස් කෑවා.'], ['We see our neighbours often; we saw them this morning.', 'අපි අසල්වැසියන් නිතර දකිනවා; අද උදේ ඔවුන්ව දැක්කා.'], ['He buys bread here; he bought two loaves yesterday.', 'ඔහු මෙතැනින් පාන් ගන්නවා; ඊයේ ගෙඩි දෙකක් ගත්තා.'], ['They come by train; they came early today.', 'ඔවුන් දුම්රියෙන් එනවා; අද වේලාසනින් ආවා.']] },
    { title: 'Use went, came and saw in a trip story', titleSi: 'ගමන් කතාවක went, came සහ saw යොදන්න', phrases: [['We went to Nuwara Eliya during the holidays.', 'නිවාඩුවේදී අපි නුවරඑළියට ගියා.'], ['My cousins came with us by bus.', 'මගේ ඥාති සහෝදරයෝ අපිත් එක්ක බස් එකෙන් ආවා.'], ['We saw tea fields along the road.', 'පාර දිගේ තේ වතු අපි දැක්කා.'], ['Then we had lunch near the lake.', 'ඊට පස්සේ වැව ළඟ අපි දවල් කෑම ගත්තා.'], ['We came home tired but happy.', 'අපි මහන්සියෙන් නමුත් සතුටින් ගෙදර ආවා.']] },
    { title: 'Use ate, drank and made for meals', titleSi: 'ආහාර ගැන කියන විට ate, drank සහ made යොදන්න', phrases: [['I ate string hoppers for breakfast.', 'මම උදේට ඉඳිආප්ප කෑවා.'], ['My mother made dhal curry for lunch.', 'අම්මා දවල් කෑමට පරිප්පු හොද්ද හැදුවා.'], ['We drank king coconut water after the walk.', 'ඇවිදලා ඉවර වෙලා අපි තැඹිලි වතුර බිව්වා.'], ['He took a piece of cake but didn’t eat it.', 'ඔහු කේක් කෑල්ලක් ගත්තා, නමුත් එය කෑවේ නැහැ.'], ['What did you have for dinner yesterday?', 'ඔයා ඊයේ රාත්‍රී ආහාරයට ගත්තේ මොනවාද?']] },
    { title: 'Use had and got for everyday events', titleSi: 'දෛනික සිදුවීම් සඳහා had සහ got යොදන්න', phrases: [['We had a meeting at nine.', 'අපට නවයට රැස්වීමක් තිබුණා.'], ['She got a message from the clinic.', 'ඇයට සායනයෙන් පණිවිඩයක් ලැබුණා.'], ['I had a headache, so I went home.', 'මට හිසරදයක් තිබුණු නිසා මම ගෙදර ගියා.'], ['They got the wrong bus and arrived late.', 'ඔවුන් වැරදි බස් එකට නැගලා පරක්කු වී ආවා.'], ['He had enough time to buy a ticket.', 'ටිකට් එකක් ගන්න ඔහුට ප්‍රමාණවත් කාලය තිබුණා.']] },
    { title: 'Use took, gave and brought', titleSi: 'took, gave සහ brought භාවිත කරන්න', phrases: [['I took my umbrella because it looked cloudy.', 'අහස වලාකුළු සහිත නිසා මම කුඩය ගත්තා.'], ['She gave her seat to an older passenger.', 'ඇය වයසක මගියෙකුට තම ආසනය දුන්නා.'], ['My friend brought a map to the trip.', 'මගේ මිතුරා ගමනට සිතියමක් ගෙනාවා.'], ['We took some photographs near the waterfall.', 'දිය ඇල්ල ළඟ අපි ඡායාරූප කිහිපයක් ගත්තා.'], ['Who brought these books to class?', 'මේ පොත් පන්තියට ගෙනාවේ කවුද?']] },
    { title: 'Make irregular-verb negatives with didn’t', titleSi: 'didn’t යොදා අනිත්‍ය ක්‍රියා පද නිෂේධ කරන්න', phrases: [['I didn’t go to the shop yesterday.', 'මම ඊයේ කඩයට ගියේ නැහැ.'], ['She didn’t see the email until this morning.', 'අද උදේ වෙනතුරු ඇය විද්‍යුත් ලිපිය දැක්කේ නැහැ.'], ['We didn’t have enough time for breakfast.', 'උදේ කෑමට අපට ප්‍රමාණවත් කාලයක් තිබුණේ නැහැ.'], ['They didn’t bring their tickets.', 'ඔවුන් ටිකට් ගෙනාවේ නැහැ.'], ['He didn’t take the medicine after lunch.', 'දවල් කෑමෙන් පසු ඔහු බෙහෙත ගත්තේ නැහැ.']] },
    { title: 'Ask questions with did + base verb', titleSi: 'did සහ මූලික ක්‍රියා පදය යොදා ප්‍රශ්න අසන්න', phrases: [['Did you go to the bank this morning?', 'ඔයා අද උදේ බැංකුවට ගියාද?'], ['What did she buy at the market?', 'ඇය වෙළඳපොළෙන් ගත්තේ මොනවාද?'], ['Where did they meet their teacher?', 'ඔවුන් ගුරුවරයා හමුවුණේ කොහේද?'], ['Did he write the appointment time down?', 'ඔහු හමුවීමේ වේලාව ලියාගත්තාද?'], ['Who did you see at the station?', 'දුම්රිය ස්ථානයේදී ඔයා දැක්කේ කාවද?']] },
    { title: 'Choose the correct past form in a short story', titleSi: 'කෙටි කතාවක නිවැරදි අතීත රූපය තෝරන්න', phrases: [['I woke up late, so I ran to the bus stop.', 'මම පරක්කු වී අවදි වුණු නිසා බස් නැවතුමට දිව්වා.'], ['The bus came just as I reached the road.', 'මම පාරට ආ විටම බස් එක ආවා.'], ['I sat beside a woman who read a newspaper.', 'පුවත්පතක් කියවමින් සිටි කාන්තාවක් ළඟ මම වාඩි වුණා.'], ['She told me where to get off.', 'බහින්න ඕන තැන ඇය මට කිව්වා.'], ['I got to work on time after all.', 'කොහොම වුණත් මම නියමිත වේලාවට වැඩට ආවා.']] },
    { title: 'Put irregular past actions in sequence', titleSi: 'අනිත්‍ය අතීත ක්‍රියා අනුපිළිවෙළට කියන්න', phrases: [['First, we left home; then we caught the train.', 'මුලින්ම අපි ගෙදරින් පිටත් වුණා; ඊට පස්සේ දුම්රියට නැග්ගා.'], ['We found our seats and put our bags away.', 'අපේ ආසන හොයාගෙන බෑග් තැන්පත් කළා.'], ['At the next station, our friends got on.', 'ඊළඟ දුම්රිය ස්ථානයේදී අපේ මිතුරන් නැග්ගා.'], ['We spoke together until the train stopped.', 'දුම්රිය නැවැත්වෙන තුරු අපි එකට කතා කළා.'], ['They went home by tuk-tuk after the trip.', 'ගමනෙන් පසු ඔවුන් ත්‍රීරෝද රථයෙන් ගෙදර ගියා.']] },
    { title: 'Tell a personal story with irregular verbs', titleSi: 'අනිත්‍ය ක්‍රියා පද යොදා පෞද්ගලික කතාවක් කියන්න', phrases: [['Last month, I lost my wallet on the bus.', 'පසුගිය මාසයේ බස් එකේදී මගේ පසුම්බිය නැති වුණා.'], ['A kind passenger found it under a seat.', 'කරුණාවන්ත මගියෙක් එය ආසනයක් යට තිබී සොයාගත්තා.'], ['She took it to the driver and gave him my ID card.', 'ඇය එය රියදුරුට දී මගේ හැඳුනුම්පතත් දුන්නා.'], ['The driver called me, and I came back to the bus stand.', 'රියදුරු මට කතා කළා, මම නැවත බස් නැවතුමට ආවා.'], ['I felt relieved because I got everything back.', 'හැමදේම නැවත ලැබුණු නිසා මට සැනසීමක් දැනුණා.']] },
  ],
  'Past Be: Was & Were': [
    { title: 'Say where people were yesterday', titleSi: 'ඊයේ අය සිටි තැන් කියන්න', phrases: [['I was at home yesterday afternoon.', 'ඊයේ හවස මම ගෙදර හිටියා.'], ['My parents were at the market.', 'මගේ දෙමාපියන් වෙළඳපොළේ හිටියා.'], ['Nimali was in the library after class.', 'පන්තියෙන් පසු නිමාලි පුස්තකාලයේ හිටියා.'], ['We were near the bus stop at six.', 'හයට අපි බස් නැවතුම ළඟ හිටියා.'], ['The children were in the garden.', 'ළමයි උයනේ හිටියා.']] },
    { title: 'Describe feelings in the past', titleSi: 'අතීතයේ දැනුණු හැඟීම් විස්තර කරන්න', phrases: [['I was tired after the long journey.', 'දිගු ගමනෙන් පසු මට මහන්සි දැනුණා.'], ['The students were excited about the trip.', 'ගමන ගැන සිසුන් උද්යෝගයෙන් හිටියා.'], ['Amma was worried when I came home late.', 'මම ගෙදර පරක්කු වී ආ විට අම්මා කනස්සල්ලෙන් හිටියා.'], ['We were happy to see our cousins.', 'අපේ ඥාති සහෝදර සහෝදරියන් දැකලා අපි සතුටු වුණා.'], ['The shop assistant was very helpful.', 'කඩයේ සේවකයා ඉතා උදව්ශීලී වුණා.']] },
    { title: 'Make past be sentences negative', titleSi: 'was සහ were යොදා නිෂේධ වාක්‍ය සාදන්න', phrases: [['I was not at school on Monday.', 'සඳුදා මම පාසලේ හිටියේ නැහැ.'], ['The buses were not late this morning.', 'අද උදේ බස් පරක්කු වුණේ නැහැ.'], ['She wasn’t ready for the interview.', 'ඇය සම්මුඛ පරීක්ෂණයට සූදානම්ව හිටියේ නැහැ.'], ['We weren’t in Colombo last weekend.', 'පසුගිය සති අන්තයේ අපි කොළඹ හිටියේ නැහැ.'], ['The food wasn’t cold when it arrived.', 'ආහාරය ලැබෙන විට එය සීතල වෙලා තිබුණේ නැහැ.']] },
    { title: 'Ask yes-or-no questions with was and were', titleSi: 'was සහ were යොදා ඔව්-නැහැ ප්‍රශ්න අසන්න', phrases: [['Was the clinic open yesterday?', 'ඊයේ සායනය විවෘතව තිබුණාද?'], ['Were you at the station before eight?', 'අටට පෙර ඔයා දුම්රිය ස්ථානයේ හිටියාද?'], ['Was your brother sick last week?', 'පසුගිය සතියේ ඔයාගේ සහෝදරයා අසනීපෙන් හිටියාද?'], ['Were the tickets expensive?', 'ටිකට් මිල අධික වුණාද?'], ['Was it rainy during the match?', 'තරගය අතරතුර වැස්ස තිබුණාද?']] },
    { title: 'Give short answers about the past', titleSi: 'අතීතය ගැන කෙටි පිළිතුරු දෙන්න', phrases: [['Was your teacher absent? Yes, she was.', 'ඔයාගේ ගුරුවරිය පැමිණ සිටියේ නැද්ද? ඔව්, ඇය හිටියේ නැහැ.'], ['Were the shops open? No, they weren’t.', 'කඩ විවෘතව තිබුණාද? නැහැ, ඒවා විවෘතව තිබුණේ නැහැ.'], ['Was the train crowded? Yes, it was.', 'දුම්රිය පිරී තිබුණාද? ඔව්, එය පිරී තිබුණා.'], ['Were you nervous? No, I wasn’t.', 'ඔයාට බය හිතුණාද? නැහැ, මට බය හිතුණේ නැහැ.'], ['Was your family at the wedding? Yes, we were.', 'ඔයාලගේ පවුල විවාහ උත්සවයේ හිටියාද? ඔව්, අපි හිටියා.']] },
    { title: 'Use there was and there were', titleSi: 'there was සහ there were භාවිත කරන්න', phrases: [['There was a small crowd outside the hall.', 'ශාලාවෙන් පිටත කුඩා පිරිසක් හිටියා.'], ['There were two empty seats near the window.', 'කවුළුව ළඟ හිස් ආසන දෙකක් තිබුණා.'], ['There wasn’t a pharmacy open at midnight.', 'මධ්‍යම රාත්‍රියේ විවෘතව තිබූ ඖෂධසලක් තිබුණේ නැහැ.'], ['Were there many people at the meeting?', 'රැස්වීමේ බොහෝ දෙනෙක් හිටියාද?'], ['There were plenty of mangoes on the tree.', 'ගසෙහි අඹ ගොඩක් තිබුණා.']] },
    { title: 'Add past time expressions', titleSi: 'අතීත කාලය දැක්වෙන වචන එක් කරන්න', phrases: [['I was at the dentist two days ago.', 'දවස් දෙකකට පෙර මම දන්ත වෛද්‍යවරයා ළඟ හිටියා.'], ['They were in Jaffna last month.', 'පසුගිය මාසයේ ඔවුන් යාපනයේ හිටියා.'], ['The road was quiet early this morning.', 'අද උදේම පාර නිහඬව තිබුණා.'], ['We weren’t busy at this time yesterday.', 'ඊයේ මේ වෙලාවේ අපි කාර්යබහුලව හිටියේ නැහැ.'], ['Where were you on your last birthday?', 'ඔයාගේ පසුගිය උපන්දිනය දවසේ ඔයා කොහේද හිටියේ?']] },
    { title: 'Distinguish past be from past actions', titleSi: 'past be සහ අතීත ක්‍රියා පද වෙන්කර හඳුනාගන්න', phrases: [['I was at the station, but I missed the train.', 'මම දුම්රිය ස්ථානයේ හිටියා, නමුත් මට දුම්රිය මඟහැරුණා.'], ['She was tired, so she went to bed early.', 'ඇයට මහන්සි නිසා ඇය වේලාසනින් නින්දට ගියා.'], ['We were at home and watched a film.', 'අපි ගෙදර හිටියා, චිත්‍රපටයක් බැලුවා.'], ['The restaurant was full, so we chose another one.', 'අවන්හල පිරී තිබුණු නිසා අපි වෙන එකක් තෝරාගත්තා.'], ['Were you ill, or did you miss the bus?', 'ඔයා අසනීපෙන්ද හිටියේ, නැත්නම් බස් එක මඟහැරුණාද?']] },
    { title: 'Tell a short story with was and were', titleSi: 'was සහ were යොදා කෙටි කතාවක් කියන්න', phrases: [['Last Sunday was my cousin’s wedding.', 'පසුගිය ඉරිදා මගේ ඥාති සහෝදරියගේ විවාහය තිබුණා.'], ['The ceremony was at a temple near Kandy.', 'උත්සවය මහනුවර ළඟ පන්සලක තිබුණා.'], ['All our relatives were there before noon.', 'දහවල් වීමට පෙර අපේ සියලුම ඥාතීන් එහි හිටියා.'], ['The weather was sunny, and the children were happy.', 'කාලගුණය හිරු එළියෙන් යුක්ත වූ අතර ළමයි සතුටින් හිටියා.'], ['It was a special day for our family.', 'එය අපේ පවුලට විශේෂ දවසක් වුණා.']] },
    { title: 'Talk about a past place and experience', titleSi: 'අතීත ස්ථානයක් සහ අත්දැකීමක් ගැන කතා කරන්න', phrases: [['Where were you during the school holidays?', 'පාසල් නිවාඩුවේදී ඔයා කොහේද හිටියේ?'], ['I was in Badulla with my grandparents.', 'මම ආච්චි සීයා සමඟ බදුල්ලේ හිටියා.'], ['The guesthouse was near a tea plantation.', 'අමුත්තන්ගේ නවාතැන තේ වත්තක් ළඟ තිබුණා.'], ['The mornings were cool, but the afternoons were warm.', 'උදෑසන සිසිල් වුණා, නමුත් හවස් කාලය උණුසුම් වුණා.'], ['We were very glad we went.', 'අපි ගිය එක ගැන ඉතා සතුටු වුණා.']] },
  ],
});

Object.assign(CURATED_LESSONS, FOUNDATION_LESSONS);

// Apply the second pedagogical pass before phrase IDs and teaching metadata
// are built, so bundled lessons and generated quizzes use the same models.
VOLUMES[0].modules.forEach((blueprint, moduleIndex) => {
  CURATED_LESSONS[blueprint.name] = CURATED_LESSONS[blueprint.name].map((lesson, stepIndex) =>
    refineFoundationModel(moduleIndex * 10 + stepIndex + 1, lesson));
});

const SUBJECTS = [
  { en: 'I', si: 'මම' }, { en: 'She', si: 'ඇය' }, { en: 'We', si: 'අපි' }, { en: 'They', si: 'ඔවුන්' },
];
const PLACES = [
  { en: 'at home', si: 'නිවසේදී' }, { en: 'at school', si: 'පාසලේදී' }, { en: 'at work', si: 'වැඩපොළේදී' },
  { en: 'on the bus', si: 'බස් රථයේදී' }, { en: 'in Colombo', si: 'කොළඹදී' }, { en: 'in Kandy', si: 'මහනුවරදී' },
  { en: 'at the clinic', si: 'සායනයේදී' }, { en: 'at the market', si: 'වෙළඳපොළේදී' },
  { en: 'with my family', si: 'මගේ පවුල සමඟ' }, { en: 'with my classmates', si: 'මගේ පන්තියේ මිතුරන් සමඟ' },
];
const VERBS = [
  ['practise', 'practises', 'practised', 'practising', 'පුහුණු වීම'], ['discuss', 'discusses', 'discussed', 'discussing', 'සාකච්ඡා කිරීම'],
  ['prepare', 'prepares', 'prepared', 'preparing', 'සූදානම් වීම'], ['explain', 'explains', 'explained', 'explaining', 'පැහැදිලි කිරීම'],
  ['check', 'checks', 'checked', 'checking', 'පරීක්ෂා කිරීම'], ['organise', 'organises', 'organised', 'organising', 'සංවිධානය කිරීම'],
  ['improve', 'improves', 'improved', 'improving', 'වැඩිදියුණු කිරීම'], ['share', 'shares', 'shared', 'sharing', 'බෙදා ගැනීම'],
  ['describe', 'describes', 'described', 'describing', 'විස්තර කිරීම'], ['compare', 'compares', 'compared', 'comparing', 'සංසන්දනය කිරීම'],
  ['choose', 'chooses', 'chose', 'choosing', 'තේරීම'], ['plan', 'plans', 'planned', 'planning', 'සැලසුම් කිරීම'],
  ['solve', 'solves', 'solved', 'solving', 'විසඳීම'], ['record', 'records', 'recorded', 'recording', 'වාර්තා කිරීම'],
  ['review', 'reviews', 'reviewed', 'reviewing', 'පුනරීක්ෂණය කිරීම'], ['support', 'supports', 'supported', 'supporting', 'සහාය දීම'],
  ['request', 'requests', 'requested', 'requesting', 'ඉල්ලීම'], ['confirm', 'confirms', 'confirmed', 'confirming', 'තහවුරු කිරීම'],
  ['recommend', 'recommends', 'recommended', 'recommending', 'නිර්දේශ කිරීම'], ['present', 'presents', 'presented', 'presenting', 'ඉදිරිපත් කිරීම'],
].map(([base, third, past, ing, si]) => ({ base, third, past, ing, si }));

const PATTERN_INFO: Record<Pattern, { title: string; si: string; explanationSi: string; englishPattern?: string; sinhalaPattern?: string }> = {
  present: { title: 'Present simple for everyday sentences', si: 'දෛනික වාක්‍ය සඳහා සරල වර්තමානය', explanationSi: 'I, you, we, they සමඟ මූලික ක්‍රියා පදයත් he, she, it සමඟ s හෝ es යොදන්න.' },
  be: { title: 'Be verbs for identity, description and place', si: 'අනන්‍යතාව, විස්තර සහ ස්ථානය සඳහා be ක්‍රියා පද', explanationSi: 'I සමඟ am, he, she, it සමඟ is, you, we, they සමඟ are යොදන්න.', englishPattern: 'Subject + am/is/are + noun, adjective or place', sinhalaPattern: 'සිංහල: කර්තෘ + විස්තරය + ක්‍රියාව (S-O-V)' },
  count: { title: 'Articles and quantities with useful nouns', si: 'ප්‍රයෝජනවත් නාමපද සමඟ articles සහ ප්‍රමාණ', explanationSi: 'නාමපදය සහ අදහස අනුව a, an, the, some හෝ any තෝරන්න.' },
  question: { title: 'Question word order for conversations', si: 'සංවාද සඳහා ප්‍රශ්න වචන අනුපිළිවෙළ', explanationSi: 'පැහැදිලි ප්‍රශ්නයක් අසන විට question word හෝ auxiliary එක කර්තෘට පෙර යොදන්න.' },
  past: { title: 'Past forms for finished events', si: 'නිම කළ සිදුවීම් සඳහා අතීත රටා', explanationSi: 'නිම කළ සිදුවීමකට අතීත රූපයත් ප්‍රශ්න හෝ නිෂේධයට did යොදන්න.' },
  'past-be': { title: 'Was and were for past states and places', si: 'අතීත තත්ත්ව සහ ස්ථාන සඳහා was සහ were', explanationSi: 'අතීතයේ තත්ත්වයක් හෝ ස්ථානයක් ගැන I, he, she, it සමඟ was ද you, we, they සහ බහුවචන නාමපද සමඟ were ද යොදන්න. නිෂේධයට was not/wasn’t හෝ were not/weren’t යොදන්න. ප්‍රශ්නයේදී was/were කර්තෘට පෙරට ගන්න; did යොදන්නේ නැත.', englishPattern: 'Subject + was/were + noun, adjective or place', sinhalaPattern: 'සිංහල: කර්තෘ + විස්තරය + ක්‍රියාව (S-O-V)' },
  'past-continuous': { title: 'Past continuous for an action in progress', si: 'සිදුවෙමින් තිබූ ක්‍රියාව සඳහා අතීත අඛණ්ඩය', explanationSi: 'අතීත වේලාවක සිදුවෙමින් තිබූ ක්‍රියාවකට was හෝ were සමඟ -ing යොදන්න.' },
  future: { title: 'Future language for plans and predictions', si: 'සැලසුම් සහ අනාවැකි සඳහා අනාගත භාෂාව', explanationSi: 'අනාවැකියකට හෝ තීරණයකට will ද, සැලසුමකට going to ද යොදන්න.' },
  continuous: { title: 'Present continuous for actions happening now', si: 'දැන් සිදුවන ක්‍රියා සඳහා වර්තමාන අඛණ්ඩය', explanationSi: 'දැන් සිදුවන ක්‍රියාවකට am, is හෝ are සමඟ -ing යොදන්න.' },
  perfect: { title: 'Present perfect for experience and results', si: 'අත්දැකීම් සහ ප්‍රතිඵල සඳහා වර්තමාන පූර්ණය', explanationSi: 'අතීතය වර්තමානයට සම්බන්ධ විට have හෝ has සමඟ past participle යොදන්න.' },
  comparison: { title: 'Comparisons and connected ideas', si: 'සංසන්දන සහ සම්බන්ධ කළ අදහස්', explanationSi: 'අදහස් අතර සම්බන්ධය පැහැදිලි කිරීමට සංසන්දන වචන සහ සම්බන්ධක යොදන්න.' },
  modal: { title: 'Modal verbs for ability, advice and duty', si: 'හැකියාව, උපදෙස් සහ වගකීම සඳහා modal ක්‍රියා පද', explanationSi: 'can, could, should, must හෝ may පසු මූලික ක්‍රියා පදය යොදන්න.' },
  polite: { title: 'Polite requests and service conversations', si: 'විනීත ඉල්ලීම් සහ සේවා සංවාද', explanationSi: 'ගෞරවාන්විතව කතා කිරීමට please, could, would සහ සම්පූර්ණ ප්‍රශ්න යොදන්න.' },
  conditional: { title: 'Conditions, causes and possible results', si: 'කොන්දේසි, හේතු සහ හැකි ප්‍රතිඵල', explanationSi: 'කොන්දේසියක් එහි හැකි හෝ කල්පිත ප්‍රතිඵලයට සම්බන්ධ කිරීමට if යොදන්න.' },
  passive: { title: 'Passive voice for processes', si: 'ක්‍රියාවලි සඳහා passive voice', explanationSi: 'සිදුවන දේට අවධානය දීමට be සමඟ past participle යොදන්න.' },
  reported: { title: 'Reported speech for sharing information', si: 'තොරතුරු බෙදා ගැනීමට reported speech', explanationSi: 'වෙනත් කෙනෙකුගේ පණිවිඩය පැහැදිලිව වාර්තා කර අවශ්‍ය විට කාල වචන වෙනස් කරන්න.' },
  relative: { title: 'Relative clauses for precise descriptions', si: 'නිවැරදි විස්තර සඳහා relative clauses', explanationSi: 'නාමපදයකට ප්‍රයෝජනවත් තොරතුරු එකතු කිරීමට who, which, that හෝ where යොදන්න.' },
  gerund: { title: 'Gerunds and infinitives after common verbs', si: 'සාමාන්‍ය ක්‍රියා පද පසු gerunds සහ infinitives', explanationSi: 'කුමන ක්‍රියා පද පසු -ing ද, කුමන පසු to + verb ද යන්න ඉගෙන ගන්න.' },
  formal: { title: 'Clear formal English for study and work', si: 'අධ්‍යයන සහ රැකියා සඳහා විධිමත් ඉංග්‍රීසි', explanationSi: 'විධිමත් අවස්ථාවල සම්පූර්ණ වාක්‍ය, ගෞරවාන්විත වචන සහ පැහැදිලි සංවිධානය යොදන්න.' },
  review: { title: 'Integrated review for confident communication', si: 'විශ්වාසදායක සන්නිවේදනය සඳහා ඒකාබද්ධ පුනරීක්ෂණය', explanationSi: 'කථකයා, අසන්නා සහ අවස්ථාවට ගැළපෙන ව්‍යාකරණ සහ වචන තෝරන්න.' },
};

function clean(text: string): string { return text.replace(/\s+/g, ' ').trim(); }

const FOUNDATION_MODULE_ADVICE: Record<string, string> = {
  'Greetings & Introductions': 'අවස්ථාවට ගැළපෙන ගෞරව මට්ටම තෝරා, ආචාරය උණුසුම් හඬකින් කියන්න.',
  'Personal Information': 'නම, නගරය සහ අංක වැනි වැදගත් තොරතුරු සෙමින් කියා අවශ්‍ය විට නැවත තහවුරු කරන්න.',
  'Pronouns & SVO Order': 'සිංහලෙන් වචනයෙන් වචනය පරිවර්තනය නොකර Subject + Verb + Object අනුපිළිවෙළ මුලින් ගොඩනගන්න.',
  'Nouns & Articles': 'a/an තෝරන විට අකුර නොව මුල් ශබ්දය අසන්න; the යොදන්නේ අසන්නා දන්නා නිශ්චිත දෙයකටයි.',
  'This, That, These, Those': 'අතෙන් පෙන්වමින් near/far සහ one/many යන තේරීම් දෙකම එකවර සිතන්න.',
  'Possession & Family': 'පවුලේ සම්බන්ධයත් අයිතියත් වෙන වෙනම පැහැදිලි කර my/mine සහ your/yours පටලවා නොගන්න.',
  'Present Simple Routines': 'දිනපතා කරන ක්‍රියාවට present simple යොදා, වේලාව හෝ වාර ගණන අවසානයට එක් කරන්න.',
  'Negatives & Short Answers': "don't/doesn't පසු ක්‍රියා පදයට -s නොදමා මූලික රූපය යොදන්න.",
  'Basic Questions': 'අවශ්‍ය තොරතුරට ගැළපෙන question word එක තෝරා auxiliary එක කර්තෘට පෙර තබන්න.',
  'Time, Dates & Numbers': 'අංක, දිනය සහ වේලාව කොටස් කර පැහැදිලිව කියා අසන්නා සමඟ නැවත තහවුරු කරන්න.',
};

const CORRECTION_CONTEXTS: Record<number, string> = {
  1: 'උදෑසන ගුරුතුමිය හමුවී ආචාර කරන්නේ කෙසේද?',
  42: 'ඔබෙන් දුරින් තිබෙන බස් එකක් පෙන්වන්න.',
  65: 'නිතර කන උදේ කෑම ගැන අවධාරණයක් නැති සාමාන්‍ය ප්‍රකාශයක් කරන්න.',
  75: 'පුද්ගලයාට ශිෂ්‍ය හැඳුනුම්පතක් තිබෙනවාද නොදන්නා නිසා සාමාන්‍ය yes/no ප්‍රශ්නයක් අසන්න.',
  81: 'පුද්ගලයා අලුත් සිසුවෙකුද නොදන්නා නිසා සාමාන්‍ය yes/no ප්‍රශ්නයක් අසන්න.',
};

function buildAudioTip(english: string, blueprint: ModuleBlueprint): string {
  const sentence = english.trim();
  if (/^(who|what|where|when|why|how|which)\b/i.test(sentence)) {
    return 'Stress the opening question word and use a natural falling tone at the end.';
  }
  if (/^(am|is|are|do|does|did|can|could|would|will|have|has|may)\b/i.test(sentence)) {
    return 'Use a gentle rising tone for the yes-or-no question; do not stress every word.';
  }
  if (/\b\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|first|second|third|half|quarter)\b/i.test(sentence)) {
    return 'Pause between number or time groups and stress the information the listener must remember.';
  }
  if (/\b(don't|doesn't|isn't|aren't|not|no)\b/i.test(sentence)) {
    return 'Stress the negative word, then keep the main verb clear and unhurried.';
  }
  if (blueprint.name === 'This, That, These, Those') {
    return 'Keep the opening “th” voiced, and stress this/that/these/those to show the distance clearly.';
  }
  if (blueprint.name === 'Nouns & Articles') {
    return 'Say a, an or the lightly; give the main stress to the noun that follows.';
  }
  if (blueprint.name === 'Greetings & Introductions') {
    return 'Use a warm tone, stress the greeting or name, and join the words smoothly.';
  }
  return 'Stress the main noun and verb, then repeat the whole sentence at a natural speaking speed.';
}

function buildPhrases(blueprint: ModuleBlueprint, stepIndex: number, moduleIndex: number): PhraseItem[] {
  const curated = CURATED_LESSONS[blueprint.name]?.[stepIndex];
  if (curated) {
    return curated.phrases.map(([english, sinhala], phraseIndex) => ({
      id: `p-${moduleIndex + 1}-${stepIndex + 1}-${phraseIndex + 1}`,
      english,
      sinhala,
      // This field is for a Sinhala-script pronunciation guide, not an audio
      // instruction. Leave it empty until a reviewed guide is authored.
      singlishPronunciation: '',
      teacherAudioTip: buildAudioTip(english, blueprint),
      notesSinhala: `${curated.titleSi} සඳහා මෙම වාක්‍යය හඬ නගා පුහුණු කරන්න.`,
      category: blueprint.name,
    }));
  }
  const verb = VERBS[(moduleIndex * 3 + stepIndex) % VERBS.length];
  const alternate = VERBS[(moduleIndex * 3 + stepIndex + 5) % VERBS.length];
  const participle = verb.base === 'choose' ? 'chosen' : verb.past;
  const alternateParticiple = alternate.base === 'choose' ? 'chosen' : alternate.past;
  const place = PLACES[(moduleIndex + stepIndex) % PLACES.length];
  const secondPlace = PLACES[(moduleIndex + stepIndex + 3) % PLACES.length];
  const subject = SUBJECTS[stepIndex % SUBJECTS.length];
  const focus = STEP_BLUEPRINTS[stepIndex];
  const topic = blueprint.topic;
  const topicSi = blueprint.topicSi;
  const firstSubjectVerb = subject.en === 'She' ? verb.third : verb.base;
  const present = [
    [`${subject.en} ${firstSubjectVerb} ${topic} ${place.en}.`, `${subject.si} ${topicSi} ${place.si} ${verb.si}.`],
    [`She ${verb.third} ${topic} every day.`, `ඇය සෑම දිනකම ${topicSi} ${verb.si}.`],
    [`We do not ${alternate.base} ${topic} on busy days.`, `කාර්යබහුල දිනවල අපි ${topicSi} ${alternate.si} නොකරමු.`],
    [`Do you ${verb.base} ${topic} ${secondPlace.en}?`, `ඔබ ${secondPlace.si} ${topicSi} ${verb.si} කරනවාද?`],
    [`I can ${alternate.base} ${topic} clearly and politely.`, `මට ${topicSi} පැහැදිලිව සහ විනීතව ${alternate.si} හැකිය.`],
  ];
  let phrases: string[][];
  switch (blueprint.pattern) {
    case 'be': phrases = [
      [`I am ready to discuss ${topic} ${place.en}.`, `මම ${place.si} ${topicSi} සාකච්ඡා කිරීමට සූදානම්.`],
      [`She is confident when she talks about ${topic}.`, `ඇය ${topicSi} ගැන කතා කරන විට විශ්වාසයෙන් සිටී.`],
      [`We are not confused about ${topic}.`, `${topicSi} ගැන අපි ව්‍යාකූල වී නැත.`],
      [`Are they familiar with ${topic}?`, `ඔවුන් ${topicSi} ගැන හුරුපුරුදුද?`],
      [`I was nervous, but I am improving.`, `මම කලබල වී සිටියත් දැන් වැඩිදියුණු වෙමින් සිටිමි.`],
    ]; break;
    case 'count': phrases = [
      [`I need a clear example of ${topic}.`, `${topicSi} සඳහා පැහැදිලි උදාහරණයක් මට අවශ්‍යයි.`],
      [`She bought some useful items for ${topic}.`, `ඇය ${topicSi} සඳහා ප්‍රයෝජනවත් දේවල් කිහිපයක් මිලදී ගත්තා.`],
      [`We do not have enough information about ${topic}.`, `${topicSi} ගැන ප්‍රමාණවත් තොරතුරු අපට නැත.`],
      [`How many examples can you give about ${topic}?`, `${topicSi} ගැන උදාහරණ කීයක් ඔබට දිය හැකිද?`],
      [`The information about ${topic} is helpful.`, `${topicSi} පිළිබඳ තොරතුරු ප්‍රයෝජනවත්ය.`],
    ]; break;
    case 'question': phrases = [
      [`What do you know about ${topic}?`, `${topicSi} ගැන ඔබ දන්නේ කුමක්ද?`],
      [`Where can we practise ${topic} ${place.en}?`, `${place.si} ${topicSi} පුහුණු විය හැක්කේ කොහේද?`],
      [`Why does she ${verb.base} ${topic}?`, `ඇය ${topicSi} ${verb.si} කරන්නේ ඇයි?`],
      [`Could you explain ${topic} once more?`, `ඔබට ${topicSi} නැවතත් පැහැදිලි කළ හැකිද?`],
      [`When will you use ${topic} in real life?`, `සැබෑ ජීවිතයේදී ඔබ ${topicSi} භාවිත කරන්නේ කවදාද?`],
    ]; break;
    case 'past': phrases = [
      [`I ${verb.past} ${topic} yesterday.`, `මම ඊයේ ${topicSi} ${verb.si}.`],
      [`She ${alternate.past} ${topic} last week.`, `ඇය පසුගිය සතියේ ${topicSi} ${alternate.si}.`],
      [`We did not ${verb.base} ${topic} in the morning.`, `අපි උදෑසන ${topicSi} ${verb.si} නොකළෙමු.`],
      [`Did they ${verb.base} ${topic} ${place.en}?`, `ඔවුන් ${place.si} ${topicSi} ${verb.si} කළාද?`],
      [`The experience helped me understand ${topic}.`, `එම අත්දැකීම මට ${topicSi} තේරුම් ගැනීමට උපකාර විය.`],
    ]; break;
    case 'past-continuous': phrases = [
      [`I was ${verb.ing} ${topic} at seven o'clock.`, `මම හතට ${topicSi} ${verb.si} කරමින් සිටියෙමි.`],
      [`She was ${alternate.ing} when I called.`, `මම ඇමතූ විට ඇය ${alternate.si} කරමින් සිටියා.`],
      [`We were not ${verb.ing} ${topic} then.`, `එවිට අපි ${topicSi} ${verb.si} කරමින් සිටියේ නැත.`],
      [`Were they ${verb.ing} ${topic} ${place.en}?`, `ඔවුන් ${place.si} ${topicSi} ${verb.si} කරමින් සිටියාද?`],
      [`While I was ${verb.ing}, I learned something useful.`, `මම ${verb.si} කරමින් සිටියදී ප්‍රයෝජනවත් දෙයක් ඉගෙන ගත්තෙමි.`],
    ]; break;
    case 'future': phrases = [
      [`I will ${verb.base} ${topic} tomorrow.`, `මම හෙට ${topicSi} ${verb.si}.`],
      [`She is going to ${alternate.base} ${topic} next week.`, `ඇය ලබන සතියේ ${topicSi} ${alternate.si} කිරීමට යනවා.`],
      [`We will not forget the lesson about ${topic}.`, `${topicSi} පිළිබඳ පාඩම අපි අමතක නොකරමු.`],
      [`Will you ${verb.base} ${topic} ${place.en}?`, `ඔබ ${place.si} ${topicSi} ${verb.si} කරයිද?`],
      [`If I have time, I will ${alternate.base} ${topic}.`, `මට වේලාව තිබුණොත් මම ${topicSi} ${alternate.si}.`],
    ]; break;
    case 'continuous': phrases = [
      [`I am ${verb.ing} ${topic} now.`, `මම දැන් ${topicSi} ${verb.si} කරමින් සිටිමි.`],
      [`She is ${alternate.ing} ${topic} ${place.en}.`, `ඇය ${place.si} ${topicSi} ${alternate.si} කරමින් සිටී.`],
      [`We are not ${verb.ing} ${topic} today.`, `අපි අද ${topicSi} ${verb.si} කරමින් නොසිටිමු.`],
      [`Are they ${verb.ing} ${topic}?`, `ඔවුන් ${topicSi} ${verb.si} කරමින් සිටිනවාද?`],
      [`I am ${verb.ing} carefully so that I can improve.`, `වැඩිදියුණු වීමට මම ප්‍රවේශමෙන් ${verb.si} කරමින් සිටිමි.`],
    ]; break;
    case 'perfect': phrases = [
      [`I have ${participle} ${topic} before.`, `මම මීට පෙර ${topicSi} ${verb.si}.`],
      [`She has already ${alternateParticiple} the main idea.`, `ඇය ප්‍රධාන අදහස දැනටමත් ${alternate.si}.`],
      [`We have not ${participle} enough about ${topic}.`, `අපි ${topicSi} ගැන ප්‍රමාණවත් ලෙස ${verb.si} නැත.`],
      [`Have you ever ${participle} ${topic} abroad?`, `ඔබ විදේශයකදී කවදා හෝ ${topicSi} ${verb.si} තිබේද?`],
      [`This practice has helped me speak more naturally.`, `මෙම පුහුණුව මට වඩාත් ස්වාභාවිකව කතා කිරීමට උපකාර වී ඇත.`],
    ]; break;
    case 'modal': phrases = [
      [`I can ${verb.base} ${topic} clearly.`, `මට ${topicSi} පැහැදිලිව ${verb.si} කළ හැකිය.`],
      [`You should ${alternate.base} ${topic} before the meeting.`, `රැස්වීමට පෙර ඔබ ${topicSi} ${alternate.si} කළ යුතුය.`],
      [`We must not ignore ${topic}.`, `${topicSi} අපි නොසලකා හැරිය යුතු නැත.`],
      [`Could you ${verb.base} ${topic} for me?`, `ඔබට මා වෙනුවෙන් ${topicSi} ${verb.si} කළ හැකිද?`],
      [`People may ${alternate.base} ${topic} in different ways.`, `මිනිසුන් ${topicSi} විවිධ ආකාරවලින් ${alternate.si} කළ හැකිය.`],
    ]; break;
    case 'polite': phrases = [
      [`Could you please ${verb.base} ${topic}?`, `කරුණාකර ඔබට ${topicSi} ${verb.si} කළ හැකිද?`],
      [`I would like to ask about ${topic}.`, `${topicSi} ගැන විමසීමට මම කැමතියි.`],
      [`Would you mind helping with ${topic} ${place.en}?`, `${place.si} ${topicSi} සමඟ උදව් කිරීමට ඔබ අකමැතිද?`],
      [`Please do not forget to ${verb.base} ${topic}.`, `කරුණාකර ${topicSi} ${verb.si} කිරීමට අමතක නොකරන්න.`],
      [`Thank you for helping me with ${topic}.`, `${topicSi} සමඟ මට උපකාර කිරීම ගැන ස්තුතියි.`],
    ]; break;
    case 'comparison': phrases = [
      [`${topic} is more useful than I expected.`, `මම බලාපොරොත්තු වූවාට වඩා ${topicSi} ප්‍රයෝජනවත්ය.`],
      [`This example is clearer than the first one.`, `මෙම උදාහරණය පළමු එකට වඩා පැහැදිලිය.`],
      [`We can ${verb.base} ${topic} more effectively with practice.`, `පුහුණුවෙන් අපට ${topicSi} වඩාත් ඵලදායීව ${verb.si} කළ හැකිය.`],
      [`Which part of ${topic} is the most difficult?`, `${topicSi} හි වඩාත්ම අපහසු කොටස කුමක්ද?`],
      [`Although ${topic} is challenging, it is worthwhile.`, `${topicSi} අභියෝගාත්මක වුවත් එය වටිනාය.`],
    ]; break;
    case 'conditional': phrases = [
      [`If I ${verb.base} ${topic}, I will improve.`, `මම ${topicSi} ${verb.si} කළොත් මම වැඩිදියුණු වෙමි.`],
      [`If she has time, she will ${alternate.base} ${topic}.`, `ඇයට වේලාව තිබුණොත් ඇය ${topicSi} ${alternate.si}.`],
      [`If we do not practise, we will forget ${topic}.`, `අපි පුහුණු නොවුණොත් ${topicSi} අමතක වේ.`],
      [`What would you do if ${topic} became difficult?`, `${topicSi} අපහසු වුවහොත් ඔබ කුමක් කරනු ඇත්ද?`],
      [`I would ${verb.base} more if I had a partner.`, `මට හවුල්කරුවෙකු සිටියේ නම් මම තවත් ${verb.si}.`],
    ]; break;
    case 'passive': phrases = [
      [`${topic} is explained clearly in this lesson.`, `මෙම පාඩමේදී ${topicSi} පැහැදිලිව විස්තර කර ඇත.`],
      [`The examples are ${participle} by the teacher.`, `උදාහරණ ගුරුවරයා විසින් ${verb.si}.`],
      [`The important words are not forgotten.`, `වැදගත් වචන අමතක කරන්නේ නැත.`],
      [`How is ${topic} used in real life?`, `සැබෑ ජීවිතයේදී ${topicSi} භාවිත කරන්නේ කෙසේද?`],
      [`This method can be ${alternateParticiple} at home.`, `මෙම ක්‍රමය නිවසේදී ${alternate.si} කළ හැකිය.`],
    ]; break;
    case 'reported': phrases = [
      [`Daisy said that ${topic} was important.`, `ඩේසි ${topicSi} වැදගත් බව පැවසුවා.`],
      [`He explained that he had ${participle} the task.`, `ඔහු එම කාර්යය ${verb.si} කළ බව පැහැදිලි කළා.`],
      [`She did not say that ${topic} was easy.`, `ඇය ${topicSi} පහසු බව පැවසුවේ නැත.`],
      [`What did the teacher say about ${topic}?`, `ගුරුවරයා ${topicSi} ගැන කීවේ කුමක්ද?`],
      [`I reported the message accurately.`, `මම පණිවිඩය නිවැරදිව වාර්තා කළෙමි.`],
    ]; break;
    case 'relative': phrases = [
      [`This is the example that explains ${topic}.`, `මෙය ${topicSi} පැහැදිලි කරන උදාහරණයයි.`],
      [`The teacher who helps us knows ${topic}.`, `${topicSi} දන්නා අපට උදව් කරන ගුරුවරයා.`],
      [`I visited the place where we practise ${topic}.`, `අපි ${topicSi} පුහුණු වන ස්ථානයට මම ගියෙමි.`],
      [`The book, which includes ${topic}, is useful.`, `${topicSi} ඇතුළත් පොත ප්‍රයෝජනවත්ය.`],
      [`Can you describe the person who taught ${topic}?`, `${topicSi} ඉගැන්වූ පුද්ගලයා විස්තර කළ හැකිද?`],
    ]; break;
    case 'gerund': phrases = [
      [`I enjoy ${verb.ing} ${topic}.`, `මම ${topicSi} ${verb.si} රසවිඳිමි.`],
      [`She decided to ${alternate.base} ${topic}.`, `ඇය ${topicSi} ${alternate.si} කිරීමට තීරණය කළා.`],
      [`We avoid ${verb.ing} without preparation.`, `සූදානමකින් තොරව ${verb.si} කිරීම අපි වළක්වමු.`],
      [`Would you like to ${verb.base} ${topic} with me?`, `මා සමඟ ${topicSi} ${verb.si} කිරීමට ඔබ කැමතිද?`],
      [`Learning to ${alternate.base} ${topic} takes practice.`, `${topicSi} ${alternate.si} ඉගෙනීමට පුහුණුව අවශ්‍යය.`],
    ]; break;
    case 'formal': phrases = [
      [`I am writing to request information about ${topic}.`, `${topicSi} පිළිබඳ තොරතුරු ඉල්ලා මම ලියමි.`],
      [`Please find the details about ${topic} below.`, `${topicSi} පිළිබඳ විස්තර පහතින් බලන්න.`],
      [`We would appreciate your response about ${topic}.`, `${topicSi} ගැන ඔබේ පිළිතුර අපි අගය කරමු.`],
      [`Could you confirm whether ${topic} is available?`, `${topicSi} ලබා ගත හැකිදැයි තහවුරු කළ හැකිද?`],
      [`Thank you for your attention to this matter.`, `මෙම කරුණ පිළිබඳ ඔබේ අවධානයට ස්තුතියි.`],
    ]; break;
    case 'review': phrases = [
      [`I can ${verb.base} ${topic} clearly.`, `මට ${topicSi} පැහැදිලිව ${verb.si} කළ හැකිය.`],
      [`Yesterday I ${verb.past} ${topic} with a friend.`, `ඊයේ මම මිතුරෙකු සමඟ ${topicSi} ${verb.si}.`],
      [`Tomorrow I will ${alternate.base} ${topic} again.`, `හෙට මම නැවත ${topicSi} ${alternate.si}.`],
      [`Could you ask me a question about ${topic}?`, `${topicSi} ගැන මගෙන් ප්‍රශ්නයක් අසන්න පුළුවන්ද?`],
      [`I am becoming more confident when I discuss ${topic}.`, `${topicSi} සාකච්ඡා කරන විට මම වැඩි විශ්වාසයක් ලබමින් සිටිමි.`],
    ]; break;
    default: phrases = present;
  }
  return phrases.map(([english, sinhala], phraseIndex) => ({
    id: `p-${moduleIndex + 1}-${stepIndex + 1}-${phraseIndex + 1}`,
    english: clean(english),
    sinhala: clean(sinhala),
    singlishPronunciation: '',
    teacherAudioTip: `Listen once, then shadow the sentence. Stress the key words in “${focus.goal}”.`,
    notesSinhala: `${blueprint.topicSi} පිළිබඳ ${focus.goalSi}. වාක්‍යය හඬ නගා තුන් වරක් කියවන්න.`,
    category: blueprint.name,
  }));
}

function buildMistake(blueprint: ModuleBlueprint, stepIndex: number, phrase: PhraseItem): CommonMistakeItem {
  const verb = VERBS[stepIndex % VERBS.length];
  const incorrect = blueprint.pattern === 'present'
    ? `She ${verb.base} ${blueprint.topic}.`
    : blueprint.pattern === 'question'
      ? `Where you ${verb.base} ${blueprint.topic}?`
      : blueprint.pattern === 'past'
        ? `I did ${verb.past} ${blueprint.topic}.`
        : `I am agree about ${blueprint.topic}.`;
  return {
    incorrect,
    correct: phrase.english,
    explanationSinhala: `“${incorrect}” වෙනුවට ${blueprint.nameSi} පාඩමේදී ඉගැන්වූ නිවැරදි රටාව භාවිත කරන්න. ${PATTERN_INFO[blueprint.pattern].explanationSi}`,
    contextExample: phrase.english,
  };
}

function generateLessons(): Lesson[] {
  const lessons: Lesson[] = [];
  let number = 1;
  VOLUMES.forEach((volume, volumeIndex) => volume.modules.forEach((blueprint, moduleIndexInVolume) => {
    const moduleIndex = volumeIndex * 10 + moduleIndexInVolume;
    STEP_BLUEPRINTS.forEach((step, stepIndex) => {
      // Keep the learner journey aligned with the volume structure: foundation
      // volumes first, then practical/intermediate grammar, then fluency.
      const level: Lesson['level'] = volumeIndex <= 1 ? 'Beginner 1' : volumeIndex <= 5 ? 'Beginner 2' : 'Intermediate';
      const phrases = buildPhrases(blueprint, stepIndex, moduleIndex);
      const pattern = PATTERN_INFO[blueprint.pattern];
      const curated = CURATED_LESSONS[blueprint.name]?.[stepIndex];
      const curatedGrammar = FOUNDATION_GRAMMAR[blueprint.name];
      const foundationGuide = number <= FOUNDATION_GUIDES.length ? FOUNDATION_GUIDES[number - 1] : undefined;
      const foundationMistake = number <= FOUNDATION_LESSON_MISTAKES.length
        ? { ...FOUNDATION_LESSON_MISTAKES[number - 1],
          ...(CORRECTION_CONTEXTS[number] ? { contextSinhala: CORRECTION_CONTEXTS[number] } : {}) }
        : undefined;
      lessons.push({
        id: `lesson-${number}`,
        number,
        titleEnglish: curated?.title ?? `${blueprint.name} · ${step.title}`,
        titleSinhala: curated?.titleSi ?? `${blueprint.nameSi} · ${step.titleSi}`,
        level,
        summarySinhala: foundationGuide?.summarySinhala ?? (curated
          ? `${curated.titleSi} සඳහා අදාළ ඉංග්‍රීසි වාක්‍ය ඉගෙනගෙන ඩේසි සමඟ හඬ නගා පුහුණු වන්න.`
          : `${blueprint.topicSi} පිළිබඳ ${step.goalSi}. ${pattern.si} භාවිතයෙන් ඩේසි සමඟ හඬ නගා පුහුණු වන්න.`),
        grammarRule: {
          ruleTitleSinhala: foundationGuide?.focusSinhala ?? curatedGrammar?.titleSinhala ?? pattern.si,
          explanationSinhala: foundationGuide?.explanationSinhala ?? curatedGrammar?.explanation ?? `${pattern.explanationSi} මෙම පියවරේ ඉලක්කය: ${step.goalSi}.`,
          sinhalaVsEnglishPattern: {
            sinhalaOrder: pattern.sinhalaPattern ?? 'සිංහල: කර්තෘ + කර්මය + ක්‍රියාව (S-O-V)',
            englishOrder: foundationGuide?.patternEnglish ?? curatedGrammar?.englishPattern ?? pattern.englishPattern ?? 'English: Subject + Verb + Object (S-V-O)',
            exampleSinhala: phrases[0].sinhala,
            exampleEnglish: phrases[0].english,
          },
        },
        phrases,
        keyVocabulary: FOUNDATION_LESSON_VOCABULARY[number],
        guidedPracticeSinhala: number <= FOUNDATION_PRACTICE_PROMPTS.length
          ? FOUNDATION_PRACTICE_PROMPTS[number - 1]
          : undefined,
        commonMistake: foundationMistake ?? CURATED_MISTAKES[blueprint.name] ?? buildMistake(blueprint, stepIndex, phrases[0]),
        teacherVoiceAdviceSinhala: foundationGuide
          ? `${foundationGuide.focusSinhala} මෙම පාඩමේ ප්‍රධාන ඉලක්කයයි. ${FOUNDATION_MODULE_ADVICE[blueprint.name]} පළමු වාක්‍යය සෙමින් කියා, පසුව ඔබේම තොරතුරු යොදා වෙනස් කර බලන්න.`
          : `${blueprint.nameSi} ගැන කතා කරන විට වචන පැහැදිලිව කියන්න. ${step.goalSi} කරමින් වාක්‍ය පහම හඬ නගා කියවන්න.`,
      });
      number += 1;
    });
  }));
  return lessons;
}

export const LESSONS: Lesson[] = generateLessons().map(enhanceEverydayLesson).map(enhanceGrammarLesson);

// Learner-facing navigation is organised by proficiency stage rather than
// arbitrary numbered volumes. Boundaries match the current course sequencing.
export const LESSON_VOLUMES = [
  { id: 'a1', title: 'A1 · Foundations', range: [1, 200] as [number, number], desc: 'First conversations, personal information, family, routines and core sentence patterns.' },
  { id: 'a2', title: 'A2 · Everyday English', range: [201, 600] as [number, number], desc: 'Routine exchanges, practical situations, past events, plans and familiar topics.' },
  { id: 'b1', title: 'B1 · Confident Communication', range: [601, 1000] as [number, number], desc: 'Longer conversations, explanations, opinions, study and workplace communication.' },
];
