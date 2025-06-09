import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    scenarioId,
    story,
    readerName,
    responses,
    responderName,
    responderAge,
    responderGender,
  } = req.body;

  const id = uuidv4();
  const safeResponses = Array.isArray(responses) ? responses : [];

  if (!scenarioId || !story || safeResponses.length === 0) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const responseTexts = safeResponses
  .map((r, i) => {
    if (r.free)
      return `Scene ${i + 1}：自由回答 → 「${r.free}」`;
    if (typeof r.selected === "number")
      return `Scene ${i + 1}：選択肢${r.selected + 1}`;
    return `Scene ${i + 1}：未回答`;
  })
  .join("\n");


  const prompt = `
あなたは恋愛診断AIです。

以下のストーリー（全5シーン）に対して、回答者が選んだ回答をもとに、診断コメントと攻略度を生成してください。

【ストーリーの主人公（＝落とされる側）】${readerName}  
【回答者（＝アプローチ側）】${responderName}（${responderAge}・${responderGender}）

---  
【ストーリー（変更・要約禁止）】  
${story}  

---  
【回答（各Sceneでの発言）】  
${responseTexts}  

---  
【出力フォーマット】
以下の形式で**絶対に変更せず**出力してください：

# 🧠 攻略診断：${responderName}（${responderAge}・${responderGender}） × ${readerName}

### タイトル：
**（情景や関係性が伝わるユニークなタイトル）**

---

## 【Scene 1〜5｜描写＋診断】

各Sceneごとに以下を追加してください（描写は元ストーリーのまま）：

---

## 【Scene X｜（Sceneタイトルそのまま）】

（描写もそのまま。※あなたはここに**一切手を加えてはいけません**）

> 回答者の発言: 「（回答内容を自然な口調で）」  
💬 **診断コメント：**  
- 回答のセリフが**シーンに対してどう作用したか**を、恋愛観の観点から鋭く、少し面白く分析  
- 「ズレた」「惜しい」「一歩踏み出せてる」など感情表現もOK
- 回答のセリフに対し、恋愛観の視点からツッコミを交えた分析
- ユーモアや比喩、軽妙な言葉選びを使って、読者がクスッと笑えるように
- 必ずどこかに"意外性"や"クセ"のある指摘を含めること

🎯 **攻略度：★☆☆☆☆ ～ ★★★★★** ※厳しめの採点でもOK

---

## 🎯最終攻略診断：**XX％（一言で総括）**

### 🔍講評まとめ：
- 回答内容から読み取れる**最適な3項目**を自動でラベル付けし、それぞれ★評価（1〜5）してください。
- 固定項目にせず、「表現センス」「包容力」「読み合い力」など、文脈に応じた評価軸を命名し出力すること。

📝 総評（300文字以内）：
全体としてどこが良かったか、何が足りなかったかを端的に分析し、面白みのある文章で仕上げてください。  
笑いのセンス・共感力・言葉選びなどを通じて、恋愛観のマッチ度を見抜くこと。

アドバイス：
―このストーリーの主人公（${readerName}）を落とすにはどうしたらいいか、1〜2点だけ的確に伝えてください。  
―なぜなら、主人公は「〜」という価値観や傾向を持っていると読み取れるからです。

💡次はあなたが誰かを落としてみる番。  
#シナミー
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
    });

    const diagnosis = completion.choices?.[0]?.message?.content?.trim();

    if (!diagnosis) {
      throw new Error("診断結果が空です");
    }

    const { error } = await supabase.from("diagnoses").insert([
      {
        id,
        scenario_id: scenarioId,
        story,
        reader_name: readerName ?? null,
        responder_name: responderName ?? null,
        responder_age: responderAge ?? null,
        responder_gender: responderGender ?? null,
        responses: safeResponses,
        diagnosis,
      },
    ]);

    if (error) {
      console.error("❌ Supabase保存エラー:", error);
      return res.status(500).json({ error: "診断の保存に失敗しました" });
    }

    res.status(200).json({ result: diagnosis, id });
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    res.status(500).json({ error: "診断の生成に失敗しました" });
  }
}
