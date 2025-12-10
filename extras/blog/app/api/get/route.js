async function decryptAES(base64Data, password) {
  try {
    const buf = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const iv = buf.subarray(0, 12);
    const data = buf.subarray(12);

    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: enc.encode("alimad-salt"),
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return "Incorrect Password";
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const password = searchParams.get("password");
  if (!url) return new Response("Missing url parameter", { status: 400 });

  try {
    const res = await fetch(url);
    let body = await res.text();
    const headers = {};
    res.headers.forEach((v, k) => {
      if (k.toLowerCase() !== "content-encoding") headers[k] = v;
    });

    if(password){
      const newBody = await decryptAES(body, password);
      body = newBody;
    }

    return new Response(body, { status: res.status, headers });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
