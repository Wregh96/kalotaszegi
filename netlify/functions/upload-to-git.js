const { Octokit } = require("@octokit/rest");

exports.handler = async (event) => {
  const token = process.env.GITHUB_TOKEN;
  const repo = "kalotaszegi"; // Repo név
  const owner = "a-te-github-neved"; // GitHub felhasználóneved
  const path = "uploads/";
  const octokit = new Octokit({ auth: token });

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Csak POST kérés engedélyezett." })
    };
  }

  const contentType = event.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Hibás tartalomtípus.' })
    };
  }

  const busboy = require('busboy');
  const bb = busboy({ headers: event.headers });

  return new Promise((resolve, reject) => {
    let uploadFile;

    bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const chunks = [];
      file.on('data', data => chunks.push(data));
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const base64Content = buffer.toString('base64');

        octokit.repos.createOrUpdateFileContents({
          owner,
          repo,
          path: path + filename,
          message: `Kép feltöltése: ${filename}`,
          content: base64Content
        }).then(() => {
          resolve({
            statusCode: 200,
            body: JSON.stringify({ path: `${path}${filename}` })
          });
        }).catch(err => {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: err.message })
          });
        });
      });
    });

    bb.on('error', error => reject({ statusCode: 500, body: error.message }));
    bb.end(Buffer.from(event.body, 'base64'));
  });
};
