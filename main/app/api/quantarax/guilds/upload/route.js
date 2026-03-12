export async function POST(req) {
    try {
        const auth = req.headers.get("Authorization");
        if (auth !== "fareedChachu") {
            return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file");
        const filename = formData.get("filename");

        if (!file || !filename) {
            return Response.json({ success: false, error: "Missing file or filename" }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return Response.json({ success: false, error: "File too large (max 5MB)" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uploadUrl = `https://up.alimad.co/f/quantarax/${encodeURIComponent(filename)}`;

        const response = await fetch(uploadUrl, {
            method: "PUT",
            headers: {
                "Authorization": "Basic MTIzNDU2OjEyMzQ1Ng==",
                "Content-Type": file.type || "application/octet-stream",
            },
            body: buffer,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return Response.json({ success: false, error: `WebDAV Error: ${errorText}` }, { status: response.status });
        }

        return Response.json({ success: true, url: uploadUrl });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const auth = req.headers.get("Authorization");
        if (auth !== "fareedChachu") {
            return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const filename = searchParams.get("filename");

        if (!filename) {
            return Response.json({ success: false, error: "Missing filename" }, { status: 400 });
        }

        const deleteUrl = `https://up.alimad.co/f/quantarax/${encodeURIComponent(filename)}`;
        const response = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
                "Authorization": "Basic MTIzNDU2OjEyMzQ1Ng=="
            },
        });

        if (!response.ok && response.status !== 404) {
            const errorText = await response.text();
            return Response.json({ success: false, error: `WebDAV Error: ${errorText}` }, { status: response.status });
        }

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const auth = req.headers.get("Authorization");
        if (auth !== "fareedChachu") {
            return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { oldFilename, newFilename } = await req.json();

        if (!oldFilename || !newFilename) {
            return Response.json({ success: false, error: "Missing parameters" }, { status: 400 });
        }

        const srcUrl = `https://up.alimad.co/f/quantarax/${encodeURIComponent(oldFilename)}`;
        const destUrl = `https://up.alimad.co/f/quantarax/${encodeURIComponent(newFilename)}`;

        const response = await fetch(srcUrl, {
            method: "MOVE",
            headers: {
                "Authorization": "Basic MTIzNDU2OjEyMzQ1Ng==",
                "Destination": destUrl,
                "Overwrite": "F"
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return Response.json({ success: false, error: `WebDAV Error: ${errorText}` }, { status: response.status });
        }

        return Response.json({ success: true, url: destUrl });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
