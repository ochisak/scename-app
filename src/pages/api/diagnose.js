// src/pages/api/diagnose.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    story,
    readerName,
    responses,
    responderName,
    responderAge,
    responderGender,
  } = req.body;

  // ✅ 安全なレスポンス処理
  const safeResponses = Array.isArray(responses) ? responses : [];

 const prompt = `
あなたは恋愛診断のプロフェッショナルAIです。

以下の情報は、ある「恋愛ストーリー」において、回答者（診断対象者）が登場キャラクター（${readerName}）との関係性にどう反応したかを示すものです。

【診断者情報】
ニックネーム：${responderName}
年代：${responderAge}
性別：${responderGender}

この人物が、${readerName}に対して全5シーンの恋愛ストーリーを読み、各シーンで選択肢または自由記述でリアクションを返しました。
あなたはその内容を元に「恋愛攻略診断」を行ってください。

---

【目的】
- 各シーンでは「描写」「質問」「回答」「診断コメント」の順で整理
- 回答がフリーワードだった場合は、回答者の個性や感性をできるだけユニークに読み取り、面白く／時にツッコミながらコメント
- 攻略度（5点満点）を各シーンに付ける
- 最後に最終スコア（％）と総評を記載
- 出力の最後には「この診断は〇〇さんと△△さんの恋愛診断です」と共有文を含める

---

【入力情報】
相手キャラ名：${readerName}
診断者情報：${responderName}（${responderAge} / ${responderGender}）

シナリオ本文：
${story}

回答内容：
${safeResponses.map((r, i) => `Q${i + 1}: ${r}`).join("\n")}

---

【出力フォーマット】

🧠攻略診断：${readerName} × ${responderName}
タイトル：（ちょっと笑えて情景が浮かぶタイトル）

【Scene 1】
📖シーン描写：（シナリオ本文に沿って）
💬質問：（シナリオの質問部分を再掲）
🗣️${responderName}の返答：「選択肢〜」または「フリーワード〜」
🧠診断コメント：（ユニークに・的確に・共感やズレを分析）
🎯攻略度：● / 5

【Scene 2〜5も同様に記載】

🎯最終攻略診断：●％（簡潔なまとめ）

🔍講評まとめ：（例：共感力・テンポ・表現・感受性などを項目別に一言ずつ）

📝総評：（この人と${readerName}が合う理由や、今後の展望・改善点）

📢この診断は「${readerName}」さんと「${responderName}」さんの相性診断として作成されたものです。
SNSなどでもシェアして、あなたの「落とし方」を見てもらおう！
#シナリオミー で、“自分の落とし方”を知ろう！
`;


  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
    });

    const diagnosis = completion.choices[0].message.content;
    res.status(200).json({ result: diagnosis });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "診断の生成に失敗しました" });
  }
}
