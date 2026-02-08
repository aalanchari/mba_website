
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 8000;
const DATA_FILE = path.join(__dirname, 'events.json');
const API_KEY = process.env.API_KEY || 'MBAkey67';
// Admin credentials (use .env or environment variables)
const ADMIN_USER = process.env.ADMIN_USER || 'mbaadmin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'MBA67';

// JWT setup for admin sessions
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const multer = require('multer');

// Multer setup for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, 'images/uploads'));
    },
    filename: function (req, file, cb) {
      // Use timestamp + original name for uniqueness
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      cb(null, base + '-' + Date.now() + ext);
    }
  }),
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';


app.use(cors());
// Serve static files (frontend)
app.use(express.static(path.join(__dirname)));

// --- Student Spotlight Stories API ---
const { readSpotlight, writeSpotlight } = require('./spotlightData');

// Get all stories
app.get('/api/spotlight', (req, res) => {
  res.json(readSpotlight());
});

// Add a new story (admin only, with image upload)
app.post('/api/spotlight', upload.single('image'), (req, res) => {
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { name, title, story } = req.body || {};
  if (!name || !title || !story || !req.file) return res.status(400).json({ error: 'Missing fields' });
  const imagePath = 'images/uploads/' + req.file.filename;
  const stories = readSpotlight();
  const id = Date.now().toString();
  const newStory = { id, name, title, story, image: imagePath };
  stories.push(newStory);
  writeSpotlight(stories);
  res.status(201).json(newStory);
});

// Only parse JSON after file upload routes
app.use(bodyParser.json());

// Delete a story by id (admin only)
app.delete('/api/spotlight/:id', (req, res) => {
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  let stories = readSpotlight();
  const before = stories.length;
  stories = stories.filter(s => s.id !== id);
  if (stories.length === before) return res.status(404).json({ error: 'Story not found' });
  writeSpotlight(stories);
  res.json({ success: true });
});

// Helper to read/write events
function readEvents() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeEvents(events) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf8');
}

// API: Get events
app.get('/api/events', (req, res) => {
  const events = readEvents();
  res.json(events);
});

// API: Admin login - returns a JWT token
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  if (username !== ADMIN_USER || password !== ADMIN_PASS) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  const decoded = jwt.decode(token) || {};
  const expires = decoded.exp ? decoded.exp * 1000 : null;
  res.json({ token, expires });
});

// API: Admin logout - invalidates token
app.post('/api/logout', (req, res) => {
  // Stateless JWT: instruct client to remove token. Server does not track tokens.
  res.json({ success: true });
});

// Middleware/helper: check admin token or legacy API key
function isAuthorized(req) {
  const key = req.header('x-api-key');
  if (key && key === API_KEY) return true;
  const token = req.header('x-admin-token');
  if (!token) return false;
  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (err) {
    return false;
  }
}

// Mail transporter helper: uses SMTP env vars or sendmail if configured
function getMailTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const secure = process.env.SMTP_SECURE === 'true';
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port: port || 587,
      secure: !!secure,
      auth: { user, pass }
    });
  }
  if (process.env.USE_SENDMAIL === 'true') {
    return nodemailer.createTransport({ sendmail: true });
  }
  return null;
}

// Ensure headshots static folder exists
const HEADSHOT_DIR = path.join(__dirname, 'headshots');
if (!fs.existsSync(HEADSHOT_DIR)) fs.mkdirSync(HEADSHOT_DIR);

// Multer setup for headshot uploads
const headshotStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, HEADSHOT_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = Date.now() + '-' + (req.body.name || 'unknown').replace(/[^a-z0-9\-\.]/gi, '_');
    cb(null, base + ext);
  }
});
const headshotUpload = multer({ storage: headshotStorage, limits: { fileSize: 5 * 1024 * 1024 } });

// Serve headshots statically
app.use('/headshots', express.static(HEADSHOT_DIR));

