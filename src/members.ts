// Automatically render the members grid when this module is loaded in the browser
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    renderMembersGrid();
  });
}
export interface Member {
  name: string;
  title: string;
  email: string;
  photo?: string; // relative path to headshot image
}

export const members: Member[] = [
  { name: 'Ronald David', title: 'President & CEO', email: 'ronald.david@morehouse.edu', photo: 'headshots/ronald_david.jpg' },
  { name: 'Kael Cotton', title: 'Vice President & COO', email: 'kael.cotton@morehouse.edu', photo: 'headshots/kael_cotton.jpg' },
  { name: 'Ian Mausi', title: 'Treasurer & CFO', email: 'ian.mausi@morehouse.edu', photo: 'headshots/ian_mausi.jpg' },
  { name: 'Armani McFadden', title: 'Parliamentarian & CCO', email: 'armani.mcfadden@morehouse.edu', photo: 'headshots/armani_mcfadden.jpg' },
  { name: 'Dillon Jones', title: 'Secretary & CCO', email: 'dillon.jones@morehouse.edu', photo: 'headshots/dillon_jones.jpg' },
];

export function renderMembersGrid(containerId = 'members-root') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  const grid = document.createElement('div');
  grid.className = 'members-grid';

  members.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'member-card';

    if (m.photo) {
      const imgWrap = document.createElement('div');
      imgWrap.className = 'member-image';
      const img = document.createElement('img');
      img.className = 'member-photo';
      img.src = m.photo;
      img.alt = m.name + ' headshot';
      imgWrap.appendChild(img);
      card.appendChild(imgWrap);
    }

    const nameEl = document.createElement('div');
    nameEl.className = 'member-name';
    nameEl.textContent = m.name;

    const titleEl = document.createElement('div');
    titleEl.className = 'member-title';
    titleEl.textContent = m.title;

    const emailEl = document.createElement('a');
    emailEl.className = 'member-email';
    emailEl.href = `mailto:${m.email}`;
    emailEl.textContent = m.email;

    card.appendChild(nameEl);
    card.appendChild(titleEl);
    card.appendChild(emailEl);
    grid.appendChild(card);
  });

  container.appendChild(grid);
}

export default members;
