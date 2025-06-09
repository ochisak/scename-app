import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const {
    scenarioId,
    responderName,
    responderAge,
    responderGender,
    responses,
    diagnosis,
    readerName,
    story,
  } = req.body;

  console.log("🔍 API入力確認", {
    scenarioId,
    responderName,
    responderAge,
    responderGender,
    diagnosis,
    readerName,
    story,
  });

  // 必須フィールドチェック
  if (!scenarioId || !diagnosis || !responses) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Supabase挿入処理
  const { data, error } = await supabase
    .from("diagnoses")
    .insert([
      {
        scenario_id: scenarioId,
        responder_name: responderName ?? null,
        responder_age: responderAge ?? null,
        responder_gender: responderGender ?? null,
        responses,
        diagnosis,
        reader_name: readerName ?? null,
        story: story ?? null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ Supabase Insert Error:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ diagnosisId: data.id });
}
