# Morehouse College Business Association Website

A modern, responsive website for the Morehouse College Business Association featuring professional design, navigation, hero section, about us, features, team members, upcoming events, and contact information.

## Features

- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Modern UI**: Clean and professional interface with smooth animations
- **Navigation**: Fixed header navigation with mobile hamburger menu
- **Hero Section**: Eye-catching landing section with call-to-action
- **About Section**: Information about the organization with key statistics
- **Features**: Showcase of services and offerings
- **Team Section**: Display of leadership team members
- **Events Section**: Upcoming events with dates and times
- **Contact Section**: Contact form and information
- **Smooth Scrolling**: Smooth scroll behavior for navigation links

## File Structure

```
morehouse-business-association/
├── index.html      # Main HTML file
├── styles.css      # Styling and responsive design
├── script.js       # JavaScript functionality
└── README.md       # Project documentation
```

## Getting Started

1. **Install dependencies**: Run `npm install` to install server dependencies
2. **Run dev server**: Run `npm run dev` (this starts an Express server at `http://localhost:8000`)
3. **Open the project**: Visit `http://localhost:8000` in your browser

## Customization

### Colors
Edit the color variables in `styles.css`:
- `--primary-color`: Main brand color (default: #b90000)
- `--secondary-color`: Secondary brand color (default: #003366)
- `--accent-color`: Accent color (default: #ffd700)

### Content
- Update team members in the Team section
- Edit events in the Events section
- Modify contact information in the Contact section
- Update company information throughout

### Images
Replace placeholder gradient backgrounds with actual images:
- Update `.member-image` backgrounds in the Team section
- Add a background image to the `.hero-background` element

## Responsive Breakpoints

- **Desktop**: 1200px and above
- **Tablet**: 768px to 1199px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Features Implemented

✅ Fixed Navigation Bar with Logo
✅ Mobile Responsive Hamburger Menu
✅ Hero Section with CTA Button
✅ About Section with Statistics
✅ Features Grid with 6 feature cards
✅ Team Members Section
✅ Upcoming Events Section
✅ Contact Form with Validation
✅ Contact Information
✅ Social Media Links
✅ Smooth Scrolling Navigation
✅ Scroll Animations
✅ Footer with Copyright

## Notes

- The contact form currently shows an alert on submission. To enable email functionality, integrate with a backend service or email API.
- Replace placeholder team member images with actual photos
- Update all contact information with actual details
- Customize social media links with actual URLs

### Calendar and member events

- A calendar is integrated using FullCalendar. Events are stored in `events.json` on the server.
- To allow MBA members to add/delete events, use the API endpoints:
	- `GET /api/events` — public, returns all events
	- `POST /api/events` — requires `x-api-key` header, adds an event
	- `DELETE /api/events/:id` — requires `x-api-key` header, deletes an event

Set the admin API key by exporting `API_KEY` before running the server, for example:

```bash
export API_KEY="your-secret-mba-key"
npm run dev
```

If you don't set `API_KEY`, the default is `change-me-mba-key` (change this before production).

The calendar's "Add Event (Members)" button asks for the API key and event details, then posts to the API. This is a minimal approach; for production use, implement proper member authentication and secure storage.

Note: The project now includes a simple admin login page at `/admin.html`.

- To create an admin user (for testing), set env vars before running the server:
 - To create an admin user (for testing), copy `.env.example` to `.env` and edit the credentials:

```bash
cp .env.example .env
# edit .env and set ADMIN_USER and ADMIN_PASS to your shared credentials
npm install
npm run dev
```

 - Visit `http://localhost:8000/admin.html` to log in and manage events. The login returns a temporary token stored in your browser's `localStorage` and used for add/delete requests. Use the single shared username/password from your `.env` file for all admins.

This simple login is suitable for local testing only. For production, replace it with secure authentication (SSO/OAuth) and store secrets securely.

## Future Enhancements

- Add actual image uploads for team members
- Integrate with email service for contact form
- Add event registration functionality
- Implement member login system
- Add blog/news section
- Add gallery section
- Integrate with calendar API

---

Created for Morehouse College Business Association
# MBA-Website
