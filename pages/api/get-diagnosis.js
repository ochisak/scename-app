import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "診断IDが指定されていません" });
  }

  try {
    const { data, error } = await supabase
      .from("diagnoses")
      .select("diagnosis, responder_name, reader_name, title")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.warn("診断が見つかりません:", error);
      return res.status(404).json({ error: "診断が見つかりませんでした" });
    }

    return res.status(200).json({
      diagnosis: data.diagnosis,
      responderName: data.responder_name,
      readerName: data.reader_name,
      title: data.title || null,
    });
  } catch (err) {
    console.error("診断取得エラー:", err);
    return res.status(500).json({ error: "診断の取得に失敗しました" });
  }
}
