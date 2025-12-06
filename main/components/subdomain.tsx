"use client";

export default function Subdomain({ domainName = "domain", suffix = "", visited = false, live = false, data = { path: "/" } }) {
  function handleClick() {
    localStorage.setItem("visited_" + domainName, "true");
  }

  return (
    <a
      href={`https://${domainName}${suffix}${data.path}`}
      target="_blank"
      onClick={handleClick}
      className={`cursor-pointer text-left text-sm transition-all
        hover:text-gray-600 dark:hover:text-cyan-400
        ${live
          ? "text-gray-600 dark:text-lime-400 font-bold"
          : visited
            ? "text-gray-700 dark:text-green-400"
            : "text-black dark:text-white/80"
        }`}
    >
      {domainName}
      <span className="opacity-60 dark:opacity-40">{suffix}</span>
    </a>
  );
}