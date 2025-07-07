"use client"
export default function Subdomain({ domainName = "domain", visited = false, live=false, data = { path: "/" } }) {
    function handleClick() {
        localStorage.setItem("visited_" + domainName, "true")
    }
    return (
        <a
            href={`https://${domainName}.alimad.xyz${data.path}`}
            target="_blank"
            onClick={handleClick}
            className={`cursor-pointer text-left hover:text-cyan-500 text-sm transition-all ${live ? "text-lime-400 font-bold" : (visited ? "text-green-400" : "")}`}
        >
            {domainName}<span className="opacity-50">.alimad.xyz</span>
        </a>
    )
}
