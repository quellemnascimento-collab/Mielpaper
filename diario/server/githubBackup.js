const GITHUB_API = 'https://api.github.com';

function isConfigured() {
  return Boolean(process.env.GITHUB_TOKEN && process.env.GITHUB_OWNER && process.env.GITHUB_REPO);
}

function backupPathFor(date) {
  const prefix = process.env.GITHUB_BACKUP_PATH || 'diario/backups';
  return `${prefix}/${date}.md`;
}

async function githubRequest(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });
  return res;
}

// Writes/overwrites a markdown backup file for a given diary date and
// returns whether it succeeded. Each save creates a new git commit, so the
// full edit history of that day is recoverable from the repo's commit log.
async function backupEntryToGithub(date, content) {
  if (!isConfigured()) {
    return { ok: false, skipped: true, error: 'GitHub backup não configurado (variáveis de ambiente ausentes).' };
  }

  const { GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = process.env;
  const branch = GITHUB_BRANCH || 'main';
  const filePath = backupPathFor(date);
  const contentsUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

  try {
    let sha;
    const existingRes = await githubRequest(`${contentsUrl}?ref=${branch}`);
    if (existingRes.status === 200) {
      const existing = await existingRes.json();
      sha = existing.sha;
    } else if (existingRes.status !== 404) {
      const errBody = await existingRes.text();
      return { ok: false, error: `Falha ao consultar backup existente (HTTP ${existingRes.status}): ${errBody}` };
    }

    const fileBody = `# Diário — ${date}\n\n${content}\n`;
    const base64Content = Buffer.from(fileBody, 'utf-8').toString('base64');

    const putRes = await githubRequest(contentsUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `Diário: backup da entrada de ${date}`,
        content: base64Content,
        branch,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!putRes.ok) {
      const errBody = await putRes.text();
      return { ok: false, error: `Falha ao salvar backup (HTTP ${putRes.status}): ${errBody}` };
    }

    const putJson = await putRes.json();
    return { ok: true, commit: putJson.commit && putJson.commit.sha };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { backupEntryToGithub, isConfigured };
