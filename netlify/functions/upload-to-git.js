const { Octokit } = require("@octokit/core");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { fileName, content, path } = JSON.parse(event.body);

    if (!fileName || !content || !path) {
      return { statusCode: 400, body: "Missing fileName, content or path" };
    }

    const owner = "GITHUB_FELHASZNALONEVED"; // Cseréld ki a GitHub felhasználódra
    const repo = "GITHUB_REPODNEVED";       // Cseréld ki a repo nevére
    const branch = "main";

    // Lekérdezzük, hogy létezik-e a fájl és megkapjuk a sha-t
    let sha = null;
    try {
      const getResponse = await octokit.request(
        "GET /repos/{owner}/{repo}/contents/{path}?ref={branch}",
        { owner, repo, path, branch }
      );
      sha = getResponse.data.sha;
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }
    }

    // Feltöltjük vagy frissítjük a fájlt
    const putResponse = await octokit.request(
      "PUT /repos/{owner}/{repo}/contents/{path}",
      {
        owner,
        repo,
        path,
        message: `Add/update file ${fileName}`,
        content,
        branch,
        sha: sha || undefined,
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "File uploaded",
        path,
        url: putResponse.data.content.download_url,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
