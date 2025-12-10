"use client";
import { useState } from "react";

async function getKey(password) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("alimad-salt"),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
}

async function encryptText(plainText, password) {
  const enc = new TextEncoder();
  const key = await getKey(password);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plainText)
  );
  const buffer = new Uint8Array(iv.byteLength + encrypted.byteLength);
  buffer.set(iv, 0);
  buffer.set(new Uint8Array(encrypted), iv.byteLength);
  return bufferToBase64(buffer);
}

function bufferToBase64(buf) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < buf.length; i += chunkSize) {
    const chunk = buf.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

export default function EncryptPage() {
  const [password, setPassword] = useState("");
  const [text, setText] = useState("");

  async function handleEncrypt(inputText, filename = "encrypted.txt") {
    if (!inputText || !password) return alert("Enter text and password");
    const encrypted = await encryptText(inputText, password);
    const blob = new Blob([encrypted], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const content = await file.text();
    handleEncrypt(content, file.name.replace(".txt", "") + ".enc.txt");
  }

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold">Encrypt TXT</h1>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border rounded px-3 py-2 w-full"
      />
      <textarea
        placeholder="Paste text here..."
        value={text}
        onChange={e => setText(e.target.value)}
        className="border rounded px-3 py-2 w-full h-32"
      />
      <button
        onClick={() => handleEncrypt(text)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Encrypt Pasted Text
      </button>
      <input
        type="file"
        accept=".txt"
        onChange={handleFile}
        className="border p-2 w-full"
      />
    </div>
  );
}
