# Supabase Edge Functions デプロイ手順

## 概要

このディレクトリにはSupabase Edge Functionsのコードが含まれています。
セキュリティ上の理由から、OpenAI APIキーやスコア登録はEdge Function経由で行います。

## Edge Functions一覧

| 関数名 | 用途 | 呼び出し元 |
|--------|------|-----------|
| ai_feedback | AI成績診断（OpenAI GPT-4o-mini） | utils/openai.ts |
| submit_score | スコア登録（レート制限・妥当性チェック付き） | utils/storage/cloud.ts |

## デプロイ手順

### 1. Supabase CLIのインストール

```bash
npm install -g supabase
```

### 2. Supabaseにログイン

```bash
supabase login
```

### 3. プロジェクトにリンク

```bash
cd /path/to/gakuho-quiz-app
supabase link --project-ref sqbuuhgncdnfgoahzlcb
```

### 4. Secretsの設定

SupabaseダッシュボードでSecretsを設定:
https://supabase.com/dashboard/project/sqbuuhgncdnfgoahzlcb/settings/functions

設定する値:
- `OPENAI_API_KEY`: OpenAI APIキー（sk-proj-...）

または、CLIで設定:
```bash
supabase secrets set OPENAI_API_KEY=sk-proj-xxxxx
```

### 5. Edge Functionsのデプロイ

```bash
# ai_feedbackをデプロイ
supabase functions deploy ai_feedback --no-verify-jwt

# submit_scoreをデプロイ
supabase functions deploy submit_score --no-verify-jwt
```

### 6. 動作確認

```bash
# ai_feedbackのテスト
curl -X POST 'https://sqbuuhgncdnfgoahzlcb.supabase.co/functions/v1/ai_feedback' \
  -H 'Content-Type: application/json' \
  -d '{
    "subjectScores": [{"subject":"math","subjectName":"数学","correct":7,"total":10,"rate":70}],
    "totalRate": 70,
    "totalScore": 980
  }'

# submit_scoreのテスト
curl -X POST 'https://sqbuuhgncdnfgoahzlcb.supabase.co/functions/v1/submit_score' \
  -H 'Content-Type: application/json' \
  -d '{
    "deviceId": "test-device-123",
    "mode": "normal_math_30",
    "score": 500,
    "correctCount": 5,
    "totalQuestions": 10,
    "timeLimit": 30
  }'
```

## セキュリティ機能

### ai_feedback
- レート制限: 1デバイスあたり1分間に3回まで
- タイムアウト: 10秒
- フォールバック: API失敗時は定型文を返却

### submit_score
- レート制限: 1デバイスあたり1分間に5回まで
- スコア妥当性チェック:
  - スコア範囲: 0〜100,000
  - 最大可能スコア計算との比較
  - 正解数0でスコア>0は拒否
- ブラックリスト機能（不正連続検知時）

## トラブルシューティング

### 「OPENAI_API_KEY not found」エラー
→ SupabaseダッシュボードでSecretsが設定されているか確認

### 「Rate limit exceeded」エラー
→ 短時間に複数回呼び出しすぎ。1分待ってリトライ

### Edge Functionが404
→ デプロイされていない。`supabase functions deploy`を実行

## ログ確認

```bash
supabase functions logs ai_feedback
supabase functions logs submit_score
```

または、Supabaseダッシュボード:
https://supabase.com/dashboard/project/sqbuuhgncdnfgoahzlcb/functions
