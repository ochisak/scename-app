// pages/api/generate.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nickname, age, gender, answers } = req.body;

  const readerName = nickname || "あなた";
  const readerGender = gender;

  const targetGender =
    gender === "男性" ? "女性" :
    gender === "女性" ? "男性" :
    "異性";

  const targetName = "相手";

  const prompt = `
あなたは恋愛シナリオ生成AIです。

プロジェクト「ScenaMe（シナミー）」では、読者（＝${targetName}）が「${readerName}」という人物（${readerGender}）を口説くための理想的な恋愛ストーリーを体験します。

【対象人物（＝口説かれる側）】
名前：${readerName}
年代：${age}
性別：${readerGender}
呼称：${readerName}

【読者（＝シナリオを進める異性）】
性別：${targetGender}
呼称：あなた

【${readerName}の恋愛傾向（設問の回答）】
${answers.map((a, i) => `Q${i + 1}: ${a.join(" / ")}`).join("\n")}

---

【目的】
読者（＝あなた）が、${readerName}との自然な恋愛の進展を追体験するためのストーリーを生成します。最終的に惹かれ合うかどうかは、読者の受け答え次第です。

---

【ストーリー構成】

タイトルは以下の形式で**必ず1行で記載**してください。改行や空行は禁止です（後工程で抽出するため）：

【タイトル】〇〇〇（情景や関係性が連想されるもの）

Scene 1｜◯◯◯（初対面や出会いのきっかけ）  
Scene 2｜  
Scene 3｜  
Scene 4｜  
Scene 5｜（最も関係性が深まる、または転機）

※Sceneごとに進展がある構成にしてください。

---

【Sceneごとの要件】
- ${readerName}と“あなた”の自然な会話を中心に構成（セリフ主体）
- 出会い〜親密さが増す段階的な関係性の流れを描く
- 各Sceneに質問形式の会話を含め、以下のような構成にしてください：

Qn. ${readerName}が「〜」と言ってきたとき、あなたはどう返す？

1. ◯◯◯  
2. ◯◯◯  
3. ◯◯◯

※選択肢ごとに性格や価値観が現れるように

---

【タイトルの命名ルール】
- 各Sceneのタイトルは "Scene X｜〜" の形式
- 被り禁止／テンプレ禁止（例：「LINEのやりとり」「休日のカフェ」などはNG）
- 例：
  - Scene 1｜コーヒーに溶けた沈黙  
  - Scene 2｜答えを濁したその笑顔  
  - Scene 3｜ふざけてるようで本気だった

---

【文体・トーン】
- 一貫して“あなた”視点で描写（読者が相手にアプローチする形）
- 全体で口調・距離感・性格設定をブレさせない
- 現代日本のリアルな恋愛テンポ・感情・空気感をベースに
- 文字数はSceneごとに500〜700文字程度、セリフ中心でテンポよく
- 最終的な告白・心の通い合いなどは**最終Sceneで自然に**

---

【禁止事項】
- 「${readerName}は○○が好き」「この人は〜な性格」などメタ情報の提示
- 性格分析的な説明口調（例：「〜という性格だから、〜した」など）
- テンプレ会話や機械的な口調
- シーンタイトルや内容の繰り返し

---

これらをふまえ、読者が自然に惹かれるような全5シーンの恋愛ストーリーを生成してください。
  `.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
    });

    const story = completion.choices[0].message.content;
    res.status(200).json({ result: story });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.status(500).json({ error: "Failed to generate story" });
  }
}
