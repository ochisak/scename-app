// pages/api/load.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing ID" });
  }

  try {
    const { data, error } = await supabase
      .from("scenarios")
      .select("id, title, story, nickname")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Supabase error:", error);
      return res.status(404).json({ error: "Scenario not found" });
    }

    return res.status(200).json(data);
  } catch (e) {
    console.error("API Error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
