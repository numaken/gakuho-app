// 学宝社副教材データ (サンプル)
// 実際の教材データはSupabaseまたはAPIから取得することを想定

export interface Material {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade: number[]; // 対応学年
  price: number;
  url: string;
  imageUrl?: string;
}

export const materials: Material[] = [
  // 国語
  {
    id: 'mat-jp-001',
    name: '中学国語 文法マスター',
    description: '動詞の活用から敬語まで、文法の基礎を完全攻略!',
    subject: 'japanese',
    grade: [1, 2, 3],
    price: 880,
    url: 'https://www.gakuho.co.jp/materials/japanese/grammar',
  },
  {
    id: 'mat-jp-002',
    name: '古典入門ワーク',
    description: '古文・漢文の基礎をわかりやすく解説',
    subject: 'japanese',
    grade: [2, 3],
    price: 770,
    url: 'https://www.gakuho.co.jp/materials/japanese/classics',
  },

  // 社会
  {
    id: 'mat-so-001',
    name: '歴史年表ドリル',
    description: '重要年号と出来事を効率的に暗記!',
    subject: 'social',
    grade: [1, 2, 3],
    price: 660,
    url: 'https://www.gakuho.co.jp/materials/social/history',
  },
  {
    id: 'mat-so-002',
    name: '地理・公民 一問一答',
    description: 'テスト前の総復習に最適!',
    subject: 'social',
    grade: [1, 2, 3],
    price: 550,
    url: 'https://www.gakuho.co.jp/materials/social/geography',
  },

  // 数学
  {
    id: 'mat-ma-001',
    name: '計算力アップドリル',
    description: '毎日10分で計算力がぐんぐん伸びる!',
    subject: 'math',
    grade: [1, 2, 3],
    price: 550,
    url: 'https://www.gakuho.co.jp/materials/math/calculation',
  },
  {
    id: 'mat-ma-002',
    name: '図形・関数 完全攻略',
    description: '苦手な図形と関数を徹底克服!',
    subject: 'math',
    grade: [2, 3],
    price: 880,
    url: 'https://www.gakuho.co.jp/materials/math/geometry',
  },

  // 理科
  {
    id: 'mat-sc-001',
    name: '理科実験ノート',
    description: '実験の手順とポイントをイラストで解説',
    subject: 'science',
    grade: [1, 2, 3],
    price: 660,
    url: 'https://www.gakuho.co.jp/materials/science/experiment',
  },
  {
    id: 'mat-sc-002',
    name: '化学式・公式 暗記カード',
    description: '重要な化学式と公式をカードで暗記',
    subject: 'science',
    grade: [2, 3],
    price: 440,
    url: 'https://www.gakuho.co.jp/materials/science/formula',
  },

  // 英語
  {
    id: 'mat-en-001',
    name: '英単語ターゲット1200',
    description: '中学必修の英単語を完全マスター',
    subject: 'english',
    grade: [1, 2, 3],
    price: 770,
    url: 'https://www.gakuho.co.jp/materials/english/vocabulary',
  },
  {
    id: 'mat-en-002',
    name: '英文法 基礎から応用',
    description: '文法のつまずきポイントを丁寧に解説',
    subject: 'english',
    grade: [1, 2, 3],
    price: 880,
    url: 'https://www.gakuho.co.jp/materials/english/grammar',
  },
];

// 教科に対応した教材を取得
export const getMaterialsBySubject = (subject: string): Material[] => {
  return materials.filter((m) => m.subject === subject);
};

// 苦手教科に対応した教材をレコメンド
export const getRecommendedMaterials = (
  weakSubjects: string[],
  limit: number = 3
): Material[] => {
  const recommended: Material[] = [];

  for (const subject of weakSubjects) {
    const subjectMaterials = getMaterialsBySubject(subject);
    if (subjectMaterials.length > 0) {
      // 各教科から1つずつ選択
      recommended.push(subjectMaterials[0]);
    }
    if (recommended.length >= limit) break;
  }

  // 足りない場合は他の教材で補完
  if (recommended.length < limit) {
    const remaining = materials.filter(
      (m) => !recommended.some((r) => r.id === m.id)
    );
    recommended.push(...remaining.slice(0, limit - recommended.length));
  }

  return recommended.slice(0, limit);
};
