// src/pages/api/save.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const { id, story, readerName } = req.body;

  const { error } = await supabase
    .from('scenarios')
    .insert([{ id, story, readerName }]);

  if (error) return res.status(500).json({ error: error.message });

  return res.status(200).json({ message: "Saved" });
}
