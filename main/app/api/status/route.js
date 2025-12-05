export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const value = searchParams.get("meta");
  function formAct(acts) {
    return acts.map((act) => ({
      name: act.name,
      details: act.details,
      state: act.state,
      type: act.type,
      for: act.timestamps
        ? Math.floor((Date.now() - act.timestamps.start) / 1000)
        : null,
      assets: act.assets || null,
      emoji: act.emoji?.name || null,
    }));
  }

  const discordUserId = "888954248199549030";
  const slackUserId = "U08LQFRBL6S";
  const slackToken = process.env.SLACK_BOT_TOKEN;

  let discordStatus = "offline";
  let slackStatus = "offline";
  let meta = { discord: {}, slack: {}, time: new Date().toISOString() };

  try {
    let r = [
      fetch(`https://api.lanyard.rest/v1/users/${discordUserId}`),
      fetch(`https://slack.com/api/users.getPresence?user=${slackUserId}`, {
        headers: { Authorization: `Bearer ${slackToken}` },
      }),
      fetch(`https://slack.com/api/dnd.info?user=${slackUserId}`, {
        headers: { Authorization: `Bearer ${slackToken}` },
      }),
    ];
    if (value !== null)
      r.push(
        fetch(`https://slack.com/api/users.info?user=${slackUserId}`, {
          headers: { Authorization: `Bearer ${slackToken}` },
        })
      );
    const [discordRes, presenceRes, dndRes, userRes] = await Promise.all(r);

    const discordJson = await discordRes.json();
    if (discordJson?.data?.discord_status) {
      discordStatus = discordJson.data.discord_status;
      meta.discord.name = discordJson.data.discord_user.display_name;
      meta.discord.avatar = `https://cdn.discordapp.com/avatars/${discordUserId}/${discordJson.data.discord_user.avatar}.png`;
      meta.discord.activities = formAct(discordJson.data.activities);
      meta.discord.tag = discordJson.data.discord_user?.primary_guild?.tag;
      meta.discord.platform =
        Object.entries(discordJson.data)
          .filter(([k]) => k.startsWith("active_on_discord_"))
          .filter(([_, v]) => v)
          .map(([k]) => k.replace("active_on_discord_", ""))
          .join(", ") || null;
    }

    const presenceJson = await presenceRes.json();
    const isActive = presenceJson?.presence === "active";
    if (value !== null) {
      const userJson = await userRes.json();
      meta.slack.name = userJson?.user?.profile?.real_name;
      meta.slack.avatar = userJson?.user?.profile?.image_192;
      meta.slack.tz = userJson?.user?.tz;
      meta.slack.pfp = userJson?.user?.profile?.image_original;
      meta.slack.title = userJson?.user?.profile?.title;
      meta.slack.pronouns = userJson?.user?.profile?.pronouns;
      meta.slack.status_text = userJson?.user?.profile?.status_text;
      meta.slack.status_emoji = userJson?.user?.profile?.status_emoji;
    }

    const dndJson = await dndRes.json();
    const isDnd = dndJson?.dnd_enabled;
    if (isDnd && isActive) slackStatus = "idle";
    else if (isDnd && !isActive) slackStatus = "offline";
    else if (!isDnd && isActive) slackStatus = "online";
    else slackStatus = "offline";
  } catch (e) {
    console.error("Check failed", e);
  }
  let res = { discord: discordStatus, slack: slackStatus };
  if (res.discord === "offline")
    meta.discord = {
      ...meta.discord,
      activities: [
        {
          name: "Custom Status",
          state: "Offline :>",
          type: 4,
          emoji: "😴",
        },
      ],
    };
  if (value !== null) res.meta = meta;
  return new Response(JSON.stringify(res), {
    headers: { "Content-Type": "application/json" },
  });
}
