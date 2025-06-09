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

  console.log("Received request body:", req.body); // デバッグログ

  // 🔍 タイトル抽出処理（本文から）
  const titleMatch = story?.match(/【タイトル】["「]?(.*?)["」]?\n?/);
  const title = titleMatch ? titleMatch[1].trim() : null;

  if (!id || !title || !story || !readerName) {
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
