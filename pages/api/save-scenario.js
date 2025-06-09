import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, story, readerName, age, gender } = req.body;

  console.log("📥 Received request body:", req.body);

  // 🔍 タイトル抽出（形式のゆらぎに対応）
  const titleMatch = story?.match(/(?:【タイトル】|タイトル[:：]?)\s*["「]?(.*?)["」]?\s*(?:\n|$)/i);
  const extractedTitle = titleMatch ? titleMatch[1].trim() : null;

  // ✅ fallback タイトル（ログに明示）
  const fallbackTitle = `タイトル未取得 - ${new Date().toISOString().split("T")[0]}`;
  const title = extractedTitle || fallbackTitle;

  console.log("🔍 Extracted or fallback title:", title);

  // ✅ 必須項目チェック（title は fallback で保証済）
  if (!id || !story || !readerName) {
    console.error("❌ Missing required fields", { id, storyExists: !!story, readerName });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("scenarios")
      .insert([
        {
          id,
          title,
          story,
          nickname: readerName,
          age,
          gender,
        },
      ]);

    if (error) {
      console.error("❌ Supabase保存エラー:", error.message);
      return res.status(500).json({ error: "Failed to save scenario" });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("❌ APIエラー:", err);
    return res.status(500).json({ error: "Unexpected error" });
  }
}
