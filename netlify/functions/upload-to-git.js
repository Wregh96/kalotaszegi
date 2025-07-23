const { writeFileSync, existsSync, mkdirSync } = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // Netlify Functions-ban az event.body alapból base64-enkódelt lehet, ha formData-t küldesz, nem lesz egyszerű
    // Ezért az egyszerűség kedvéért multipart/form-data feldolgozáshoz használj 'busboy' vagy 'formidable' csomagot.
    // Netlify Functions korlátozása miatt nem telepíthetünk egyszerűen csomagokat.
    // Így itt egy nagyon egyszerű, "hacky" megoldás csak a fájlnevet és fájl tartalmat várja JSON-ban base64-ben.

    const data = JSON.parse(event.body);
    const { filename, contentBase64 } = data;

    if (!filename || !contentBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing filename or content' }) };
    }

    // Írd ki a fájlt az uploads mappába
    const uploadsDir = path.resolve(__dirname, '../../uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir);
    }

    const filePath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(contentBase64, 'base64');
    writeFileSync(filePath, buffer);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'File uploaded successfully', path: `/uploads/${filename}` }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
