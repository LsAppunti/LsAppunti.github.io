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

const uploadDir = path.join(__dirname, 'temp_photos'); // Change to 'temp_photos' folder for temporary storage
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);  // Create temp_photos folder if not exists
}

const cors = require('cors');
app.use(cors({
  origin: '*'  // Allow all origins for testing purposes, but you can restrict to your GitHub Pages URL later
}));

app.use(bodyParser.json({ limit: '10mb' }));

// Endpoint to upload the photo
app.post('/upload-photo', async (req, res) => {
  const { image, userId } = req.body;
  const base64Data = image.replace(/^data:image\/png;base64,/, '');

  // Define a unique file path for each user's photo, based on timestamp or userId
  const fileName = `photo_${userId || Date.now()}.png`; // Unique filename based on userId or timestamp
  const filePath = path.join(uploadDir, fileName);

  // Write the Base64 image data to a file
  try {
    fs.writeFileSync(filePath, base64Data, 'base64');
    console.log(`Photo uploaded for user ${userId} at ${filePath}`);
    res.status(200).json({ success: true, message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error writing the photo:', error);
    res.status(500).json({ success: false, message: 'Failed to save image' });
  }
});

// Endpoint for developer (you) to push all photos to GitHub
app.post('/push-photos-to-github', async (req, res) => {
  const files = fs.readdirSync(uploadDir);

  if (files.length === 0) {
    return res.status(400).json({ success: false, message: 'No photos to push' });
  }

  try {
    // Iterate through all photos in temp_photos and push each to GitHub
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const fileContent = fs.readFileSync(filePath, { encoding: 'base64' });

      // Prepare the payload to push to GitHub
      const payload = {
        message: `Upload captured photo: ${file}`,
        content: fileContent,
        path: `photos/${file}`,  // Save each file under 'photos' folder in GitHub
        branch: 'main',          // Branch to commit to
      };

      // Push the file to GitHub via GitHub API
      const response = await axios.put(`${GITHUB_API_URL}photos/${file}`, payload, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
        }
      });

      console.log(`Image ${file} successfully pushed to GitHub:`, response.data);

      // Optionally, remove the photo after pushing
      fs.unlinkSync(filePath);
    }

    res.status(200).json({ success: true, message: 'All photos pushed to GitHub successfully' });
  } catch (error) {
    console.error('Error pushing photos to GitHub:', error.response || error.message || error);
    res.status(500).json({ success: false, message: 'Failed to upload photos to GitHub' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
