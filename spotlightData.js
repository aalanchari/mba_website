const path = require('path');
const fs = require('fs');

const SPOTLIGHT_FILE = path.join(__dirname, 'spotlight-stories.json');

function readSpotlight() {
  try {
    const raw = fs.readFileSync(SPOTLIGHT_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeSpotlight(stories) {
  fs.writeFileSync(SPOTLIGHT_FILE, JSON.stringify(stories, null, 2), 'utf8');
}

module.exports = { readSpotlight, writeSpotlight };
