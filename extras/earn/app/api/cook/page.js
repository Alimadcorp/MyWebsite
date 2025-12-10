"use client";
import { useEffect } from "react";

export default function CookieMessenger() {
  useEffect(() => {
    try {
      if (window.parent) {
        let id = localStorage.getItem("clientId");
        if (!id) {
          id = Array.from({ length: 4 }, () =>
            String.fromCharCode(65 + Math.floor(Math.random() * 26))
          ).join("");
          localStorage.setItem("clientId", id);
        }
        window.parent.postMessage(id, "*");
      }
    } catch (err) {
      console.error("Error posting cookie:", err);
    }
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-gray-400 text-sm">
      Ready to deliver
    </div>
  );
}
