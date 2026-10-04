import { Lesson, PhraseItem, CommonMistakeItem } from '../types/index';

interface DomainBlueprint {
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

const DOMAINS_DATA: DomainBlueprint[] = [
  // 1. Everyday Greetings & Introductions (Lessons 1 - 50)
  {
    domain: 'Everyday Greetings & Introductions',
    domainSinhala: 'ආචාර කිරීම් සහ ස්වයං හැඳින්වීම්',
    subtopics: [
      {
        titleEn: 'Morning & Daytime Greetings',
        titleSi: 'උදෑසන සහ දහවල් ආචාර කිරීම්',
        ruleTitleSi: 'වේලාව අනුව ආචාර කිරීමේ රීතිය',
        ruleExplainSi: 'උදෑසන 12 දක්වා "Good morning" ද, දහවල් 12 සිට සවස 5 දක්වා "Good afternoon" ද යොදයි.',
        phrases: [
          { en: 'Good morning, how are you doing today?', si: 'සුබ උදෑසනක්, අද ඔබට කොහොමද?', singlish: '[ගුඩ් මෝනින්ග්, හවු ආර් යූ ඩූයින්ග් ටුඩේ?]', tip: 'Morning හි "ර්" මෘදුව උච්චාරණය කරන්න.' },
          { en: 'Good afternoon, Teacher Daisy!', si: 'සුබ දහවලක්, ඩේසි ගුරුතුමියනි!', singlish: '[ගුඩ් ආෆ්ටර්නූන්, ටීචර් ඩේසි!]', tip: 'Afternoon හි "noon" දිගු කර කියන්න.' },
          { en: 'I am pleased to meet you.', si: 'ඔබව හමුවීම සතුටක්.', singlish: '[අයි ඈම් ප්ලීස්ඩ් ටු මීට් යූ]', tip: 'Pleased හි "d" ශබ්දය පැහැදිලි කරන්න.' },
          { en: 'Have a wonderful and blessed day.', si: 'සුන්දර ආශිර්වාදමත් දවසක් වේවා.', singlish: '[හෑව් අ වන්ඩර්ෆුල් ඇන්ඩ් බ්ලෙස්ඩ් ඩේ]', tip: 'Blessed [බ්ලෙස්ඩ්] ලෙස කියන්න.' },
          { en: 'See you again around five o\'clock.', si: 'පහට පමණ නැවත හමුවෙමු.', singlish: '[සී යූ අගේන් අරවුන්ඩ් ෆයිව් ඔක්ලොක්]', tip: 'O\'clock හි "k" නවත්වන්න.' },
        ],
        mistake: { incorrect: 'Good night, how are you?', correct: 'Good evening, how are you?', explanationSinhala: '"Good night" කියන්නේ රාත්‍රියේ සමුගන්නා විට පමණි. හමුවන විට "Good evening" කියන්න.' },
        adviceSi: 'පැටියෝ, මුහුණේ මඳහසක් තියාගෙන කතා කරන්න. ආචාර කිරීමෙන් සුහදතාව ගොඩනැගේ.',
      },
      {
        titleEn: 'Introducing Yourself Confidently',
        titleSi: 'තමන්ව ආත්ම විශ්වාසයෙන් හඳුන්වා දීම',
        ruleTitleSi: 'නම සහ ගම පැවසීමේ රටාව (I am from...)',
        ruleExplainSi: '"My name is..." හෝ "I am..." කියා නම පවසා, "I am from Kandy" ලෙස පදිංචි ප්‍රදේශය කියන්න.',
        phrases: [
          { en: 'My name is Nimal and I am from Galle.', si: 'මගේ නම නිමල්, මම ගාල්ලේ සිට එන්නේ.', singlish: '[මයි නේම් ඉස් නිමල් ඇන්ඩ් අයි ඈම් ෆ්‍රොම් ගෝල්]', tip: 'Name හි "m" අකුර පැහැදිලිව තබන්න.' },
          { en: 'I am a school teacher by profession.', si: 'මම වෘත්තියෙන් පාසල් ගුරුවරයෙක්.', singlish: '[අයි ඈම් අ ස්කූල් ටීචර් බයි ප්‍රොෆෙෂන්]', tip: 'Profession [ප්‍රොෆෙෂන්] ලෙස ශබ්ද කරන්න.' },
          { en: 'I graduated from university recently.', si: 'මම මෑතකදී විශ්වවිද්‍යාලයෙන් උපාධිය ලැබුවා.', singlish: '[අයි ග්‍රැජුවෙයිටඩ් ෆ්‍රොම් යුනිවර්සිටි රීසන්ට්ලි]', tip: 'Recently [රීසන්ට්ලි] කියන්න.' },
          { en: 'It is an honor to introduce myself to you.', si: 'ඔබට මාව හඳුන්වා දීමට ලැබීම ගෞරවයක්.', singlish: '[ඉට් ඉස් ඇන් ඔනර් ටු ඉන්ට්‍රඩියුස් මයිසෙල්ෆ් ටු යූ]', tip: 'Honor හි "H" නිහඬය (ඔනර්).' },
          { en: 'I live with my loving family in Colombo.', si: 'මම මගේ පවුල සමඟ කොළඹ ජීවත් වෙනවා.', singlish: '[අයි ලිව් විත් මයි ලවින්ග් ෆැමිලි ඉන් කලම්බෝ]', tip: 'Live [ලිව්] කෙටියෙන් කියන්න.' },
        ],
        mistake: { incorrect: 'Myself Kamal.', correct: 'I am Kamal. / My name is Kamal.', explanationSinhala: 'කවදාවත් "Myself Kamal" කියා හඳුන්වා නොදෙන්න. "I am Kamal" යනු නිවැරදි ඉංග්‍රීසියයි.' },
        adviceSi: 'හඳුන්වා දීමේදී කෙළින් බලා පැහැදිලි හඬින් නම කියන්න පැටියෝ!',
      },
    ],
  },

  // 2. Sinhala SOV to English SVO Structure (Lessons 51 - 100)
  {
    domain: 'Sinhala SOV to English SVO Structure',
    domainSinhala: 'වාක්‍ය රටාවේ රන් රීතිය (SVO)',
    subtopics: [
      {
        titleEn: 'Moving Verbs to the Center',
        titleSi: 'ක්‍රියා පදය මැදට ගෙන ඒම',
        ruleTitleSi: 'Subject + Verb + Object (S-V-O)',
        ruleExplainSi: 'සිංහලෙන් කර්මය මැදට ආවද ඉංග්‍රීසියෙන් ක්‍රියා පදය මැදට පැමිණිය යුතුය (I drink tea, not I tea drink).',
        phrases: [
          { en: 'I eat hopper and spicy lunu miris.', si: 'මම ආප්ප සහ ලුණු මිරිස් කනවා.', singlish: '[අයි ඊට් හොපර් ඇන්ඩ් ස්පයිසි ලුණු මිරිස්]', tip: 'Spicy [ස්පයිසි] කියන්න.' },
          { en: 'My mother prepares fresh milk rice.', si: 'මගේ මව නැවුම් කිරිබත් පිළියෙළ කරනවා.', singlish: '[මයි මදර් ප්‍රිපෙයාර්ස් ෆ්‍රෙෂ් මිල්ක් රයිස්]', tip: 'Prepares [ප්‍රිපෙයාර්ස්] හි "s" ශබ්ද කරන්න.' },
          { en: 'The children play cricket in the ground.', si: 'ළමයි පිට්ටනියේ ක්‍රිකට් සෙල්ලම් කරනවා.', singlish: '[ද චිල්ඩ්‍රන් ප්ලේ ක්‍රිකට් ඉන් ද ග්‍රවුන්ඩ්]', tip: 'Ground [ග්‍රවුන්ඩ්] හි "d" තබන්න.' },
          { en: 'We listen to Daisy teacher carefully.', si: 'අපි ඩේසි ගුරුතුමියට හොඳින් සවන් දෙනවා.', singlish: '[වී ලිසන් ටු ඩේසි ටීචර් කෙයාර්ෆුලි]', tip: 'Listen හි "t" නිහඬය (ලිසන්).' },
          { en: 'He writes English essays every weekend.', si: 'ඔහු සෑම සති අන්තයකම ඉංග්‍රීසි රචනා ලියනවා.', singlish: '[හී රයිට්ස් ඉන්ග්ලිෂ් එසේස් එව්රි වීක්එන්ඩ්]', tip: 'Writes [රයිට්ස්] හි "w" නිහඬයි.' },
        ],
        mistake: { incorrect: 'I tea drink.', correct: 'I drink tea.', explanationSinhala: 'සිංහලෙන් "මම තේ බොනවා" වුවත් ඉංග්‍රීසියෙන් ක්‍රියාව මැදට පැමිණ "I drink tea" විය යුතුය.' },
        adviceSi: 'ක්‍රියාව මැදට ගැනීම නිතර සිහිපත් කරන්න. එවිට ඉංග්‍රීසි වාක්‍ය ඉබේම ගලා එයි!',
      },
    ],
  },

  // 3. To Be Verbs: Am, Is, Are, Was, Were (Lessons 101 - 150)
  {
    domain: 'To Be Verbs (Am, Is, Are, Was, Were)',
    domainSinhala: 'To Be ක්‍රියා පද (Am, Is, Are, Was, Were)',
    subtopics: [
      {
        titleEn: 'State of Being in Present & Past',
        titleSi: 'වර්තමාන සහ අතීත පැවැත්ම',
        ruleTitleSi: 'To Be ක්‍රියා පද භාවිතය',
        ruleExplainSi: 'I am, He/She/It is, We/You/They are වර්තමානයටද, Was/Were අතීතයටද යොදයි.',
        phrases: [
          { en: 'I am ready to learn spoken English.', si: 'මම කථන ඉංග්‍රීසි ඉගෙන ගැනීමට සූදානම්.', singlish: '[අයි ඈම් රෙඩි ටු ලර්න් ස්පෝකන් ඉන්ග්ලිෂ්]', tip: 'Ready [රෙඩි] කෙටියෙන් කියන්න.' },
          { en: 'She is an intelligent and kind student.', si: 'ඇය බුද්ධිමත් සහ කරුණාවන්ත ශිෂ්‍යාවකි.', singlish: '[ෂී ඉස් ඇන් ඉන්ටෙලිජන්ට් ඇන්ඩ් කයින්ඩ් ස්ටුඩන්ට්]', tip: 'Intelligent [ඉන්ටෙලිජන්ට්] කියන්න.' },
          { en: 'They are very eager to practice speaking.', si: 'ඔවුන් කතා කිරීමට පුහුණු වීමට මහත් උනන්දුවක් දක්වයි.', singlish: '[දේ ආර් වෙරි ඊගර් ටු ප්‍රැක්ටිස් ස්පීකින්ග්]', tip: 'Eager [ඊගර්] යනු උනන්දුවයි.' },
          { en: 'We were present at the meeting yesterday.', si: 'අපි ඊයේ රැස්වීමට සහභාගී වී සිටියෙමු.', singlish: '[වී වර් ප්‍රෙසන්ට් ඇට් ද මීටින්ග් යෙස්ටර්ඩේ]', tip: 'Present [ප්‍රෙසන්ට්] කියන්න.' },
          { en: 'It is a wonderful opportunity for us.', si: 'එය අපට ලැබුණු අපූරු අවස්ථාවක්.', singlish: '[ඉට් ඉස් අ වන්ඩර්ෆුල් ඔපචුනිටි ෆෝ අස්]', tip: 'Opportunity [ඔපචුනිටි] කියන්න.' },
        ],
        mistake: { incorrect: 'They is ready.', correct: 'They are ready.', explanationSinhala: 'බහුවචන (They/We) සඳහා "are" යෙදිය යුතුය. "is" යොදන්නේ ඒකවචන සඳහා පමණි.' },
        adviceSi: 'පැටියෝ, I සඳහා "am" පමණක් යෙදීමට නිතර වගබලා ගන්න!',
      },
    ],
  },

  // 4. Daily Habits & Present Simple (Lessons 151 - 200)
  {
    domain: 'Daily Habits & Present Simple',
    domainSinhala: 'දෛනික පුරුදු සහ සරල වර්තමානය',
    subtopics: [
      {
        titleEn: 'Everyday Morning & Evening Routines',
        titleSi: 'දෛනික උදෑසන සහ සවස චර්යාවන්',
        ruleTitleSi: 'තෙවන පාර්ශ්ව ඒකවචනයට "s/es" එකතු කිරීම',
        ruleExplainSi: 'He, She, It සමඟ වර්තමාන ක්‍රියා පදයට "s" හෝ "es" එක්වේ (He wakes up early).',
        phrases: [
          { en: 'I wake up at five in the morning.', si: 'මම උදෑසන පහට අවදි වෙනවා.', singlish: '[අයි වේක් අප් ඇට් ෆයිව් ඉන් ද මෝනින්ග්]', tip: 'Wake up [වේක් අප්] එකට කියන්න.' },
          { en: 'He brushes his teeth and washes his face.', si: 'ඔහු දත් මැද මුහුණ සෝදනවා.', singlish: '[හී බ්‍රෂස් හිස් ටීත් ඇන්ඩ් වොෂස් හිස් ෆේස්]', tip: 'Brushes [බ්‍රෂස්] පැහැදිලි කරන්න.' },
          { en: 'She drinks a glass of warm water.', si: 'ඇය උණුසුම් වතුර වීදුරුවක් බොනවා.', singlish: '[ෂී ඩ්‍රින්ක්ස් අ ග්ලාස් ඔෆ් වෝම් වෝටර්]', tip: 'Warm [වෝම්] දිගු කරන්න.' },
          { en: 'We go for a walk in the paddy field.', si: 'අපි වෙල්යාය මැදින් ඇවිදින්න යනවා.', singlish: '[වී ගෝ ෆෝ අ වෝක් ඉන් ද පෑඩි ෆීල්ඩ්]', tip: 'Walk හි "l" නිහඬයි (වෝක්).' },
          { en: 'Father reads the daily newspaper with tea.', si: 'තාත්තා තේ සමඟ දිනපතා පුවත්පත කියවනවා.', singlish: '[ෆාදර් රීඩ්ස් ද ඩේලි නිව්ස්පේපර් විත් ටී]', tip: 'Newspaper [නිව්ස්පේපර්] කියන්න.' },
        ],
        mistake: { incorrect: 'He go to school.', correct: 'He goes to school.', explanationSinhala: 'He සමඟ "go" නොව "goes" යෙදිය යුතුය. තෙවන පාර්ශ්වයට "es" එකතු වේ.' },
        adviceSi: 'දිනපතා පුරුදු කියන විට "s" ශබ්දය අමතක නොකරන්න!',
      },
    ],
  },

  // 5. Asking Spoken Questions (Do, Does, Wh-) (Lessons 201 - 250)
  {
    domain: 'Asking Spoken Questions (Do, Does, Wh-)',
    domainSinhala: 'ඉංග්‍රීසියෙන් ප්‍රශ්න ඇසීම (Do, Does, Wh-)',
    subtopics: [
      {
        titleEn: 'Forming Questions with Wh- & Auxiliary Verbs',
        titleSi: 'ප්‍රශ්න ගොඩනැගීම',
        ruleTitleSi: 'Wh- වචනය + උපකාරක ක්‍රියාව + කර්තෘ + ප්‍රධාන ක්‍රියාව',
        ruleExplainSi: '"Where do you live?", "What does he do?" රටාව අනුගමනය කරන්න.',
        phrases: [
          { en: 'What is your favorite subject in school?', si: 'පාසලේ ඔබේ ප්‍රියතම විෂය කුමක්ද?', singlish: '[වට් ඉස් යෝර් ෆේවරිට් සබ්ජෙක්ට් ඉන් ස්කූල්?]', tip: 'Favorite [ෆේවරිට්] කියන්න.' },
          { en: 'Where do you travel for work everyday?', si: 'ඔබ දිනපතා රැකියාවට යන්නේ කොහේද?', singlish: '[වෙයාර් ඩූ යූ ට්‍රැවල් ෆෝ වර්ක් එව්රිඩේ?]', tip: 'Where හි "Wh" [වෙයාර්] ලෙස ශබ්ද කරන්න.' },
          { en: 'Do you speak English at home?', si: 'ඔබ නිවසේදී ඉංග්‍රීසි කතා කරනවාද?', singlish: '[ඩූ යූ ස්පීක් ඉන්ග්ලිෂ් ඇට් හෝම්?]', tip: 'Speak හි "k" පැහැදිලි කරන්න.' },
          { en: 'Why are you smiling so happily?', si: 'ඔබ ඔතරම් සතුටින් සිනාසෙන්නේ ඇයි?', singlish: '[වයි ආර් යූ ස්මයිලින්ග් සෝ හැපිලි?]', tip: 'Smiling [ස්මයිලින්ග්] කියන්න.' },
          { en: 'When does the morning train arrive?', si: 'උදෑසන දුම්රිය ළඟා වන්නේ කවදාද?', singlish: '[වෙන් ඩස් ද මෝනින්ග් ට්‍රේන් අරයිව්?]', tip: 'Arrive [අරයිව්] හි "v" තබන්න.' },
        ],
        mistake: { incorrect: 'Where you going?', correct: 'Where are you going?', explanationSinhala: 'ප්‍රශ්නයක් අසන විට "are" උපකාරක ක්‍රියා පදය අතහැරිය නොහැක.' },
        adviceSi: 'ප්‍රශ්නය අසන විට අග භාගයේ හඬ තරමක් ඉහළට ඔසවන්න (Rising intonation).',
      },
    ],
  },

  // 6. Bus, Train & Three-Wheeler Travel (Lessons 251 - 300)
  {
    domain: 'Bus, Train & Three-Wheeler Travel',
    domainSinhala: 'බස්, කෝච්චි සහ ත්‍රීවීල් ගමන් බිමන්',
    subtopics: [
      {
        titleEn: 'Hiring a Tuk-Tuk & Buying Bus Tickets',
        titleSi: 'ත්‍රීවීලරයක් ගැනීම සහ බස් ටිකට් ගැනීම',
        ruleTitleSi: 'ගමන් බිමන් වලදී ආචාරශීලී විමසීම්',
        ruleExplainSi: '"How much to...?" හෝ "Could you drop me at...?" භාවිත කරන්න.',
        phrases: [
          { en: 'How much to Fort railway station by meter?', si: 'මීටරයට කොටුව දුම්රිය ස්ථානයට කීයද?', singlish: '[හවු මච් ටු ෆෝට් රේල්වේ ස්ටේෂන් බයි මීටර්?]', tip: 'Railway [රේල්වේ] කියන්න.' },
          { en: 'Please turn on the meter, brother.', si: 'මල්ලී කරුණාකර මීටරය දමන්න.', singlish: '[ප්ලීස් ටර්න් ඔන් ද මීටර්, බ්‍රදර්]', tip: 'Meter [මීටර්] පැහැදිලිව කියන්න.' },
          { en: 'Does this bus go to Kandy via Kegalle?', si: 'මේ බස් එක කෑගල්ල හරහා නුවරට යනවද?', singlish: '[ඩස් දිස් බස් ගෝ ටු කැන්ඩි වායා කෑගල්ල?]', tip: 'Via [වායා] යනු හරහා යන්නයි.' },
          { en: 'Please stop near the clock tower.', si: 'කරුණාකර ඔරලෝසු කණුව ළඟින් නවත්වන්න.', singlish: '[ප්ලීස් ස්ටොප් නියර් ද ක්ලොක් ටවර්]', tip: 'Tower [ටවර්] ලෙස පවසන්න.' },
          { en: 'Keep the balance as a tip.', si: 'ඉතිරි මුදල තබාගන්න.', singlish: '[කීප් ද බැලන්ස් ඈස් අ ටිප්]', tip: 'Balance [බැලන්ස්] කියන්න.' },
        ],
        mistake: { incorrect: 'Drop me here only.', correct: 'Please drop me off here.', explanationSinhala: 'ලාංකික අප නිතර "here only" කීවද, නිවැරදි ඉංග්‍රීසිය "drop me off here" වේ.' },
        adviceSi: 'රියදුරන්ට කතා කරන විට "Please" වචනය යොදන්න. එය විනීත බව පෙන්වයි.',
      },
    ],
  },

  // 7. Dining, Tea Shops & Food (Lessons 301 - 350)
  {
    domain: 'Dining, Tea Shops & Sri Lankan Food',
    domainSinhala: 'ආපනශාලා සහ කෑම බීම ඇණවුම් කිරීම',
    subtopics: [
      {
        titleEn: 'Ordering Food & Sri Lankan Tea',
        titleSi: 'ආහාර සහ තේ ඇණවුම් කිරීම',
        ruleTitleSi: '"I would like to order..." යෙදීම',
        ruleExplainSi: 'ආහාර ඉල්ලීමේදී "Give me rice" නොකියා "I would like to order chicken fried rice" යොදන්න.',
        phrases: [
          { en: 'Could I see the lunch menu, please?', si: 'කරුණාකර මට දවල් ආහාර මෙනුව බලන්න පුළුවන්ද?', singlish: '[කුඩ් අයි සී ද ලන්ච් මෙනු, ප්ලීස්?]', tip: 'Menu [මෙනු] කියන්න.' },
          { en: 'I would like a cup of hot milk tea.', si: 'මට උණු කිරි තේ කෝප්පයක් අවශ්‍යයි.', singlish: '[අයි වුඩ් ලයික් අ කප් ඔෆ් හොට් මිල්ක් ටී]', tip: 'Would [වුඩ්] හි "l" නිහඬයි.' },
          { en: 'Please make the curry less spicy.', si: 'කරුණාකර ව්‍යංජනය සැර අඩුවෙන් හදන්න.', singlish: '[ප්ලීස් මේක් ද කරි ලෙස් ස්පයිසි]', tip: 'Less spicy [ලෙස් ස්පයිසි] කියන්න.' },
          { en: 'Could you bring the bill, please?', si: 'කරුණාකර බිල ගෙනත් දෙන්න පුළුවන්ද?', singlish: '[කුඩ් යූ බ්‍රින්ග් ද බිල්, ප්ලීස්?]', tip: 'Bill හි "ll" මෘදුව නවත්වන්න.' },
          { en: 'The food was exceptionally delicious.', si: 'ආහාරය අතිශයින්ම රසවත් විය.', singlish: '[ද ෆුඩ් වොස් එක්සෙප්ෂනලි ඩිලිෂස්]', tip: 'Exceptionally [එක්සෙප්ෂනලි] කියන්න.' },
        ],
        mistake: { incorrect: 'Give me one tea.', correct: 'Could I have a cup of tea, please?', explanationSinhala: '"Give me" යනු අණ කිරීමකි. ආචාරශීලීව "Could I have..." කියන්න.' },
        adviceSi: 'ආපනශාලාවකදී "Thank you" පැවසීමට කිසිවිටෙකත් මැලි නොවන්න!',
      },
    ],
  },

  // 8. Shopping & Pettah Bargaining (Lessons 351 - 400)
  {
    domain: 'Shopping, Supermarkets & Bargaining',
    domainSinhala: 'කඩසාප්පු සහ බඩු මිලදී ගැනීම්',
    subtopics: [
      {
        titleEn: 'Asking Prices & Discounts',
        titleSi: 'මිල ගණන් සහ වට්ටම් විමසීම',
        ruleTitleSi: '"How much is this?" සහ "Can you give a discount?"',
        ruleExplainSi: 'භාණ්ඩයක මිල විමසීමට "How much does this cost?" හෝ "How much is this?" යොදන්න.',
        phrases: [
          { en: 'How much does this cotton shirt cost?', si: 'මේ කපු කමිසය කීයද?', singlish: '[හවු මච් ඩස් දිස් කොටන් ෂර්ට් කොස්ට්?]', tip: 'Cotton [කොටන්] කියන්න.' },
          { en: 'Do you have this in medium size?', si: 'මෙය මධ්‍යම ප්‍රමාණයෙන් (Medium) තිබේද?', singlish: '[ඩූ යූ හෑව් දිස් ඉන් මීඩියම් සයිස්?]', tip: 'Medium [මීඩියම්] පවසන්න.' },
          { en: 'Can you offer any special discount?', si: 'ඔබට විශේෂ වට්ටමක් ලබා දිය හැකිද?', singlish: '[කෑන් යූ ඔෆර් එනි ස්පෙෂල් ඩිස්කවුන්ට්?]', tip: 'Discount [ඩිස්කවුන්ට්] කියන්න.' },
          { en: 'Can I pay by credit card or cash?', si: 'මට කාඩ්පතකින් හෝ මුදලින් ගෙවිය හැකිද?', singlish: '[කෑන් අයි පේ බයි ක්‍රෙඩිට් කාඩ් ඕර් කෑෂ්?]', tip: 'Credit card [ක්‍රෙඩිට් කාඩ්] කියන්න.' },
          { en: 'Please give me a printed receipt.', si: 'කරුණාකර මට මුද්‍රිත රිසිට්පතක් ලබා දෙන්න.', singlish: '[ප්ලීස් ගිව් මී අ ප්‍රින්ටඩ් රිසීට්]', tip: 'Receipt හි "p" නිහඬයි (රිසීට්).' },
        ],
        mistake: { incorrect: 'What is the price of this one?', correct: 'How much is this, please?', explanationSinhala: 'මිල අසන විට ස්වභාවික ඉංග්‍රීසිය "How much is this?" වේ.' },
        adviceSi: 'මිලදී ගැනීමේදී මුදල් ගනුදෙනු පැහැදිලිව කතා කරන්න පැටියෝ.',
      },
    ],
  },

  // 9. Telephone & WhatsApp Calls (Lessons 401 - 450)
  {
    domain: 'Telephone Manners & WhatsApp Calls',
    domainSinhala: 'දුරකථන සහ වට්ස්ඇප් ඇමතුම්',
    subtopics: [
      {
        titleEn: 'Answering Calls & Taking Messages',
        titleSi: 'ඇමතුම් වලට පිළිතුරු දීම සහ පණිවිඩ තැබීම',
        ruleTitleSi: '"May I speak to..." සහ "Speaking"',
        ruleExplainSi: 'දුරකථනයෙන් තමන් කතා කරන බව පැවසීමට "I am Nimal" නොකියා "This is Nimal speaking" යොදන්න.',
        phrases: [
          { en: 'Hello, this is Daisy speaking.', si: 'හෙලෝ, මේ ඩේසි කතා කරන්නේ.', singlish: '[හෙලෝ, දිස් ඉස් ඩේසි ස්පීකින්ග්]', tip: 'Speaking [ස්පීකින්ග්] කියන්න.' },
          { en: 'May I speak to Mr. Perera, please?', si: 'මට පෙරේරා මහතා සමඟ කතා කළ හැකිද?', singlish: '[මේ අයි ස්පීක් ටු මිස්ටර් පෙරේරා, ප්ලීස්?]', tip: 'May I [මේ අයි] ආචාරශීලීයි.' },
          { en: 'I am afraid his line is busy right now.', si: 'ඔහුගේ දුරකථන මාර්ගය කාර්යබහුල බව පෙනේ.', singlish: '[අයි ඈම් අෆ්‍රෙයිඩ් හිස් ලයින් ඉස් බිසි රයිට් නවු]', tip: 'Busy [බිසි] කියන්න.' },
          { en: 'Could I leave a short message for him?', si: 'මට ඔහුට කෙටි පණිවිඩයක් තැබිය හැකිද?', singlish: '[කුඩ් අයි ලීව් අ ෂෝට් මෙසේජ් ෆෝ හිම්?]', tip: 'Message [මෙසේජ්] කියන්න.' },
          { en: 'I will call you back in ten minutes.', si: 'මම විනාඩි දහයකින් නැවත අමතන්නම්.', singlish: '[අයි විල් කෝල් යූ බෑක් ඉන් ටෙන් මිනිට්ස්]', tip: 'Call back [කෝල් බෑක්] කියන්න.' },
        ],
        mistake: { incorrect: 'Who is this?', correct: 'May I know who is calling, please?', explanationSinhala: 'දුරකථනයෙන් "Who is this?" යනු රළුය. "May I know who is calling?" යොදන්න.' },
        adviceSi: 'දුරකථන ඇමතුම් වලදී හඬ පැහැදිලිව සහ සෙමෙන් තබාගන්න.',
      },
    ],
  },

  // 10. Home, Family & Chores (Lessons 451 - 500)
  {
    domain: 'Home, Family Members & Chores',
    domainSinhala: 'නිවස සහ පවුලේ කටයුතු',
    subtopics: [
      {
        titleEn: 'Family Relationships & Daily Chores',
        titleSi: 'පවුලේ සබඳතා සහ ගෙදර දොර වැඩ',
        ruleTitleSi: 'ගෙදර වැඩ ප්‍රකාශ කිරීම (Do the dishes, sweep...)',
        ruleExplainSi: 'පිඟන් සේදීමට "wash dishes" හෝ "do the dishes", මිදුල අතුගෑමට "sweep the garden" යොදයි.',
        phrases: [
          { en: 'My mother is sweeping the front garden.', si: 'මගේ අම්මා ඉදිරිපස මිදුල අතුගානවා.', singlish: '[මයි මදර් ඉස් ස්වීපින්ග් ද ෆ්‍රන්ට් ගාර්ඩන්]', tip: 'Sweeping [ස්වීපින්ග්] කියන්න.' },
          { en: 'I help my father wash the family car.', si: 'මම තාත්තාට මෝටර් රථය සේදීමට උදව් කරනවා.', singlish: '[අයි හෙල්ප් මයි ෆාදර් වොෂ් ද ෆැමිලි කාර්]', tip: 'Help [හෙල්ප්] හි "p" තබන්න.' },
          { en: 'My younger brother is studying for exams.', si: 'මගේ බාල සොහොයුරා විභාගයට පාඩම් කරනවා.', singlish: '[මයි යන්ගර් බ්‍රදර් ඉස් ස්ටඩියින්ග් ෆෝ එක්සෑම්ස්]', tip: 'Studying [ස්ටඩියින්ග්] කියන්න.' },
          { en: 'We gather together for dinner every night.', si: 'අපි සෑම රාත්‍රියකම රාත්‍රී ආහාරයට එක්වෙනවා.', singlish: '[වී ගැදර් ටුගෙදර් ෆෝ ඩිනර් එව්රි නයිට්]', tip: 'Gather [ගැදර්] යනු එක්රැස්වීමයි.' },
          { en: 'Family harmony brings immense peace of mind.', si: 'පවුලේ සමගිය සිතට මහත් සැනසීමක් ගෙන දෙයි.', singlish: '[ෆැමිලි හාමනි බ්‍රින්ග්ස් ඉමෙන්ස් පීස් ඔෆ් මයින්ඩ්]', tip: 'Harmony [හාමනි] කියන්න.' },
        ],
        mistake: { incorrect: 'My family members is good.', correct: 'My family members are doing well.', explanationSinhala: '"Members" බහුවචන බැවින් "are" යොදන්න.' },
        adviceSi: 'නිවසේ සාමාජිකයන් සමඟද කුඩා ඉංග්‍රීසි වාක්‍ය කතා කරන්න පුරුදු වෙන්න!',
      },
    ],
  },

  // 11. Health, Clinic & Pharmacy (Lessons 501 - 550)
  {
    domain: 'Health, Medical Clinic & Pharmacy',
    domainSinhala: 'සුවදුක් සහ වෛද්‍ය ප්‍රතිකාර',
    subtopics: [
      {
        titleEn: 'Describing Symptoms to a Doctor',
        titleSi: 'රෝග ලක්ෂණ වෛද්‍යවරයාට විස්තර කිරීම',
        ruleTitleSi: '"I have a headache / fever / cough"',
        ruleExplainSi: 'වේදනාවන් සඳහා "I have a headache", "I feel dizzy" ආදී ලෙස යොදන්න.',
        phrases: [
          { en: 'I have had a severe headache since yesterday.', si: 'ඊයේ සිට මට තද හිසරදයක් තියෙනවා.', singlish: '[අයි හෑව් හෑඩ් අ සිවියර් හෙඩේක් සින්ස් යෙස්ටර්ඩේ]', tip: 'Severe [සිවියර්] යනු තදබල යන්නයි.' },
          { en: 'I feel slightly dizzy and nauseous.', si: 'මට මදක් කරකැවිල්ල සහ වමනය ගතිය දැනේ.', singlish: '[අයි ෆීල් ස්ලයිට්ලි ඩිසි ඇන්ඩ් නොසියස්]', tip: 'Dizzy [ඩිසි] කරකැවිල්ලයි.' },
          { en: 'How many times a day should I take this syrup?', si: 'දිනකට කී වතාවක් මම මේ පැණිය බිය යුතුද?', singlish: '[හවු මෙනි ටයිම්ස් අ ඩේ ෂුඩ් අයි ටේක් දිස් සිරප්?]', tip: 'Syrup [සිරප්] කියන්න.' },
          { en: 'Do these tablets have any side effects?', si: 'මෙම පෙති වලින් කිසියම් අතුරු ආබාධ තිබේද?', singlish: '[ඩූ දීස් ටැබ්ලට්ස් හෑව් එනි සයිඩ් ඉෆෙක්ට්ස්?]', tip: 'Side effects [සයිඩ් ඉෆෙක්ට්ස්] කියන්න.' },
          { en: 'Take complete bed rest and drink plenty of fluids.', si: 'සම්පූර්ණ විවේකය ලබා දියර වර්ග බොන්න.', singlish: '[ටේක් කම්ප්ලීට් බෙඩ් රෙස්ට් ඇන්ඩ් ඩ්‍රින්ක් ප්ලෙන්ටි ඔෆ් ෆ්ලුයිඩ්ස්]', tip: 'Fluids [ෆ්ලුයිඩ්ස්] දියර වර්ගයි.' },
        ],
        mistake: { incorrect: 'My head is paining.', correct: 'I have a headache.', explanationSinhala: 'ඉංග්‍රීසියේදී "head is paining" නොකියා "I have a headache" කියන්න.' },
        adviceSi: 'වෛද්‍යවරයාට රෝග ලක්ෂණ බිය නොවී පැහැදිලිව විස්තර කරන්න.',
      },
    ],
  },

  // 12. Bank, Post Office & Services (Lessons 551 - 600)
  {
    domain: 'Bank, Post Office & Government Services',
    domainSinhala: 'බැංකු සහ රාජ්‍ය සේවා',
    subtopics: [
      {
        titleEn: 'Opening an Account & ATM Transactions',
        titleSi: 'ගිණුමක් විවෘත කිරීම සහ ATM ගනුදෙනු',
        ruleTitleSi: '"I want to deposit / withdraw money"',
        ruleExplainSi: 'මුදල් තැන්පත් කිරීමට "deposit" ද, මුදල් ලබාගැනීමට "withdraw" ද යොදන්න.',
        phrases: [
          { en: 'I would like to open a savings account.', si: 'මට ඉතිරිකිරීමේ ගිණුමක් ආරම්භ කිරීමට අවශ්‍යයි.', singlish: '[අයි වුඩ් ලයික් ටු ඕපන් අ සේවින්ග්ස් එකවුන්ට්]', tip: 'Savings [සේවින්ග්ස්] කියන්න.' },
          { en: 'Could you help me fill out this deposit slip?', si: 'මෙම තැන්පතු පත්‍රිකාව පිරවීමට උදව් කළ හැකිද?', singlish: '[කුඩ් යූ හෙල්ප් මී ෆිල් අවුට් දිස් ඩිපොසිට් ස්ලිප්?]', tip: 'Deposit [ඩිපොසිට්] කියන්න.' },
          { en: 'The ATM machine did not dispense my cash.', si: 'ATM යන්ත්‍රයෙන් මගේ මුදල් නිකුත් වූයේ නැත.', singlish: '[දි ඒටීඑම් මැෂින් ඩිඩ් නොට් ඩිස්පෙන්ස් මයි කෑෂ්]', tip: 'Dispense [ඩිස්පෙන්ස්] නිකුත් කිරීමයි.' },
          { en: 'Please enter your four-digit secret PIN.', si: 'කරුණාකර ඔබගේ ඉලක්කම් හතරේ රහස් අංකය ඇතුළත් කරන්න.', singlish: '[ප්ලීස් එන්ටර් යෝර් ෆෝ ඩිජිට් සීක්‍රට් පින්]', tip: 'Four-digit [ෆෝ ඩිජිට්] කියන්න.' },
          { en: 'I need to send a registered parcel abroad.', si: 'මට විදේශයකට ලියාපදිංචි පාර්සලයක් යැවීමට අවශ්‍යයි.', singlish: '[අයි නීඩ් ටු සෙන්ඩ් අ රෙජිස්ටර්ඩ් පාර්සල් අබ්‍රෝඩ්]', tip: 'Abroad [අබ්‍රෝඩ්] විදේශයයි.' },
        ],
        mistake: { incorrect: 'I took out money from bank.', correct: 'I withdrew money from the bank.', explanationSinhala: 'බැංකුවෙන් මුදල් ලබාගැනීමට නියම පදය "withdraw" (අතීත කාලය "withdrew") වේ.' },
        adviceSi: 'බැංකුවේදී පෝලිමේ සිටින විට විනීතව අන් අයට ඉඩ දෙන්න.',
      },
    ],
  },

  // 13. Weather & Sri Lankan Seasons (Lessons 601 - 650)
  {
    domain: 'Weather, Nature & Sri Lankan Seasons',
    domainSinhala: 'කාලගුණය සහ ස්වභාව සෞන්දර්යය',
    subtopics: [
      {
        titleEn: 'Rain, Monsoons & Island Climate',
        titleSi: 'වැස්ස, මෝසම් සුළං සහ දේශගුණය',
        ruleTitleSi: '"It is raining", "It looks like rain"',
        ruleExplainSi: 'කාලගුණය පැවසීමේදී "It is sunny", "It is windy" ලෙස "It" යොදාගනී.',
        phrases: [
          { en: 'It is pouring heavily outside with thunder.', si: 'පිටත ගිගුරුම් සහිතව තදින් වහිනවා.', singlish: '[ඉට් ඉස් පෝරින්ග් හෙවිලි අවුට්සයිඩ් විත් තන්ඩර්]', tip: 'Pouring [පෝරින්ග්] තද වැස්සයි.' },
          { en: 'Do not forget to take your umbrella today.', si: 'අද කුඩය ගෙනියන්න අමතක කරන්න එපා.', singlish: '[ඩූ නොට් ෆෝගෙට් ටු ටේක් යෝර් අම්බ්‍රෙල්ලා ටුඩේ]', tip: 'Umbrella [අම්බ්‍රෙල්ලා] කියන්න.' },
          { en: 'The Southwest monsoon brings abundant rain.', si: 'නිරිතදිග මෝසමෙන් අධික වර්ෂාවක් ලැබේ.', singlish: '[ද සවුත්වෙස්ට් මොන්සූන් බ්‍රින්ග්ස් අබන්ඩන්ට් රේන්]', tip: 'Abundant [අබන්ඩන්ට්] බහුලයි.' },
          { en: 'The gentle morning breeze is so refreshing.', si: 'උදෑසන සිසිල් සුළඟ හරිම ප්‍රබෝධමත්.', singlish: '[ද ජෙන්ට්ල් මෝනින්ග් බ්‍රීස් ඉස් සෝ රිෆ්‍රෙෂින්ග්]', tip: 'Breeze [බ්‍රීස්] මෘදු සුළඟයි.' },
          { en: 'Sri Lanka is blessed with evergreen greenery.', si: 'ශ්‍රී ලංකාව සදාහරිත සොබාදහමෙන් ආශිර්වාද ලැබූවකි.', singlish: '[ශ්‍රී ලංකා ඉස් බ්ලෙස්ඩ් විත් එවර්ග්‍රීන් ග්‍රීනරි]', tip: 'Greenery [ග්‍රීනරි] කියන්න.' },
        ],
        mistake: { incorrect: 'Big rain is falling.', correct: 'It is raining heavily.', explanationSinhala: '"Big rain is falling" යනු සිංහල සිතුවිල්ලකි. "It is raining heavily" කියන්න.' },
        adviceSi: 'කාලගුණය ගැන කතා කිරීම ඉංග්‍රීසි සංවාදයක් ආරම්භ කිරීමට කදිම මගකි!',
      },
    ],
  },

  // 14. Job Interviews & Workplace (Lessons 651 - 700)
  {
    domain: 'Job Interviews, Career & Workplace',
    domainSinhala: 'රැකියා සම්මුඛ පරීක්ෂණ සහ වෘත්තීය සාර්ථකත්වය',
    subtopics: [
      {
        titleEn: 'Interview Strengths & Team Collaboration',
        titleSi: 'සම්මුඛ පරීක්ෂණ සහ කණ්ඩායම් වැඩ',
        ruleTitleSi: 'හැකියාවන් සහ දක්ෂතා ප්‍රකාශ කිරීම',
        ruleExplainSi: '"I have experience in...", "My greatest strength is..." භාවිත කරන්න.',
        phrases: [
          { en: 'Thank you for giving me this valuable interview.', si: 'මට මෙම වටිනා සම්මුඛ පරීක්ෂණය ලබා දීම ගැන ස්තූතියි.', singlish: '[තෑන්ක් යූ ෆෝ ගිවින්ග් මී දිස් වැලියුබල් ඉන්ටර්වීව්]', tip: 'Valuable [වැලියුබල්] කියන්න.' },
          { en: 'My greatest strength is my problem-solving ability.', si: 'මගේ ලොකුම ශක්තිය වන්නේ ගැටලු විසඳීමේ හැකියාවයි.', singlish: '[මයි ග්‍රේටස්ට් ස්ට්‍රෙන්ත් ඉස් මයි ප්‍රොබ්ලම් සොල්වින්ග් ඇබිලිටි]', tip: 'Strength [ස්ට්‍රෙන්ත්] කියන්න.' },
          { en: 'I work exceptionally well in a team environment.', si: 'මම කණ්ඩායමක් තුළ ඉතා සාර්ථකව වැඩ කරනවා.', singlish: '[අයි වර්ක් එක්සෙප්ෂනලි වෙල් ඉන් අ ටීම් එන්වයිරන්මන්ට්]', tip: 'Environment [එන්වයිරන්මන්ට්] කියන්න.' },
          { en: 'I am always eager to learn modern skills.', si: 'මම නිතරම නවීන නිපුණතා ඉගෙනීමට මහත් උනන්දුවක් දක්වමි.', singlish: '[අයි ඈම් ඕල්වේස් ඊගර් ටු ලර්න් මොඩර්න් ස්කිල්ස්]', tip: 'Modern [මොඩර්න්] කියන්න.' },
          { en: 'Where do you see yourself in five years?', si: 'වසර පහකින් ඔබ ඔබව දකින්නේ කොතැනද?', singlish: '[වෙයාර් ඩූ යූ සී යුවර්සෙල්ෆ් ඉන් ෆයිව් ඉයර්ස්?]', tip: 'Yourself [යුවර්සෙල්ෆ්] කියන්න.' },
        ],
        mistake: { incorrect: 'I have 5 years experience.', correct: 'I have 5 years of experience.', explanationSinhala: 'සම්මුඛ පරීක්ෂණයේදී "5 years of experience" ලෙස "of" යෙදිය යුතුය.' },
        adviceSi: 'සම්මුඛ පරීක්ෂකවරයාගේ දෑස් දෙස බලා පැහැදිලි ආත්ම විශ්වාසයෙන් කතා කරන්න.',
      },
    ],
  },

  // 15. Crucial Sri Lankan Mistakes (Lessons 701 - 750)
  {
    domain: 'Crucial Sri Lankan Mistakes Corrected',
    domainSinhala: 'ලාංකික අපිට නිතර වරදින තැන් නිවැරදි කිරීම',
    subtopics: [
      {
        titleEn: 'Eliminating Direct Sinhala Translations',
        titleSi: 'වචනයෙන් වචනය පරිවර්තනය නැවැත්වීම',
        ruleTitleSi: 'ස්වාභාවික ඉංග්‍රීසි භාවිතය',
        ruleExplainSi: 'සිංහල වාක්‍ය වචනයෙන් වචනය පරිවර්තනය නොකර නිවැරදි ඉංග්‍රීසි රටාව අනුගමනය කරන්න.',
        phrases: [
          { en: 'I will go and come back soon.', si: 'මම ගිහින් ඉක්මනින් එන්නම්.', singlish: '[අයි විල් ගෝ ඇන්ඩ් කම් බෑක් සූන්]', tip: 'Come back [කම් බෑක්] කියන්න.' },
          { en: 'Could you turn off the lights, please?', si: 'කරුණාකර විදුලි පහන් නිවා දමන්න පුළුවන්ද?', singlish: '[කුඩ් යූ ටර්න් ඕෆ් ද ලයිට්ස්, ප්ලීස්?]', tip: 'Turn off [ටර්න් ඕෆ්] නිවීමයි.' },
          { en: 'She gave birth to a healthy baby girl.', si: 'ඇය නිරෝගී දියණියක් බිහි කළාය.', singlish: '[ෂී ගේව් බර්ත් ටු අ හෙල්ති බේබි ගර්ල්]', tip: 'Birth [බර්ත්] කියන්න.' },
          { en: 'I am waiting for the bus patiently.', si: 'මම ඉවසීමෙන් බස් රථය එනතුරු බලා සිටිමි.', singlish: '[අයි ඈම් වේටින්ග් ෆෝ ද බස් පේෂන්ට්ලි]', tip: 'Patiently [පේෂන්ට්ලි] ඉවසීමෙනි.' },
          { en: 'He congratulated me on my exam success.', si: 'ඔහු මගේ විභාග ජයග්‍රහණයට සුබ පැතුවා.', singlish: '[හී කොන්ග්‍රැජුලේටඩ් මී ඔන් මයි එක්සෑම් සක්සස්]', tip: 'Congratulated [කොන්ග්‍රැජුලේටඩ්] කියන්න.' },
        ],
        mistake: { incorrect: 'Close the light.', correct: 'Turn off the light.', explanationSinhala: 'විදුලි බල්බ වලට "close" නොකියා "turn off" හෝ "switch off" කියන්න.' },
        adviceSi: 'පැටියෝ, වැරදි හදාගන්න බය වෙන්න එපා. වැරදෙන්නේ උත්සාහ කරන අයටයි!',
      },
    ],
  },

  // 16. Expressing Feelings & Opinions (Lessons 751 - 800)
  {
    domain: 'Expressing Feelings, Opinions & Debates',
    domainSinhala: 'හැඟීම් සහ පුද්ගලික අදහස් ප්‍රකාශ කිරීම',
    subtopics: [
      {
        titleEn: 'Agreeing, Disagreeing & Showing Empathy',
        titleSi: 'එකඟ වීම, විරුද්ධ වීම සහ සංවේදී වීම',
        ruleTitleSi: '"In my honest opinion...", "I totally agree"',
        ruleExplainSi: 'තමන්ගේ මතය ප්‍රකාශ කිරීමට "In my opinion...", "I believe that..." යොදන්න.',
        phrases: [
          { en: 'In my opinion, practice makes everything perfect.', si: 'මගේ මතය අනුව පුහුණුව සියල්ල සාර්ථක කරයි.', singlish: '[ඉන් මයි ඔපීනියන්, ප්‍රැක්ටිස් මේක්ස් එව්රිතින්ග් පර්ෆෙක්ට්]', tip: 'Opinion [ඔපීනියන්] කියන්න.' },
          { en: 'I completely agree with your viewpoint.', si: 'මම ඔබගේ මතය සමඟ සම්පූර්ණයෙන්ම එකඟ වෙමි.', singlish: '[අයි කම්ප්ලීට්ලි අග්‍රී විත් යෝර් වීව්පොයින්ට්]', tip: 'Agree [අග්‍රී] කියන්න.' },
          { en: 'I am so sorry to hear about your loss.', si: 'ඔබේ අහිමිවීම ගැන මම බෙහෙවින් කණගාටු වෙමි.', singlish: '[අයි ඈම් සෝ සොරි ටු හියර් අබවුට් යෝර් ලොස්]', tip: 'Loss [ලොස්] කියන්න.' },
          { en: 'Congratulations on your remarkable achievement!', si: 'ඔබගේ විශිෂ්ට ජයග්‍රහණයට උණුසුම් සුබපැතුම්!', singlish: '[කොන්ග්‍රැජුලේෂන්ස් ඔන් යෝර් රිමාකබල් අචීව්මන්ට්!]', tip: 'Remarkable [රිමාකබල්] කියන්න.' },
          { en: 'I deeply appreciate your continuous support.', si: 'ඔබගේ නිරන්තර සහයෝගය මම හදවතින්ම අගය කරමි.', singlish: '[අයි ඩීප්ලි අප්‍රීෂියේට් යෝර් කන්ටිනියුඅස් සපෝට්]', tip: 'Appreciate [අප්‍රීෂියේට්] කියන්න.' },
        ],
        mistake: { incorrect: 'I am agree with you.', correct: 'I agree with you.', explanationSinhala: '"Agree" යනු ක්‍රියා පදයකි (Verb). එබැවින් "am" නොයොදා "I agree" කියන්න.' },
        adviceSi: 'වෙනත් මතයක් පිළිගැනීමේදීත් විනීතව අදහස් ඉදිරිපත් කරන්න.',
      },
    ],
  },

  // 17. Modal Verbs: Can, Could, Should, Must (Lessons 801 - 850)
  {
    domain: 'Modal Verbs: Can, Could, Should, Must',
    domainSinhala: 'හැකියාවන් සහ උපදෙස් (Modals)',
    subtopics: [
      {
        titleEn: 'Obligation, Permission & Advice',
        titleSi: 'අවසර ගැනීම, උපදෙස් දීම සහ වගකීම',
        ruleTitleSi: 'Modal Verb + මූලික ක්‍රියාව (Bare Infinitive)',
        ruleExplainSi: 'Can, Could, Should, Must පසුව ක්‍රියාවට "to" හෝ "ing" එක් නොවේ (You should go, not you should to go).',
        phrases: [
          { en: 'You should drink clean boiled water.', si: 'ඔබ පිරිසිදු උණුකර නිවාගත් ජලය පානය කළ යුතුයි.', singlish: '[යූ ෂුඩ් ඩ්‍රින්ක් ක්ලීන් බොයිල්ඩ් වෝටර්]', tip: 'Should [ෂුඩ්] හි "l" නිහඬයි.' },
          { en: 'Could you lend me your dictionary for a moment?', si: 'මොහොතකට ඔබේ ශබ්දකෝෂය මට ණයට දිය හැකිද?', singlish: '[කුඩ් යූ ලෙන්ඩ් මී යෝර් ඩික්ෂනරි ෆෝ අ මෝමන්ට්?]', tip: 'Dictionary [ඩික්ෂනරි] කියන්න.' },
          { en: 'We must respect each other always.', si: 'අපි සැමවිටම එකිනෙකාට ගරු කළ යුතුය.', singlish: '[වී මස්ට් රිස්පෙක්ට් ඊච් අදර් ඕල්වේස්]', tip: 'Respect [රිස්පෙක්ට්] කියන්න.' },
          { en: 'You can achieve any dream with discipline.', si: 'විනය සමඟ ඔබට ඕනෑම සිහිනයක් සැබෑ කරගත හැක.', singlish: '[යූ කෑන් අචීව් එනි ඩ්‍රීම් විත් ඩිසිප්ලින්]', tip: 'Discipline [ඩිසිප්ලින්] කියන්න.' },
          { en: 'May I borrow your ballpoint pen?', si: 'මට ඔබේ බෝල්පොයින්ට් පෑන ලබාගත හැකිද?', singlish: '[මේ අයි බොරෝ යෝර් බෝල්පොයින්ට් පෙන්?]', tip: 'Borrow [බොරෝ] ණයට ගැනීමයි.' },
        ],
        mistake: { incorrect: 'He can to swim.', correct: 'He can swim.', explanationSinhala: '"Can" පසුව "to" නොයොදන්න. "He can swim" නිවැරදියි.' },
        adviceSi: 'උපදෙස් දෙන විට "You must" වෙනුවට "You should" යෙදීම වඩාත් සුහදශීලී වේ.',
      },
    ],
  },

  // 18. Emergency & Directions (Lessons 851 - 900)
  {
    domain: 'Emergency Situations & Asking Directions',
    domainSinhala: 'හදිසි අවස්ථා සහ පාරතොට විමසීම',
    subtopics: [
      {
        titleEn: 'Navigating Streets & Urgent Help',
        titleSi: 'පාරවල් සෙවීම සහ හදිසි උදව්',
        ruleTitleSi: '"Turn left", "Go straight", "Opposite to"',
        ruleExplainSi: '"Go straight ahead", "Turn left at the junction" ආදී ලෙස උපදෙස් ලබාදෙන්න.',
        phrases: [
          { en: 'Excuse me, how do I get to the hospital?', si: 'සමාවෙන්න, මම රෝහලට යන්නේ කෙසේද?', singlish: '[එක්ස්කියුස් මී, හවු ඩූ අයි ගෙට් ටු ද හොස්පිටල්?]', tip: 'Excuse me [එක්ස්කියුස් මී] කියන්න.' },
          { en: 'Go straight ahead and turn right at the junction.', si: 'කෙළින්ම ගොස් හන්දියෙන් දකුණට හැරෙන්න.', singlish: '[ගෝ ස්ට්‍රේට් අහෙඩ් ඇන්ඩ් ටර්න් රයිට් ඇට් ද ජන්ක්ෂන්]', tip: 'Straight [ස්ට්‍රේට්] කියන්න.' },
          { en: 'It is situated directly opposite the post office.', si: 'එය තැපැල් කාර්යාලයට කෙළින්ම විරුද්ධ පැත්තේ පිහිටා ඇත.', singlish: '[ඉට් ඉස් සිටුවෙයිටඩ් ඩිරෙක්ට්ලි ඔපසිට් ද පෝස්ට් ඔෆිස්]', tip: 'Opposite [ඔපසිට්] විරුද්ධ පැත්තයි.' },
          { en: 'Please call an ambulance immediately!', si: 'කරුණාකර වහාම ගිලන් රථයක් අමතන්න!', singlish: '[ප්ලීස් කෝල් ඇන් ඇම්බියුලන්ස් ඉමීඩියට්ලි!]', tip: 'Immediately [ඉමීඩියට්ලි] වහාමයි.' },
          { en: 'Is there a police station nearby?', si: 'මේ අසල පොලිස් ස්ථානයක් තිබේද?', singlish: '[ඉස් දෙයාර් අ පොලීස් ස්ටේෂන් නියර්බයි?]', tip: 'Nearby [නියර්බයි] අසලයි.' },
        ],
        mistake: { incorrect: 'Go front.', correct: 'Go straight ahead.', explanationSinhala: '"Go front" වෙනුවට නියම ඉංග්‍රීසි භාවිතය "Go straight ahead" වේ.' },
        adviceSi: 'පාර අසන විට සැමවිටම "Excuse me" කියා ආරම්භ කරන්න.',
      },
    ],
  },

  // 19. Festivals, Culture & Traditions (Lessons 901 - 950)
  {
    domain: 'Festivals, Culture & Sinhala Traditions',
    domainSinhala: 'සංස්කෘතිය, උත්සව සහ සිරිත් විරිත්',
    subtopics: [
      {
        titleEn: 'Sinhala New Year & Vesak Celebrations',
        titleSi: 'සිංහල අලුත් අවුරුද්ද සහ වෙසක් උත්සවය',
        ruleTitleSi: 'සංස්කෘතික සිරිත් ඉංග්‍රීසියෙන් විස්තර කිරීම',
        ruleExplainSi: '"We boil milk at the auspicious time", "We light lanterns" භාවිත කරන්න.',
        phrases: [
          { en: 'Wishing you a happy and prosperous Sinhala New Year!', si: 'ඔබට සුබ සහ සෞභාග්‍යමත් සිංහල අලුත් අවුරුද්දක් වේවා!', singlish: '[විෂින්ග් යූ අ හැපි ඇන්ඩ් ප්‍රොස්පරස් සිංහල නිව් ඉයර්!]', tip: 'Prosperous [ප්‍රොස්පරස්] සෞභාග්‍යමත්ය.' },
          { en: 'We boil fresh milk at the auspicious time.', si: 'අපි සුබ නැකතින් නැවුම් කිරි උතුරවනවා.', singlish: '[වී බොයිල් ෆ්‍රෙෂ් මිල්ක් ඇට් දි ඕස්පිෂස් ටයිම්]', tip: 'Auspicious [ඕස්පිෂස්] සුබ නැකතයි.' },
          { en: 'Children make colorful Vesak lanterns joyfully.', si: 'ළමයින් සතුටින් වර්ණවත් වෙසක් කූඩු සාදනවා.', singlish: '[චිල්ඩ්‍රන් මේක් කලර්ෆුල් වෙසක් ලැන්ටර්න්ස් ජෝයිෆුලි]', tip: 'Lanterns [ලැන්ටර්න්ස්] පහන් කූඩුයි.' },
          { en: 'People share sweetmeats with their neighbors.', si: 'මිනිසුන් අසල්වැසියන් සමඟ කැවිලි පෙවිලි බෙදාගන්නවා.', singlish: '[පීපල් ෂෙයාර් ස්වීට්මීට්ස් විත් දෙයාර් නේබර්ස්]', tip: 'Sweetmeats [ස්වීට්මීට්ස්] කැවිලියි.' },
          { en: 'Our rich heritage fosters unity and kindness.', si: 'අපේ පොහොසත් උරුමය සමගිය සහ කරුණාව වඩවයි.', singlish: '[අවර් රිච් හෙරිටේජ් ෆොස්ටර්ස් යුනිටි ඇන්ඩ් කයින්ඩ්නස්]', tip: 'Heritage [හෙරිටේජ්] උරුමයයි.' },
        ],
        mistake: { incorrect: 'We are boiling milk on nekatha.', correct: 'We boil milk at the auspicious time.', explanationSinhala: '"Nekatha" සඳහා නියම ඉංග්‍රීසි යෙදුම "auspicious time" වේ.' },
        adviceSi: 'අපේ ලස්සන සංස්කෘතිය විදේශිකයන්ට ඉංග්‍රීසියෙන් පැහැදිලි කරන්න පුරුදු වෙන්න!',
      },
    ],
  },

  // 20. Public Speaking & Fluency Mastery (Lessons 951 - 1000)
  {
    domain: 'Journalistic Fluency & Public Speaking',
    domainSinhala: 'ප්‍රසිද්ධ කථනය සහ කථිකත්වය',
    subtopics: [
      {
        titleEn: 'Delivering an Inspiring Speech & Presentation',
        titleSi: 'ප්‍රසිද්ධ කතාවක් පැවැත්වීම සහ ඉදිරිපත් කිරීම',
        ruleTitleSi: 'දේශනයක හැඳින්වීම සහ ප්‍රේක්ෂක ආමන්ත්‍රණය',
        ruleExplainSi: '"Distinguished guests, ladies and gentlemen...", "It gives me immense pleasure..." යොදන්න.',
        phrases: [
          { en: 'Honorable guests, ladies and gentlemen, good morning.', si: 'ගෞරවනීය අමුත්තනි, නෝනාවරුනි, මහත්වරුනි, සුබ උදෑසනක්.', singlish: '[ඔනරබල් ගෙස්ට්ස්, ලේඩීස් ඇන්ඩ් ජෙන්ට්ල්මෙන්, ගුඩ් මෝනින්ග්]', tip: 'Honorable හි "H" නිහඬයි (ඔනරබල්).' },
          { en: 'It gives me immense pleasure to address you all.', si: 'ඔබ සැම ඇමතීමට ලැබීම මට මහත් සතුටක් ගෙන දෙයි.', singlish: '[ඉට් ගිව්ස් මී ඉමෙන්ස් ප්ලෙෂර් ටු ඇඩ්‍රස් යූ ඕල්]', tip: 'Immense [ඉමෙන්ස්] අතිමහත්ය.' },
          { en: 'Determination and hard work always lead to success.', si: 'අදිටන සහ මහන්සිය සැමවිටම ජයග්‍රහණය කරා ගෙන යයි.', singlish: '[ඩිටර්මිනේෂන් ඇන්ඩ් හාඩ් වර්ක් ඕල්වේස් ලීඩ් ටු සක්සස්]', tip: 'Determination [ඩිටර්මිනේෂන්] අදිටනයි.' },
          { en: 'Thank you very much for your kind attention.', si: 'ඔබගේ කාරුණික අවධානයට බොහොම ස්තූතියි.', singlish: '[තෑන්ක් යූ වෙරි මච් ෆෝ යෝර් කයින්ඩ් ඇටෙන්ෂන්]', tip: 'Attention [ඇටෙන්ෂන්] අවධානයයි.' },
          { en: 'Congratulations! You have completed all 1,000 lessons!', si: 'සුබපැතුම්! ඔබ පාඩම් 1,000 ම සාර්ථකව නිම කළා!', singlish: '[කොන්ග්‍රැජුලේෂන්ස්! යූ හෑව් කම්ප්ලීටඩ් ඕල් වන් තවුසන්ඩ් ලෙසන්ස්!]', tip: 'Completed [කම්ප්ලීටඩ්] අවසන් කිරීමයි.' },
        ],
        mistake: { incorrect: 'Respected sirs and teachers.', correct: 'Distinguished guests and respected teachers.', explanationSinhala: 'ප්‍රසිද්ධ කතාවකදී "Distinguished guests" වඩාත් නිල සහ උසස් යෙදුමකි.' },
        adviceSi: 'පැටියෝ, ඔබ පාඩම් 1000 සාර්ථකව නිම කළා! දැන් ඔබට ඕනෑම තැනක චතුරව ඉංග්‍රීසි කතා කළ හැක. Moo!',
      },
    ],
  },
];

// Helper to deterministically build all 1,000 lessons
function generateAll1000Lessons(): Lesson[] {
  const result: Lesson[] = [];
  let lessonCounter = 1;

  for (let d = 0; d < DOMAINS_DATA.length; d++) {
    const domainObj = DOMAINS_DATA[d];
    const subCount = 50; // 20 domains * 50 lessons = exactly 1,000 lessons

    for (let i = 1; i <= subCount; i++) {
      const subBp = domainObj.subtopics[(i - 1) % domainObj.subtopics.length];
      const level: Lesson['level'] =
        lessonCounter <= 250
          ? 'Beginner 1'
          : lessonCounter <= 600
          ? 'Beginner 2'
          : 'Intermediate';

      const lessonNum = lessonCounter;
      const lessonTitleEn = `${domainObj.domain} - Step ${i}: ${subBp.titleEn}`;
      const lessonTitleSi = `${domainObj.domainSinhala} - පියවර ${i}: ${subBp.titleSi}`;

      const lessonPhrases: PhraseItem[] = subBp.phrases.map((p, pIdx) => ({
        id: `p-${lessonNum}-${pIdx + 1}`,
        english: p.en,
        sinhala: p.si,
        singlishPronunciation: p.singlish,
        teacherAudioTip: p.tip,
        notesSinhala: `පාඩම ${lessonNum} හි ප්‍රධාන කථන වාක්‍යයකි. ඩේසි ගුරුතුමිය සමඟ හඬ නගා කියවන්න.`,
      }));

      result.push({
        id: `lesson-${lessonNum}`,
        number: lessonNum,
        titleEnglish: lessonTitleEn,
        titleSinhala: lessonTitleSi,
        level,
        summarySinhala: `${domainObj.domainSinhala} යටතේ එන අංක ${lessonNum} වන Spoken English පාඩම. ඩේසි ගුරුතුමිය (Teacher Daisy) සමඟ හඬ නගා පුහුණු වන්න.`,
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
        teacherVoiceAdviceSinhala: `${subBp.adviceSi} මතක තබාගන්න පැටියෝ: පාඩම ${lessonNum} සාර්ථකව නිම කළ පසු ඊළඟ පාඩමට යන්න!`,
      });

      lessonCounter++;
    }
  }

  return result;
}

// 1,000 Complete English Lessons Catalog
export const LESSONS: Lesson[] = generateAll1000Lessons();

// Groupings for fast navigation (10 Volumes of 100 lessons each)
export const LESSON_VOLUMES = [
  { id: 'vol-1', title: 'Volume 1 (1 - 100)', range: [1, 100], desc: 'Greetings & Sentence Structure (SVO)' },
  { id: 'vol-2', title: 'Volume 2 (101 - 200)', range: [101, 200], desc: 'To Be Verbs & Daily Habits' },
  { id: 'vol-3', title: 'Volume 3 (201 - 300)', range: [201, 300], desc: 'Spoken Questions & Island Travel' },
  { id: 'vol-4', title: 'Volume 4 (301 - 400)', range: [301, 400], desc: 'Dining, Food & Market Shopping' },
  { id: 'vol-5', title: 'Volume 5 (401 - 500)', range: [401, 500], desc: 'Phone Calls & Home Family Life' },
  { id: 'vol-6', title: 'Volume 6 (501 - 600)', range: [501, 600], desc: 'Clinic Health & Banking Services' },
  { id: 'vol-7', title: 'Volume 7 (601 - 700)', range: [601, 700], desc: 'Weather & Workplace Interviews' },
  { id: 'vol-8', title: 'Volume 8 (701 - 800)', range: [701, 800], desc: 'Sri Lankan Mistakes & Opinions' },
  { id: 'vol-9', title: 'Volume 9 (801 - 900)', range: [801, 900], desc: 'Modal Verbs & Emergency Help' },
  { id: 'vol-10', title: 'Volume 10 (901 - 1000)', range: [901, 1000], desc: 'Cultural Festivals & Public Speaking' },
];
