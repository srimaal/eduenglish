import React, { useState } from 'react';
import { Volume2, AlertTriangle, Check, BookOpen, Search } from 'lucide-react';
import { speakEnglish } from '../utils/speechUtils';

interface CommonMistakesGuideProps {
  audioSpeed: number;
}

interface MistakeEntry {
  id: string;
  category: string;
  incorrect: string;
  correct: string;
  sinhalaExplanation: string;
  sinhalaMeaning: string;
  exampleContext: string;
}

const SRI_LANKAN_MISTAKES: MistakeEntry[] = [
  {
    id: 'm-1',
    category: 'Daily Actions & Appliances',
    incorrect: 'Please open the fan / Put the light.',
    correct: 'Please turn on the fan / Switch on the light.',
    sinhalaMeaning: 'කරුණාකර ෆෑන් එක දමන්න / ලයිට් එක දමන්න.',
    sinhalaExplanation: 'සිංහලෙන් "අරිනවා" හෝ "දානවා" කීවාට ඉංග්‍රීසියෙන් විදුලි උපකරණ සඳහා "Turn on" හෝ "Switch on" යෙදිය යුතුය. "Open" යොදන්නේ දොරවල්, ජනෙල් හෝ පෙට්ටි සඳහා පමණි.',
    exampleContext: 'කාර්යාලයේදී හෝ නිවසේදී විදුලි පංකාවක් හෝ විදුලි බුබුලක් දැමීමට අවශ්‍ය වූ විට.',
  },
  {
    id: 'm-2',
    category: 'Time & Emphasis',
    incorrect: 'Yesterday only I arrived from Galle.',
    correct: 'I arrived from Galle only yesterday.',
    sinhalaMeaning: 'මම ගාල්ලේ ඉඳන් ආවේ ඊයේ තමයි.',
    sinhalaExplanation: 'සිංහලෙන් "ඊයේ තමයි" කියා වාක්‍යය මුලට "Yesterday only" යෙදීම ලාංකික සිරිතකි. නමුත් ඉංග්‍රීසියේදී "only yesterday" වාක්‍යය අවසානයට පැමිණිය යුතුය.',
    exampleContext: 'යම් දෙයක් සිදු වූ නිශ්චිත වේලාව හෝ දිනය අවධාරණය කිරීමේදී.',
  },
  {
    id: 'm-3',
    category: 'Money & Belongings',
    incorrect: 'Can you borrow me 500 rupees?',
    correct: 'Can you lend me 500 rupees? / Can I borrow 500 rupees?',
    sinhalaMeaning: 'මට රුපියල් 500ක් ණයට දෙන්න පුළුවන්ද?',
    sinhalaExplanation: 'Lend = දෙනවා (ණයට දීම). Borrow = ගන්නවා (ණයට ගැනීම). ඔබට වෙනත් අයෙකු මුදල් දෙනවා නම් "Can you lend me" විය යුතුය.',
    exampleContext: 'මුදලක්, පෑනක් හෝ පොතක් තාවකාලිකව ඉල්ලා සිටින විට.',
  },
  {
    id: 'm-4',
    category: 'Question Tags',
    incorrect: 'You are coming tomorrow, no?',
    correct: 'You are coming tomorrow, aren\'t you? / right?',
    sinhalaMeaning: 'ඔබ හෙට එනවා නේද?',
    sinhalaExplanation: 'සිංහලෙන් අගට යොදන "නේද?" යන්නට "no?" කියා ඇසීම ලංකාවේ බහුල වැරැද්දකි. නිවැරදි Question Tag එක (aren\'t you?) හෝ අවම වශයෙන් "right?" යොදන්න.',
    exampleContext: 'කෙනෙකුගෙන් යමක් තහවුරු කරගැනීමේදී.',
  },
  {
    id: 'm-5',
    category: 'Possession & Family',
    incorrect: 'I am having two brothers and one sister.',
    correct: 'I have two brothers and one sister.',
    sinhalaMeaning: 'මට සහෝදරයන් දෙදෙනෙක් සහ එක් සහෝදරියක් සිටිනවා.',
    sinhalaExplanation: 'ස්ථිර අයිතියක් හෝ පවුලේ සබඳතා දැක්වීමේදී "have" යොදයි. "am having" යොදන්නේ කෑම කමින් හෝ අත්විඳිමින් සිටින අවස්ථාවකදී පමණි (I am having lunch).',
    exampleContext: 'පවුල හෝ තමන් සතු දේ ගැන හඳුන්වා දීමේදී.',
  },
  {
    id: 'm-6',
    category: 'Telephone Manners',
    incorrect: 'Why did you cut the phone?',
    correct: 'Why did you hang up the phone?',
    sinhalaMeaning: 'ඇයි ඔබ දුරකථන ඇමතුම විසන්ධි කළේ?',
    sinhalaExplanation: 'සිංහලෙන් "කෝල් එක කැපුවා" කීවාට ඉංග්‍රීසියෙන් "cut" නොයොදයි. "Hang up" හෝ "disconnect" යෙදිය යුතුය.',
    exampleContext: 'දුරකථන ඇමතුමක් අතරමග නතර වූ විට.',
  },
  {
    id: 'm-7',
    category: 'Parting & Farewells',
    incorrect: 'I will go and come.',
    correct: 'See you later! / I will be right back.',
    sinhalaMeaning: 'මම ගිහින් එන්නම්.',
    sinhalaExplanation: 'සිංහල සංස්කෘතියේ "ගිහින් එන්නම්" කීම සුබ ලකුණක් වුවද, ඉංග්‍රීසියෙන් "I will go and come" සෘජුව පරිවර්තනය නොකර "See you soon" හෝ "I will be back shortly" යොදන්න.',
    exampleContext: 'මිතුරන්ගෙන් හෝ කාර්යාලයෙන් මොහොතකට සමුගන්නා විට.',
  },
  {
    id: 'm-8',
    category: 'Feelings & Mental State',
    incorrect: 'He is tension today.',
    correct: 'He is stressed / anxious today.',
    sinhalaMeaning: 'ඔහු අද දැඩි මානසික පීඩනයෙන් ඉන්නේ.',
    sinhalaExplanation: 'Tension යනු නාම පදයකි (Noun). පුද්ගලයෙකුගේ තත්වය විස්තර කිරීමට විශේෂණ පදයක් (Adjective) වන "stressed" හෝ "worried" යෙදිය යුතුය.',
    exampleContext: 'යමෙකුගේ නොසන්සුන් බව විස්තර කරන විට.',
  },
];

