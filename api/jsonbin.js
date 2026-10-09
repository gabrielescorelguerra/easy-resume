const JSONBIN_API = "https://api.jsonbin.io/v3/b";

export default async function handler(request, response) {
  if (request.method !== "GET" && request.method !== "PUT") {
    response.setHeader("Allow", "GET, PUT");
    return response.status(405).json({ error: "Método não permitido" });
  }

  const binId = String(process.env.JSONBIN_BIN_ID || "").trim();
  const accessKey = String(process.env.JSONBIN_ACCESS_KEY || "").trim();
  const masterKey = String(process.env.JSONBIN_MASTER_KEY || "").trim();

  if (!binId || (!accessKey && !masterKey)) {
    return response.status(500).json({
      error:
        "JSONBIN_BIN_ID e uma chave JSONBin (JSONBIN_ACCESS_KEY ou JSONBIN_MASTER_KEY) são necessárias",
    });
  }

  const url = `${JSONBIN_API}/${encodeURIComponent(binId)}${
    request.method === "GET" ? "/latest" : ""
  }`;
  const headers = {};
  if (accessKey) headers["X-Access-Key"] = accessKey;
  if (masterKey) headers["X-Master-Key"] = masterKey;
  const options = { method: request.method, headers };

  if (request.method === "PUT") {
    headers["Content-Type"] = "application/json";
    options.body =
      typeof request.body === "string" ? request.body : JSON.stringify(request.body);
  }

  try {
    const upstream = await fetch(url, options);
    const body = await upstream.text();
    response.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json",
    );
    return response.status(upstream.status).send(body);
  } catch (error) {
    console.error("Erro ao comunicar com JSONBin:", error);
    return response.status(502).json({
      error: "Falha ao comunicar com JSONBin",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}
