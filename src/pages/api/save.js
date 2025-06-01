// src/pages/api/save.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const data = req.body;
  const dir = path.join(process.cwd(), "data");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const filePath = path.join(dir, `${data.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

  return res.status(200).json({ message: "Saved", path: `/data/${data.id}.json` });
}