export const CommonMistakesGuide: React.FC<CommonMistakesGuideProps> = ({ audioSpeed }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = SRI_LANKAN_MISTAKES.filter(
    (item) =>
      item.incorrect.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.correct.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sinhalaMeaning.includes(searchQuery) ||
      item.sinhalaExplanation.includes(searchQuery)
  );

  const handlePlayAudio = (item: MistakeEntry) => {
    setPlayingId(item.id);
    speakEnglish(item.correct, audioSpeed, 1.0, () => {
      setPlayingId(null);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Sri Lankan English Common Mistakes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1917]">
            අපිට නිතරම වරදින තැන් හරියටම හදාගනිමු
          </h2>
          <p className="text-xs sm:text-sm text-[#78716c] mt-1 max-w-2xl">
            සිංහලෙන් සිතා සෘජුව පරිවර්තනය කිරීම නිසා ලංකාවේ බහුලව භාවිත වන වැරදි ව්‍යවහාරයන් 
            ජාත්‍යන්තරව පිළිගත් ස්වභාවික ඉංග්‍රීසි වදන් බවට පත් කරගන්න.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#a8a29e] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="සොයන්න (Search phrase)..."
            className="w-full bg-white border border-[#d6cfc4] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#1c1917] placeholder:text-[#a8a29e] focus:outline-none focus:border-[#b45309]"
          />
        </div>
      </div>

      {/* Grid of Mistake Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((entry) => {
          const isPlaying = playingId === entry.id;
          return (
            <div
              key={entry.id}
              className="bg-white rounded-2xl border border-[#e7e2d9] p-5 shadow-xs space-y-4 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between text-xs text-[#78716c] border-b border-[#f5f1e8] pb-2">
                <span className="font-bold text-[#b45309] uppercase tracking-wider">
                  {entry.category}
                </span>
                <span>{entry.sinhalaMeaning}</span>
              </div>

              {/* Bad vs Good comparison */}
              <div className="space-y-2.5">
                <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 flex items-start gap-2.5">
                  <span className="text-xs font-bold text-rose-700 uppercase shrink-0 mt-0.5">
                    ❌ වැරදියි:
                  </span>
                  <div className="text-xs sm:text-sm font-mono text-rose-900 line-through">
                    "{entry.incorrect}"
                  </div>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-emerald-800 uppercase block mb-0.5">
                        ✅ නිවැරදි ඉංග්‍රීසිය:
                      </span>
                      <div className="text-xs sm:text-sm font-mono font-bold text-emerald-950">
                        "{entry.correct}"
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlayAudio(entry)}
                    className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer ${
                      isPlaying
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200'
                    }`}
                    title="නිවැරදි වාක්‍යයේ හඬ අසන්න"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sinhala rule explanation */}
              <div className="text-xs text-[#57534e] bg-[#fcfaf7] rounded-xl p-3 border border-[#e7ded0] leading-relaxed">
                <span className="font-bold text-[#b45309] block mb-1">
                  සර්ගේ පැහැදිලි කිරීම:
                </span>
                {entry.sinhalaExplanation}
              </div>

              <div className="text-[11px] text-[#78716c] italic">
                යොදන අවස්ථාව: {entry.exampleContext}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
