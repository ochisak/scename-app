// pages/api/save.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id, story, readerName } = req.body;

  // 🔒 バリデーション
  if (!id || !story || !readerName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { error } = await supabase
      .from('scenarios')
      .insert([{ id, story, nickname: readerName }]); // ← nickname にマッピング

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ message: "Saved" });
  } catch (e) {
    console.error("❌ Unexpected API Error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
