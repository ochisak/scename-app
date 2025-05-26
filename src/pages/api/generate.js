import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nickname, age, gender, answers } = req.body;

  // 読者＝設問に答えた人
  const readerName = nickname || "あなた";
  const readerGender = gender;

  // 異性のキャラを相手とする
  const targetGender =
    gender === "男性" ? "女性" :
    gender === "女性" ? "男性" :
    "異性";

  const targetName = "相手";

  const prompt = `
あなたは恋愛シナリオ生成AIです。

このプロジェクトは「ScenaMe（シナミー）」と呼ばれ、読者（＝${targetName}）が設問に答えた「${readerName}」という人物（${readerGender}）を口説くための、理想的な関係構築の恋愛シナリオ（全5シーン構成）を生成するものです。

【対象人物（＝口説かれる側）】
名前：${readerName}
年代：${age}
性別：${readerGender}
呼称：${readerName}

【読者（＝シナリオで口説く異性）】
性別：${targetGender}
呼称：あなた

【${readerName}の恋愛傾向（診断結果）】
${answers.map((a, i) => `Q${i + 1}: ${a.join(" / ")}`).join("\n")}

---

【出力フォーマット】
タイトル：○○○（短く、情景や関係性が連想されるもの）

Scene 1｜シチュエーション説明＋やり取り
Scene 2｜
Scene 3｜
Scene 4｜
Scene 5｜

各Sceneには以下を必ず含めてください：
- ${readerName}と"あなた"（読者）の出会いや関係の進展
- 日常的なシーンでの自然な会話（例：カフェ、居酒屋、LINE、公園、偶然の再会など）
- ${readerName}が「〜」と問いかけてくるセリフ
- それに対する選択肢：
Qn. ${readerName}が「〜」と言ってきたとき、あなたはどう返す？
1. ○○○
2. ○○○
3. ○○○
4. フリーワードで答える

【条件】
- ストーリー視点は常に“あなた”（読者）に統一
- ${readerName}（${readerGender}）は一貫して異性として描写
- セリフは誰が発したかを明示し、口調・文体を統一
- ストーリーには軽さと真剣さのバランス、感情の変化、余白を持たせること

【NG】
- 「あなたは〜です」など説明的な性格解説
- 口調のブレや曖昧な設定
- シーンタイトルは必ず "Scene X｜〜" の形式

以上をふまえ、読者（＝あなた）が、${readerName}を自然に惹きつける全5シーンの恋愛シナリオを生成してください。
`;

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
