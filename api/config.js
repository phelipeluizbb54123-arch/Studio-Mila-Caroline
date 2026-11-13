
export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Método não permitido"
    });
  }

  const url = process.env.SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return res.status(500).json({
      error: "Configuração indisponível"
    });
  }

  res.setHeader("Cache-Control", "no-store");

  return res.status(200).json({
    url,
    publishableKey
  });
}

