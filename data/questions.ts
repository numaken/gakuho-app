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
  {
    id: 'jp-006',
    subject: 'japanese',
    question: '「源氏物語」の作者は？',
    choices: ['清少納言', '紫式部', '和泉式部', '赤染衛門'],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 'jp-007',
    subject: 'japanese',
    question: '「つれづれなるままに」で始まる作品は？',
    choices: ['枕草子', '徒然草', '方丈記', '平家物語'],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 'jp-008',
    subject: 'japanese',
    question: '「五段活用」の動詞はどれ？',
    choices: ['見る', '食べる', '書く', '起きる'],
    correctIndex: 2,
    difficulty: 2,
  },
  {
    id: 'jp-009',
    subject: 'japanese',
    question: '俳句の季語で「春」を表すものは？',
    choices: ['紅葉', '蛍', '桜', '雪'],
    correctIndex: 2,
    difficulty: 1,
  },
  {
    id: 'jp-010',
    subject: 'japanese',
    question: '「羅生門」の作者は？',
    choices: ['夏目漱石', '森鷗外', '芥川龍之介', '太宰治'],
    correctIndex: 2,
    difficulty: 2,
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
  {
    id: 'so-006',
    subject: 'social',
    question: '室町幕府を開いたのは誰？',
    choices: ['源頼朝', '足利尊氏', '徳川家康', '織田信長'],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 'so-007',
    subject: 'social',
    question: '日本で最も長い川は？',
    choices: ['利根川', '信濃川', '石狩川', '天竜川'],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 'so-008',
    subject: 'social',
    question: '明治維新が始まった年は？',
    choices: ['1853年', '1868年', '1889年', '1912年'],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 'so-009',
    subject: 'social',
    question: '国会の二院制で、衆議院ともう一つは？',
    choices: ['元老院', '参議院', '貴族院', '枢密院'],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 'so-010',
    subject: 'social',
    question: '世界で最も人口が多い国は？',
    choices: ['アメリカ', '中国', 'インド', 'インドネシア'],
    correctIndex: 2,
    difficulty: 2,
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
  {
    id: 'ma-006',
    subject: 'math',
    question: '√16 = ?',
    choices: ['2', '4', '8', '16'],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 'ma-007',
    subject: 'math',
    question: '一次関数 y = 2x + 3 で、x = 2 のときの y は？',
    choices: ['5', '6', '7', '8'],
    correctIndex: 2,
    difficulty: 2,
  },
  {
    id: 'ma-008',
    subject: 'math',
    question: '三角形の内角の和は何度？',
    choices: ['90度', '180度', '270度', '360度'],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 'ma-009',
    subject: 'math',
    question: '2³ = ?',
    choices: ['4', '6', '8', '9'],
    correctIndex: 2,
    difficulty: 1,
  },
  {
    id: 'ma-010',
    subject: 'math',
    question: '連立方程式 x + y = 5, x - y = 1 の解は？',
    choices: ['x=2, y=3', 'x=3, y=2', 'x=4, y=1', 'x=1, y=4'],
    correctIndex: 1,
    difficulty: 3,
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
  {
    id: 'sc-006',
    subject: 'science',
    question: '塩酸の化学式は？',
    choices: ['NaCl', 'HCl', 'H2SO4', 'NaOH'],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 'sc-007',
    subject: 'science',
    question: '植物の細胞にあって動物の細胞にないものは？',
    choices: ['核', '細胞膜', '細胞壁', 'ミトコンドリア'],
    correctIndex: 2,
    difficulty: 2,
  },
  {
    id: 'sc-008',
    subject: 'science',
    question: '音の速さは空気中で約何m/秒？',
    choices: ['34', '340', '3400', '34000'],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 'sc-009',
    subject: 'science',
    question: '地球の自転の向きは？',
    choices: ['東から西', '西から東', '北から南', '南から北'],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 'sc-010',
    subject: 'science',
    question: '血液中で酸素を運ぶのは？',
    choices: ['白血球', '赤血球', '血小板', '血しょう'],
    correctIndex: 1,
    difficulty: 1,
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
  {
    id: 'en-006',
    subject: 'english',
    question: '"book" の複数形は？',
    choices: ['bookes', 'bookies', 'books', 'booky'],
    correctIndex: 2,
    difficulty: 1,
  },
  {
    id: 'en-007',
    subject: 'english',
    question: '"He ___ to school every day." に入る語は？',
    choices: ['go', 'goes', 'going', 'went'],
    correctIndex: 1,
    difficulty: 1,
  },
  {
    id: 'en-008',
    subject: 'english',
    question: '"I have ___ been to Kyoto." に入る語は？',
    choices: ['ever', 'never', 'yet', 'already'],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 'en-009',
    subject: 'english',
    question: '"The book ___ written by him." に入る語は？',
    choices: ['is', 'was', 'were', 'be'],
    correctIndex: 1,
    difficulty: 2,
  },
  {
    id: 'en-010',
    subject: 'english',
    question: '"good" の最上級は？',
    choices: ['gooder', 'goodest', 'better', 'best'],
    correctIndex: 3,
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
