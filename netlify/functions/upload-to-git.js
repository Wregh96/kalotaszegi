const { Octokit } = require("@octokit/core");

exports.handler = async function(event) {
  const token = 'nfp_48CzP3YQaLp7LUFcDoBuaqzvtSnzsyLx7415'; // már beállítottad
  const siteID = '54aa93cb-eaf6-49b2-8852-cc0717597fc1';
  const octokit = new Octokit({ auth: token });

  const body = JSON.parse(event.body);
  const path = body.path || 'uploads/' + body.fileName;
  const content = body.content;

  try {
    await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner: 'YOUR_GITHUB_USERNAME',
      repo: 'YOUR_REPO_NAME',
      path: path,
      message: `Upload ${body.fileName}`,
      content: content
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ path: path })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
