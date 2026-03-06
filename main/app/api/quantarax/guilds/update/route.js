const KVDB_BUCKET = process.env.KVDB_BUCKET;

async function kset(key, value) {
    if (value === undefined || value === null) value = "";
    const res = await fetch(
        `${KVDB_BUCKET}/${encodeURIComponent(key)}`,
        {
            method: "PUT",
            headers: { "Content-Type": "text/plain" },
            body: String(value),
        }
    );
    if (!res.ok) throw new Error(`KVDB write fail: ${await res.text()}`);
    return true;
}

async function kget(key) {
    const res = await fetch(
        `${KVDB_BUCKET}/${encodeURIComponent(key)}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`KVDB read fail: ${await res.text()}`);
    return await res.text();
}

export async function POST(req) {
    try {
        const auth = req.headers.get("Authorization");
        if (auth !== "fareedChachu") {
            return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await kset("quantarax_guilds", JSON.stringify(body));
        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

