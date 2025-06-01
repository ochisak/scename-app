// src/pages/api/load.js
import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing ID" });
  }

  const filePath = path.join(process.cwd(), "data", `${id}.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Data not found" });
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const json = JSON.parse(content);
  return res.status(200).json(json);
}
