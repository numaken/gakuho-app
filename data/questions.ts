import { Question } from '../types';

export const questions: Question[] = [
  // 国語
  {
    id: 'jp-001',
    subject: 'japanese',
    question: '「走る」の活用形で、「走れば」は何形？',
    choices: ['未然形', '連用形', '終止形', '仮定形'],
    correctIndex: 3,
    difficulty: 1,
  },
  {
    id: 'jp-002',
    subject: 'japanese',
    question: '次のうち、形容詞はどれ？',
    choices: ['美しい', '静かだ', '走る', '本'],
    correctIndex: 0,
    difficulty: 1,
  },
  {
    id: 'jp-003',
    subject: 'japanese',
    question: '「枕草子」の作者は？',
    choices: ['紫式部', '清少納言', '和泉式部', '小野小町'],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 'jp-004',
    subject: 'japanese',
    question: '「月日は百代の過客にして」で始まる作品は？',
    choices: ['徒然草', '方丈記', '奥の細道', '土佐日記'],
    correctIndex: 2,
    difficulty: 2,
  },
  {
    id: 'jp-005',
    subject: 'japanese',
    question: '「推敲」の語源となった詩人は？',
    choices: ['李白', '杜甫', '賈島', '白居易'],
    correctIndex: 2,
    difficulty: 3,
  },

  // 社会
  {
    id: 'so-001',
    subject: 'social',
    question: '日本の首都はどこ？',
    choices: ['大阪', '京都', '東京', '名古屋'],
    correctIndex: 2,
    difficulty: 1,
  },
  {
    id: 'so-002',
    subject: 'social',
    question: '鎌倉幕府を開いたのは誰？',
    choices: ['源頼朝', '源義経', '平清盛', '足利尊氏'],
    correctIndex: 0,
    difficulty: 1,
  },
  {
    id: 'so-003',
    subject: 'social',
    question: '日本国憲法が公布された年は？',
    choices: ['1945年', '1946年', '1947年', '1948年'],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 'so-004',
    subject: 'social',
    question: '三権分立の「三権」に含まれないのは？',
    choices: ['立法権', '行政権', '司法権', '徴税権'],
    correctIndex: 3,
    difficulty: 2,
  },
  {
    id: 'so-005',
    subject: 'social',
    question: 'EUの本部がある都市は？',
    choices: ['パリ', 'ベルリン', 'ブリュッセル', 'ロンドン'],
    correctIndex: 2,
    difficulty: 3,
  },

  // 数学
  {
    id: 'ma-001',
    subject: 'math',
    question: '3 + 5 × 2 = ?',
    choices: ['16', '13', '11', '10'],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 'ma-002',
    subject: 'math',
    question: '(-3) × (-4) = ?',
    choices: ['-12', '-7', '7', '12'],
    correctIndex: 3,
    difficulty: 1,
  },
  {
    id: 'ma-003',
    subject: 'math',
    question: '2x + 3 = 11 のとき、x = ?',
    choices: ['2', '3', '4', '5'],
    correctIndex: 2,
    difficulty: 2,
  },
  {
    id: 'ma-004',
    subject: 'math',
    question: '円周率πは約いくつ？',
    choices: ['3.14', '2.72', '1.41', '1.73'],
    correctIndex: 0,
    difficulty: 1,
  },
  {
    id: 'ma-005',
    subject: 'math',
    question: '直角三角形の斜辺が5、一辺が3のとき、もう一辺は？',
    choices: ['2', '3', '4', '6'],
    correctIndex: 2,
    difficulty: 2,
  },

  // 理科
  {
    id: 'sc-001',
    subject: 'science',
    question: '水の化学式は？',
    choices: ['H2O', 'CO2', 'NaCl', 'O2'],
    correctIndex: 0,
    difficulty: 1,
  },
  {
    id: 'sc-002',
    subject: 'science',
    question: '光合成で植物が吸収する気体は？',
    choices: ['酸素', '窒素', '二酸化炭素', '水素'],
    correctIndex: 2,
    difficulty: 1,
  },
  {
    id: 'sc-003',
    subject: 'science',
    question: '地球から最も近い恒星は？',
    choices: ['北極星', '太陽', 'シリウス', 'ベガ'],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 'sc-004',
    subject: 'science',
    question: '電気抵抗の単位は？',
    choices: ['アンペア', 'ボルト', 'ワット', 'オーム'],
    correctIndex: 3,
    difficulty: 2,
  },
  {
    id: 'sc-005',
    subject: 'science',
    question: 'DNAの二重らせん構造を発見した科学者は？',
    choices: ['ダーウィン', 'メンデル', 'ワトソンとクリック', 'パスツール'],
    correctIndex: 2,
    difficulty: 3,
  },

  // 英語
  {
    id: 'en-001',
    subject: 'english',
    question: '"apple" の意味は？',
    choices: ['オレンジ', 'りんご', 'バナナ', 'ぶどう'],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 'en-002',
    subject: 'english',
    question: '"I ___ a student." に入る語は？',
    choices: ['is', 'am', 'are', 'be'],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 'en-003',
    subject: 'english',
    question: '"She has already ___ her homework." に入る語は？',
    choices: ['do', 'did', 'done', 'doing'],
    correctIndex: 2,
    difficulty: 2,
  },
  {
    id: 'en-004',
    subject: 'english',
    question: '"If it rains tomorrow, I ___ stay home." に入る語は？',
    choices: ['will', 'would', 'am', 'was'],
    correctIndex: 0,
    difficulty: 2,
  },
  {
    id: 'en-005',
    subject: 'english',
    question: '"beautiful" の比較級は？',
    choices: ['beautifuler', 'more beautiful', 'most beautiful', 'beautifuller'],
    correctIndex: 1,
    difficulty: 2,
  },
];

// 教科別に問題を取得
export const getQuestionsBySubject = (subject: string): Question[] => {
  return questions.filter((q) => q.subject === subject);
};

// ランダムに問題を取得
export const getRandomQuestions = (
  subjects: string[],
  count: number
): Question[] => {
  const filtered = questions.filter((q) => subjects.includes(q.subject));
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// 苦手問題を取得（statsに基づく）
export const getWeakQuestions = (
  stats: Record<string, { attempts: number; correct: number }>,
  subjects: string[],
  count: number
): Question[] => {
  const weakIds = Object.entries(stats)
    .filter(([_, stat]) => {
      if (stat.attempts < 3) return false;
      const errorRate = 1 - stat.correct / stat.attempts;
      return errorRate >= 0.5;
    })
    .map(([id]) => id);

  const weakQuestions = questions.filter(
    (q) => weakIds.includes(q.id) && subjects.includes(q.subject)
  );

  if (weakQuestions.length >= count) {
    return weakQuestions.sort(() => Math.random() - 0.5).slice(0, count);
  }

  // 苦手問題が足りない場合は通常問題で補完
  const remaining = count - weakQuestions.length;
  const normalQuestions = getRandomQuestions(subjects, remaining);
  return [...weakQuestions, ...normalQuestions];
};
