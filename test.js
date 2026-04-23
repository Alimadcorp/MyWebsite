async function latestCommit() {
  const res = await fetch("https://api.github.com/users/Alimadcorp/events/public");
  const events = await res.json();
  const push = events.find(e => e.type === "PushEvent");
  if (!push) return null;
  const repo = push.repo.name;
  const sha = push.payload.head;
  const commitRes = await fetch(`https://api.github.com/repos/${repo}/commits/${sha}`);
  const commitData = await commitRes.json();
  return {
    message: commitData.commit.message,
    time: commitData.commit.author.date,
    repo
  };
}

latestCommit().then(console.log);