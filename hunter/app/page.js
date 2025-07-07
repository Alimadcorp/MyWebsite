"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { searchEmails } from "./actions";
import { motion } from "framer-motion";
import LiveStatus from "@/compnents/live";

export default function EmailSearchPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [searchId, setSearchId] = useState(null);
  const [newlyFetchedIds, setNewlyFetchedIds] = useState([]);

  const handleSearch = async (existingSearchId) => {
    if (!domain && !existingSearchId) return;

    setLoading(true);
    try {
      const response = await searchEmails(domain, existingSearchId);
      if (response.success && response.data) {
        const newIds = response.data.email_list.map((e) => e.email_anon_id);

        if (existingSearchId) {
          setResults((prev) =>
            prev
              ? {
                  ...response.data,
                  email_list: [...prev.email_list, ...response.data.email_list],
                }
              : response.data
          );
        } else {
          setResults(response.data);
        }

        setSearchId(response.data.meta.search_id);
        setNewlyFetchedIds(newIds);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (results?.meta.more_results && searchId) {
      handleSearch(searchId);
    }
  };

  useEffect(() => {
    if (newlyFetchedIds.length > 0) {
      const timeout = setTimeout(() => setNewlyFetchedIds([]), 1800);
      return () => clearTimeout(timeout);
    }
  }, [newlyFetchedIds]);

  return (
    <div className="min-h-screen bg-black text-white font-[family-name:var(--font-geist-sans)]">
      <div className="px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              placeholder="Enter domain (e.g. company.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="bg-black text-white placeholder-gray-500 pl-10 py-2 border-gray-600 border-2 outline-0 focus:border-gray-400 rounded-xl w-full transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {results && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* Render old emails without animation */}
              {results.email_list
                .filter(
                  (email) => !newlyFetchedIds.includes(email.email_anon_id)
                )
                .map((email) => (
                  <div
                    key={email.email_anon_id}
                    className={`transition-transform transform hover:opacity-100 opacity-90 cursor-pointer shadow-md ${
                      email.verification.status === "VALID"
                        ? "text-green-300"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="text-sm truncate">
                        {email.email.split("@")[0]}
                        <span className="opacity-60">
                          @{email.email.split("@")[1]}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Animate only the newly fetched emails with proper delay */}
              {results.email_list
                .filter((email) =>
                  newlyFetchedIds.includes(email.email_anon_id)
                )
                .map((email, i) => (
                  <motion.div
                    key={email.email_anon_id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.06,
                      duration: 0.3,
                      ease: "easeOut",
                    }}
                  >
                    <div
                      className={`transition-transform transform hover:opacity-100 opacity-90 cursor-pointer shadow-md ${
                        email.verification.status === "VALID"
                          ? "text-green-300"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="text-sm truncate">
                          {email.email.split("@")[0]}
                          <span className="opacity-60">
                            @{email.email.split("@")[1]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
            {results.meta.more_results && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-white hover:bg-grey-300 text-black px-6 py-2 rounded-xl cursor-pointer"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-gray-400 text-sm">
              Showing {results.email_list.length} of {results.meta.total_emails}{" "}
              results for{" "}
              <span className="text-white font-medium">
                {results.meta.domain}
              </span>
            </div>
          </>
        )}

        {loading && !results && (
          <div className="text-center py-20">
            <p className="text-gray-400">Searching...</p>
          </div>
        )}
        <center>
          <LiveStatus className="bottom-0 absolute mt-100" />
        </center>
      </div>
    </div>
  );
}
