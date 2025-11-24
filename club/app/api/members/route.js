// /app/api/fillout/route.js
export async function GET() {
  const r = await fetch(
    "https://api.fillout.com/v1/api/forms/dfzRTnVBJcus/submissions?sort=asc",
    {
      headers: {
        Authorization: `Bearer ${"sk_prod_rGotEXCSikUqwmACAMMUnedBQceNYOruImSTTN0vdfmSI6z9oOPC94sN6m6uWS3HTz1TAd29cY5ecWnlr03wgtLBzmh2GT1B1bu_35635"}`
      }
    }
  );

  let data = await r.json();
  data = transform(data);
  const format = { data, submissions: data.length, has_laptop: data.reduce((n, x) => n + (x.laptop ? 1 : 0), 0), has_experience: data.reduce((n, x) => n + (x.experience ? 1 : 0), 0) };
  return Response.json(format);
}

function transform(data) {
  return data.responses.map(r => {
    const map = Object.fromEntries(
      r.questions.map(q => [q.name, q.value])
    );

    const out = {
      first_name: map["First Name"].trim(),
      last_name: map["Last Name"].trim(),
      phone: map["WhatsApp number"],
      email: map["Email"],
      dob: map["Date of Birth"],
      roll: map["College roll number"],
      learn: map["What would you like to learn"],
      laptop: map["I have my own laptop that I can bring to workshops"] || false,
      experience: map["I have prior experience in programming"] || false,
      submissionTime: r.submissionTime,
      startedAt: r.startedAt,
      timeTaken: new Date(r.submissionTime) - new Date(r.startedAt)
    };

    return out;
  });
}