// List headshots
app.get('/api/headshots', (req, res) => {
  try {
    const files = fs.readdirSync(HEADSHOT_DIR).filter(f => !f.startsWith('.'));
    const list = files.map(f => ({ name: f.replace(/^\d+-/, '').replace(path.extname(f), '').replace(/_/g, ' '), url: `/headshots/${encodeURIComponent(f)}` }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list headshots' });
  }
});

// Upload headshot
app.post('/api/headshots/upload', headshotUpload.single('headshot'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Missing file' });
  res.json({ success: true, message: 'Uploaded', file: `/headshots/${req.file.filename}` });
});

// API: Add event (requires API key header: x-api-key)
app.post('/api/events', (req, res) => {
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { title, start, end, allDay, description } = req.body;
  if (!title || !start) {
    return res.status(400).json({ error: 'Missing title or start' });
  }

  // Normalize date input: accept mm-dd-yyyy or mm/dd/yyyy and convert to ISO (or YYYY-MM-DD for all-day)
  function parseDateInput(input, allDayFlag) {
    if (!input) return null;
    const s = String(input).trim();
    // Match MM-DD-YYYY or MM/DD/YYYY optionally with time HH:MM
    const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[ T](\d{1,2}):?(\d{2}))?$/);
    if (m) {
      const month = parseInt(m[1], 10);
      const day = parseInt(m[2], 10);
      const year = parseInt(m[3], 10);
      const hour = parseInt(m[4] || '0', 10);
      const minute = parseInt(m[5] || '0', 10);
      if (allDayFlag) {
        return `${year.toString().padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      }
      const d = new Date(year, month - 1, day, hour, minute);
      if (isNaN(d.getTime())) return null;
      return d.toISOString();
    }

    // Fallback: try Date.parse on the input
    const parsed = Date.parse(s);
    if (!isNaN(parsed)) {
      if (allDayFlag) {
        const d = new Date(parsed);
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      }
      return new Date(parsed).toISOString();
    }
    return null;
  }

  const normStart = parseDateInput(start, !!allDay);
  const normEnd = parseDateInput(end, !!allDay);
  if (!normStart) return res.status(400).json({ error: 'Invalid start date format. Use MM-DD-YYYY or ISO format.' });

  const events = readEvents();
  const id = Date.now().toString();
  const newEvent = { id, title, start: normStart, end: normEnd || null, allDay: !!allDay, description: description || '' };
  events.push(newEvent);
  writeEvents(events);
  res.status(201).json(newEvent);
});

// API: Delete event by id (requires API key)
app.delete('/api/events/:id', (req, res) => {
  if (!isAuthorized(req)) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;
  let events = readEvents();
  const before = events.length;
  events = events.filter(e => e.id !== id);
  if (events.length === before) {
    return res.status(404).json({ error: 'Event not found' });
  }
  writeEvents(events);
  res.json({ success: true });
});

// API: Corporate/Investor contact form submissions
app.post('/api/corporate-contact', async (req, res) => {
  const { company, contactName, email, phone, type, message } = req.body || {};
  if (!company || !contactName || !email) {
    return res.status(400).json({ error: 'Missing required fields: company, contactName, or email' });
  }

  const payloadText = `Type: ${type || ''}\nCompany: ${company}\nContact: ${contactName}\nEmail: ${email}\nPhone: ${phone || ''}\n\nMessage:\n${message || ''}`;

  const transporter = getMailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `${contactName} <${email}>`,
        to: 'james.young1@morehouse.edu',
        subject: `MBA Submission — ${company}`,
        text: payloadText,
        html: `<pre>${payloadText.replace(/</g, '&lt;')}</pre>`
      });
      return res.json({ success: true });
    } catch (err) {
      console.error('Failed to send corporate contact email:', err);
      // fall through to local save below
    }
  }

  // Fallback: save submission to local JSON file
  try {
    const filePath = path.join(__dirname, 'corporate_submissions.json');
    let list = [];
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      list = JSON.parse(raw || '[]');
    } catch (e) {
      list = [];
    }
    const entry = { id: Date.now().toString(), company, contactName, email, phone: phone || '', type: type || '', message: message || '', received: new Date().toISOString() };
    list.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2), 'utf8');
    return res.json({ success: true, saved: true, message: 'Saved locally. Configure SMTP env to enable automatic emailing.' });
  } catch (err) {
    console.error('Failed to save corporate submission:', err);
    return res.status(500).json({ error: 'Failed to process submission' });
  }
});

// API: Engagement questionnaire submissions
app.post('/api/engagement', async (req, res) => {
  const { company, contactName, email, phone, engagementType, description } = req.body || {};
  if (!company || !contactName || !email) return res.status(400).json({ error: 'Missing required fields' });
  const entry = { id: Date.now().toString(), company, contactName, email, phone: phone || '', engagementType: engagementType || '', description: description || '', received: new Date().toISOString() };

  // try to email
  const transporter = getMailTransporter();
  const payload = `Company: ${company}\nContact: ${contactName}\nEmail: ${email}\nPhone: ${phone || ''}\nType: ${engagementType || ''}\n\n${description || ''}`;
  if (transporter) {
    try {
      await transporter.sendMail({ from: `${contactName} <${email}>`, to: 'james.young1@morehouse.edu', subject: `Engagement Questionnaire — ${company}`, text: payload });
      // save too
    } catch (err) {
      console.error('Email failed for engagement:', err.message);
    }
  }

  try {
    const filePath = path.join(__dirname, 'engagement_submissions.json');
    let arr = [];
    try { arr = JSON.parse(fs.readFileSync(filePath, 'utf8') || '[]'); } catch(e){ arr = []; }
    arr.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
    return res.json({ success: true, message: 'Questionnaire submitted.' });
  } catch (err) {
    console.error('Failed to save engagement submission:', err.message);
    return res.status(500).json({ error: 'Failed to save submission' });
  }
});

// Fallback
app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API key: ${API_KEY} (set via API_KEY env var)`);
});
