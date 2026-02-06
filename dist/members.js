"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.members = void 0;
exports.renderMembersGrid = renderMembersGrid;
// Automatically render the members grid when this module is loaded in the browser
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', function () {
        renderMembersGrid();
    });
}
exports.members = [
    { name: 'Ronald David', title: 'President & CEO', email: 'ronald.david@morehouse.edu', photo: 'headshots/ronald_david.jpg' },
    { name: 'Kael Cotton', title: 'Vice President & COO', email: 'kael.cotton@morehouse.edu', photo: 'headshots/kael_cotton.jpg' },
    { name: 'Ian Mausi', title: 'Treasurer & CFO', email: 'ian.mausi@morehouse.edu', photo: 'headshots/ian_mausi.jpg' },
    { name: 'Armani McFadden', title: 'Parliamentarian & CCO', email: 'armani.mcfadden@morehouse.edu', photo: 'headshots/armani_mcfadden.jpg' },
    { name: 'Dillon Jones', title: 'Secretary & CCO', email: 'dillon.jones@morehouse.edu', photo: 'headshots/dillon_jones.jpg' },
];
function renderMembersGrid(containerId) {
    if (containerId === void 0) { containerId = 'members-root'; }
    var container = document.getElementById(containerId);
    if (!container)
        return;
    container.innerHTML = '';
    var grid = document.createElement('div');
    grid.className = 'members-grid';
    exports.members.forEach(function (m) {
        var card = document.createElement('div');
        card.className = 'member-card';
        if (m.photo) {
            var imgWrap = document.createElement('div');
            imgWrap.className = 'member-image';
            var img = document.createElement('img');
            img.className = 'member-photo';
            img.src = m.photo;
            img.alt = m.name + ' headshot';
            imgWrap.appendChild(img);
            card.appendChild(imgWrap);
        }
        var nameEl = document.createElement('div');
        nameEl.className = 'member-name';
        nameEl.textContent = m.name;
        var titleEl = document.createElement('div');
        titleEl.className = 'member-title';
        titleEl.textContent = m.title;
        var emailEl = document.createElement('a');
        emailEl.className = 'member-email';
        emailEl.href = "mailto:".concat(m.email);
        emailEl.textContent = m.email;
        card.appendChild(nameEl);
        card.appendChild(titleEl);
        card.appendChild(emailEl);
        grid.appendChild(card);
    });
    container.appendChild(grid);
}
exports.default = exports.members;
