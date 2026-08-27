const scrollButtons = document.querySelectorAll('[data-scroll]');
const toast = document.querySelector('#toast');
const joinButton = document.querySelector('#join-button');
const cardRows = document.querySelectorAll('.deck-row');
const cardModal = document.querySelector('#card-modal');
const modalImage = document.querySelector('#modal-image');
const modalTitle = document.querySelector('#modal-title');
const modalStats = document.querySelector('#modal-stats');
const modalRequirement = document.querySelector('#modal-requirement');
const modalExample = document.querySelector('#modal-example');
const modalClose = document.querySelector('#modal-close');

scrollButtons.forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' });
  });
});

joinButton.addEventListener('click', () => {
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 3600);
});

const closeCardModal = () => {
  cardModal.hidden = true;
  document.body.classList.remove('modal-open');
};

cardRows.forEach((row) => {
  const image = row.querySelector('img');
  const title = row.querySelector('h3');
  const stats = row.querySelector('p');
  const openCardModal = () => {
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modalTitle.textContent = title.textContent;
    modalStats.textContent = stats.textContent;
    modalRequirement.textContent = row.dataset.requirement;
    modalExample.textContent = row.dataset.example;
    cardModal.hidden = false;
    document.body.classList.add('modal-open');
    modalClose.focus();
  };

  row.addEventListener('click', openCardModal);
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openCardModal();
    }
  });
});

modalClose.addEventListener('click', closeCardModal);
cardModal.addEventListener('click', (event) => {
  if (event.target === cardModal) closeCardModal();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !cardModal.hidden) closeCardModal();
});

const supportsCursorEffect = window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (supportsCursorEffect) {
  const cursorSigil = document.createElement('span');
  cursorSigil.className = 'cursor-sigil';
  cursorSigil.setAttribute('aria-hidden', 'true');
  document.body.append(cursorSigil);

  let lastTrailTime = 0;
  document.addEventListener('pointermove', (event) => {
    cursorSigil.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;

    if (event.timeStamp - lastTrailTime < 45) return;
    lastTrailTime = event.timeStamp;
    const trailMark = document.createElement('span');
    trailMark.className = 'cursor-trail';
    trailMark.style.left = `${event.clientX}px`;
    trailMark.style.top = `${event.clientY}px`;
    document.body.append(trailMark);
    window.setTimeout(() => trailMark.remove(), 500);
  });
}
