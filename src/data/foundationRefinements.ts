import type { FoundationLesson } from './foundationLessons';

/** Second editorial pass: keep the model language aligned with the skill
 * taught before the dedicated past/future/continuous modules. Useful polite
 * expressions are still taught as whole phrases, rather than tense theory. */
const REVISIONS: Record<number, Record<number, [string, string]>> = {
  2: {
    1: ['How are you this morning?', 'අද උදේ ඔයාට කොහොමද?'],
    4: ['How is your brother today?', 'අද ඔයාගේ සහෝදරයාට කොහොමද?'],
  },
  5: { 3: ['My hometown is Jaffna.', 'මගේ උපන් ගම යාපනය.'] },
  6: { 3: ['I am an information technology student.', 'මම තොරතුරු තාක්ෂණ සිසුවෙක්.'] },
  8: {
    1: ['This is my brother, Ravi.', 'මේ මගේ සහෝදරයා රවි.'],
    2: ['This is our teacher, Mrs Fernando.', 'මේ අපේ ගුරුතුමිය, ප්‍රනාන්දු මහත්මිය.'],
    3: ['This is my colleague, Roshani.', 'මේ මා සමඟ වැඩ කරන රොෂානි.'],
    4: ['This is my cousin, Suresh.', 'මේ මගේ ඥාති සහෝදරයා සුරේෂ්.'],
  },
  9: { 1: ['Nice to meet you, Mrs Fernando.', 'ප්‍රනාන්දු මහත්මිය, ඔබව හමුවීම සතුටක්.'] },
  12: {
    2: ['I live in Colombo now.', 'මම දැන් කොළඹ ජීවත් වෙනවා.'],
    4: ['My family lives in a village in the Southern Province.', 'මගේ පවුල දකුණු පළාතේ ගමක ජීවත් වෙනවා.'],
  },
  14: {
    1: ['I study accounting at college.', 'මම විද්‍යාලයේ ගිණුම්කරණය හදාරනවා.'],
    3: ['I help customers at the shop.', 'මම කඩයේ ගනුදෙනුකරුවන්ට උදව් කරනවා.'],
    4: ['I study nursing at a training college.', 'මම පුහුණු විද්‍යාලයක හෙද විද්‍යාව හදාරනවා.'],
  },
  16: { 3: ['Is that email address correct?', 'ඒ ඊමේල් ලිපිනය හරිද?'] },
  17: {
    2: ['Which school do you attend?', 'ඔයා ඉගෙන ගන්නේ මොන පාසලේද?'],
    3: ['Could you tell me your hometown?', 'ඔයාගේ උපන් ගම කියන්න පුළුවන්ද?'],
  },
  20: { 3: ['I study English after my classes.', 'මම මගේ පන්තිවලින් පස්සේ ඉංග්‍රීසි පාඩම් කරනවා.'] },
  24: {
    2: ['Our team plays cricket.', 'අපේ කණ්ඩායම ක්‍රිකට් ක්‍රීඩා කරනවා.'],
    3: ['The nurse checks my temperature.', 'හෙද නිලධාරියා මගේ උෂ්ණත්වය පරීක්ෂා කරනවා.'],
    4: ['The students complete their exercises.', 'සිසුන් ඔවුන්ගේ අභ්‍යාස අවසන් කරනවා.'],
  },
  26: { 4: ['We visit the temple every Friday.', 'අපි හැම සිකුරාදාම පන්සලට යනවා.'] },
  27: {
    1: ['I meet her at the station every Monday.', 'මම හැම සඳුදාම ඇයව දුම්රිය ස්ථානයේදී හමුවෙනවා.'],
    2: ['The teacher helps us with the exercise.', 'ගුරුවරයා අභ්‍යාසයට අපට උදව් කරනවා.'],
    4: ['My brother invites him to dinner.', 'මගේ සහෝදරයා ඔහුට රාත්‍රී කෑමට ආරාධනා කරනවා.'],
  },
  28: {
    2: ['We grow mango trees behind our house.', 'අපි අපේ ගෙදර පිටුපස අඹ ගස් වවනවා.'],
    3: ['The teacher explains the lesson clearly in the classroom.', 'ගුරුවරයා පන්ති කාමරයේදී පාඩම පැහැදිලිව විස්තර කරනවා.'],
    4: ['They prepare the school concert together every year.', 'ඔවුන් හැම අවුරුද්දේම එකට පාසල් ප්‍රසංගය සූදානම් කරනවා.'],
  },
  29: {
    1: ['She sends messages to her friends.', 'ඇය මිතුරන්ට පණිවිඩ යවනවා.'],
    3: ['He gives the keys to his sister.', 'ඔහු සහෝදරියට යතුරු දෙනවා.'],
    4: ['The children carry their bags into the classroom.', 'ළමයි බෑග් පන්ති කාමරයට ගෙනියනවා.'],
  },
  30: {
    3: ['The mechanic repairs bicycles because he enjoys the work.', 'ඒ වැඩයට කැමති නිසා කාර්මිකයා බයිසිකල් අලුත්වැඩියා කරනවා.'],
    4: ['We help our neighbour because she is kind to us.', 'අපට කරුණාවන්ත නිසා අපි අපේ අසල්වැසියාට උදව් කරනවා.'],
  },
  31: {
    0: ['There is a bird in the mango tree.', 'අඹ ගසේ කුරුල්ලෙක් ඉන්නවා.'],
    1: ['She has an umbrella in her bag.', 'ඇයගේ බෑගයේ කුඩයක් තියෙනවා.'],
    3: ['The journey takes an hour.', 'ගමනට පැයක් ගත වෙනවා.'],
  },
  32: {
    2: ['My keys are on the kitchen table.', 'මගේ යතුරු මුළුතැන්ගෙයි මේසය මත තියෙනවා.'],
    3: ['The teacher has our exam papers.', 'ගුරුවරයා ළඟ අපේ විභාග ප්‍රශ්න පත්‍ර තියෙනවා.'],
  },
  35: {
    1: ['Sri Lanka is in the Indian Ocean.', 'ශ්‍රී ලංකාව ඉන්දියානු සාගරයේ පිහිටා තියෙනවා.'],
    2: ['The clock tower is near the market.', 'ඔරලෝසු කණුව වෙළඳපොළ ළඟයි.'],
    3: ['The bridge is near our school.', 'පාලම අපේ පාසල ළඟයි.'],
    4: ['The Temple of the Tooth is in Kandy.', 'ශ්‍රී දළදා මාලිගාව මහනුවර පිහිටා තියෙනවා.'],
  },
  36: { 0: ['We have some oranges in the kitchen.', 'මුළුතැන්ගෙයි අපට දොඩම් කිහිපයක් තියෙනවා.'] },
  38: {
    2: ['The class lasts for an hour.', 'පන්තිය පැයක් පැවැත්වෙනවා.'],
    3: ['This is a European flag.', 'මේ යුරෝපීය කොඩියක්.'],
  },
  39: {
    1: ['I have a new phone.', 'මට අලුත් දුරකථනයක් තියෙනවා.'],
    3: ['We have lunch at a small café.', 'අපි කුඩා කැෆේ එකක දවල් කෑම කනවා.'],
  },
  40: { 3: ['The clock is above the door.', 'ඔරලෝසුව දොරට ඉහළින් තියෙනවා.'] },
  44: { 1: ['Those students are near the school bus.', 'ඒ සිසුන් පාසල් බස් එක ළඟ ඉන්නවා.'] },
  47: { 3: ['Those empty bottles are clean.', 'ඒ හිස් බෝතල් පිරිසිදුයි.'] },
  48: {
    2: ['These cotton shirts are soft.', 'මේ කපු කමිස මෘදුයි.'],
    3: ['Those shirts are dirty.', 'ඒ කමිස අපිරිසිදුයි.'],
  },
  50: {
    2: ['This road is busy, but that road is quiet.', 'මේ පාර කාර්යබහුලයි, නමුත් ඒ පාර නිහඬයි.'],
    3: ['These bags are full, but those bags are empty.', 'මේ බෑග් පිරිලා, නමුත් ඒ බෑග් හිස්.'],
    4: ['That is your book on the shelf.', 'රාක්කයේ තියෙන ඒ පොත ඔයාගේ.'],
  },
  87: { 4: ['How many days do you work each week?', 'ඔයා හැම සතියේම දවස් කීයක් වැඩ කරනවාද?'] },
  94: { 2: ['The shop opens again on 5 January.', 'කඩය ජනවාරි පහවෙනිදා නැවත අරිනවා.'] },
  96: { 1: ['Our team is in first place.', 'අපේ කණ්ඩායම පළමු ස්ථානයේ ඉන්නවා.'] },
};

export function refineFoundationModel(number: number, lesson: FoundationLesson): FoundationLesson {
  const revisions = REVISIONS[number];
  if (!revisions) return lesson;
  return { ...lesson, phrases: lesson.phrases.map((pair, index) => revisions[index] ?? pair) };
}
