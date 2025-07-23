// netlify/functions/upload.js
const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const boundary = event.headers['content-type'].split('boundary=')[1];
  const bodyBuffer = Buffer.from(event.body, 'base64');

  const parts = bodyBuffer
    .toString()
    .split(`--${boundary}`)
    .filter(part => part.includes('Content-Disposition'));

  const filePart = parts.find(part => part.includes('filename='));
  if (!filePart) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'No file found in request.' }),
    };
  }

  const filenameMatch = filePart.match(/filename="(.+?)"/);
  const filename = filenameMatch ? filenameMatch[1] : `image-${Date.now()}.jpg`;

  const fileData = filePart.split('\r\n\r\n')[1].split('\r\n')[0];
  const buffer = Buffer.from(fileData, 'binary');

  const filePath = path.join(__dirname, '..', '..', 'uploads', filename);
  fs.writeFileSync(filePath, buffer);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'File uploaded!', filename }),
  };
};
