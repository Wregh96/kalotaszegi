const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  const boundary = event.headers['content-type'].split('boundary=')[1];
  const bodyBuffer = Buffer.from(event.body, 'base64');

  // egyszerű MIME parser, csak egy fájlhoz
  const parts = bodyBuffer
    .toString()
    .split(`--${boundary}`)
    .filter(part => part.includes('Content-Disposition') && part.includes('filename='));

  if (parts.length === 0) {
    return {
      statusCode: 400,
      body: 'No file uploaded',
    };
  }

  const match = parts[0].match(/filename="(.+)"/);
  const filename = match ? match[1] : `image_${Date.now()}.jpg`;
  const fileContent = parts[0].split('\r\n\r\n')[1].split('\r\n')[0];
  const filePath = path.join(__dirname, '../../uploads', filename);

  fs.writeFileSync(filePath, fileContent, 'binary');

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'File uploaded successfully', filename }),
  };
};
