const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER;
const GITHUB_REPO_NAME = process.env.GITHUB_REPO_NAME;
const GITHUB_API_URL = `https://api.github.com/repos/LsAppunti/LsAppunti.github.io/contents/`;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);  // Create uploads folder if not exists
}

const cors = require('cors');
app.use(cors({
  origin: '*'  // Allow all origins for testing purposes, but you can restrict to your GitHub Pages URL later
}));

app.use(bodyParser.json({ limit: '10mb' }));

app.post('/upload-photo', async (req, res) => {
  const { image } = req.body;
  const base64Data = image.replace(/^data:image\/png;base64,/, '');

  // Define file path where you will temporarily store the image
  const filePath = path.join(uploadDir, 'photo.png');

  // Write the Base64 image data to a file
  fs.writeFileSync(filePath, base64Data, 'base64');

  try {
    // Read the file and prepare for upload
    const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });

    // Prepare the payload to push to GitHub
    const payload = {
      message: 'Upload captured photo',
      content: fileContent,
      path: 'photos/photo.png',  // Path in the repo where the image will be stored
      branch: 'main',            // Branch to commit to
    };

    // Push the file to GitHub via GitHub API
    const response = await axios.put(`${GITHUB_API_URL}photos/photo.png`, payload, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
      }
    });

    console.log('Image successfully pushed to GitHub:', response.data);

    // Optionally remove the temporary file after uploading
    fs.unlinkSync(filePath);

    res.status(200).json({ success: true, message: 'Image uploaded to GitHub successfully' });
  } catch (error) {
    console.error('Error uploading image to GitHub:', error.response || error.message || error);
    res.status(500).json({ success: false, message: 'Failed to upload image to GitHub' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
