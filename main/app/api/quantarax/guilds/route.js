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

export async function GET() {
    try {
        const data = await kget("quantarax_guilds");
        return Response.json(data ? JSON.parse(data) : []);
    } catch (error) {
        return Response.json([], { status: 200 });
    }
}
