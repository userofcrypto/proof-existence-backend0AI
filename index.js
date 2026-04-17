const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const crypto = require("crypto");

function createHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

app.post("/upload", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
  }

  const hash = createHash(content);

  const { data, error } = await supabase
    .from("records")
    .insert([{ hash }])
    .select();

  if (error) {
    return res.status(500).json({ error });
  }

  res.json({
    message: "Stored successfully",
    record: data[0]
  });
});

app.post("/verify", async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
  }

  const hash = createHash(content);

  const { data, error } = await supabase
    .from("records")
    .select("*")
    .eq("hash", hash);

  if (error) {
    return res.status(500).json({ error });
  }

  res.json({
    verified: data.length > 0,
    record: data[0] || null
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
