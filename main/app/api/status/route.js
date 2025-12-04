export async function GET() {
  const discordUserId = "888954248199549030";
  const slackUserId = "U08LQFRBL6S";
  const slackToken = "xoxb-2210535565-10039963183239-ZveOz00wDqFANq0bPKLK9Vjz";

  let discordStatus = "offline";
  let slackStatus = "offline";

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`);
    const json = await res.json();
    if (json?.data?.discord_status) discordStatus = json.data.discord_status;
  } catch (e) {
    console.error("Discord check failed", e);
  }

  // Slack
  try {
    const presenceRes = await fetch(`https://slack.com/api/users.getPresence?user=${slackUserId}`, {
      headers: { Authorization: `Bearer ${slackToken}` },
    });
    const presenceJson = await presenceRes.json();
    const isActive = presenceJson?.presence === "active";

    const dndRes = await fetch(`https://slack.com/api/dnd.info?user=${slackUserId}`, {
      headers: { Authorization: `Bearer ${slackToken}` },
    });
    const dndJson = await dndRes.json();
    console.log(dndJson)
    const isDnd = dndJson?.dnd_enabled;

    if (isDnd && isActive) slackStatus = "idle";
    else if (isDnd && !isActive) slackStatus = "offline";
    else if (!isDnd && isActive) slackStatus = "online";
    else slackStatus = "offline";
  } catch (e) {
    console.error("Slack check failed", e);
  }

  return new Response(
    JSON.stringify({ discord: discordStatus, slack: slackStatus }),
    { headers: { "Content-Type": "application/json" } }
  );
}
