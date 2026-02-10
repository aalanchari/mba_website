
document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Dropdown menu toggle
    const dropdown = document.querySelector('.dropdown');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    if (dropdown && dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && dropdown.classList.contains('open')) {
                dropdown.classList.remove('open');
            }
        });
        dropdownToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropdown.classList.toggle('open');
            }
        });
    }

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.querySelector('input[type="text"]');
            const email = contactForm.querySelector('input[type="email"]');
            const message = contactForm.querySelector('textarea');
            if (name && email && message && name.value && email.value && message.value) {
                alert('Thank you for your message! We will get back to you soon.');
                contactForm.reset();
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Navbar background color on scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            } else {
                navbar.style.boxShadow = 'var(--shadow)';
            }
        });
    }

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    document.querySelectorAll('.feature-card, .team-member, .event-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });

    // Active nav link styling based on scroll position
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.style.color = 'var(--accent-color)';
            } else {
                link.style.color = 'var(--white)';
            }
        });
    });

    // Dynamic year in footer
    const footer = document.querySelector('.footer');
    if (footer) {
        const currentYear = new Date().getFullYear();
        footer.textContent = `© ${currentYear} Morehouse Business Association. All rights reserved.`;
    }

    // ===== Calendar integration (FullCalendar) =====
    const calendarEl = document.getElementById('calendar');
    if (calendarEl && typeof FullCalendar !== 'undefined') {
        const calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: 650,
            headerToolbar: {
                left: 'prev,next today addEventButton',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },
            customButtons: {
                addEventButton: {
                    text: 'Add Event (Members)',
                    click: function() {
                        if (typeof openAdminAddEvent === 'function') {
                            openAdminAddEvent(calendar);
                        }
                    }
                }
            },
            events: function(info, successCallback, failureCallback) {
                if (window.API_EVENTS_ENABLED) {
                    fetch('/api/events')
                        .then(res => res.json())
                        .then(events => {
                            const fcEvents = events.map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end, allDay: e.allDay, description: e.description }));
                            successCallback(fcEvents);
                        })
                        .catch(err => failureCallback(err));
                } else {
                    // API disabled → return empty array, no network request
                    successCallback([]);
                }
            },
            eventContent: function(arg) {
                let title = arg.event.title;
                let location = arg.event.extendedProps && arg.event.extendedProps.description;
                let html = title;
                if (location) {
                    html += `<div class="fc-event-location" style="font-size:0.85em;color:#666;">${location}</div>`;
                }
                return { html };
            },
            eventClick: function(info) {
                const ev = info.event;
                let details = `Event: ${ev.title}`;
                if (ev.extendedProps && ev.extendedProps.description) {
                    details += `\nLocation: ${ev.extendedProps.description}`;
                }
                details += `\nStart: ${ev.start ? ev.start.toLocaleString() : ''}`;
                if (ev.end) details += `\nEnd: ${ev.end.toLocaleString()}`;
                details += `\n\nRemove this event? (MBA admin only)`;
                const remove = confirm(details);
                if (!remove) return;
                const token = localStorage.getItem('mba_token');
                if (!token) { window.location.href = '/admin.html'; return; }
                fetch('/api/events/' + ev.id, {
                    method: 'DELETE',
                    headers: { 'x-admin-token': token }
                })
                .then(r => r.json())
                .then(res => {
                    if (res.error) return alert('Error: ' + res.error);
                    ev.remove();
                    alert('Event deleted');
                })
                .catch(err => alert('Error deleting event: ' + err));
            }
        });
        calendar.render();
    }
});
