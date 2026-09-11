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
const entryGate = document.querySelector('#entry-gate');
const enterButton = document.querySelector('#enter-button');
const stayButton = document.querySelector('#stay-button');
const entryResponse = document.querySelector('#entry-response');
const duelAudio = document.querySelector('#duel-audio');
const accordionItems = document.querySelectorAll('.accordion-item');
const voiceCommand = document.querySelector('#voice-command');

document.body.classList.add('entry-locked');

enterButton.addEventListener('click', () => {
  duelAudio.currentTime = 0;
  duelAudio.play().catch(() => {
    entryResponse.textContent = 'No se pudo reproducir el audio local.';
  });
  entryGate.classList.add('opening');
  enterButton.disabled = true;
  stayButton.disabled = true;
  window.setTimeout(() => {
    entryGate.classList.add('entered');
    document.body.classList.remove('entry-locked');
  }, 1250);
  window.setTimeout(() => entryGate.remove(), 1750);
});

stayButton.addEventListener('click', () => {
  entryResponse.textContent = 'El duelo te esperará en la arena.';
});

accordionItems.forEach((item) => {
  const trigger = item.querySelector('.accordion-trigger');
  const panel = item.querySelector('.accordion-panel');

  trigger.addEventListener('click', () => {
    const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';

    accordionItems.forEach((otherItem) => {
      const otherTrigger = otherItem.querySelector('.accordion-trigger');
      const otherPanel = otherItem.querySelector('.accordion-panel');
      otherItem.classList.toggle('is-open', otherItem === item && shouldOpen);
      otherTrigger.setAttribute('aria-expanded', otherItem === item && shouldOpen ? 'true' : 'false');
      otherPanel.hidden = !(otherItem === item && shouldOpen);
    });
  });
});

scrollButtons.forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' });
  });
});

if (joinButton) {
  joinButton.addEventListener('click', () => {
    toast.classList.add('visible');
    window.setTimeout(() => toast.classList.remove('visible'), 3600);
  });
}

const normalizeVoiceText = (text) => text
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const showVoiceMessage = (message) => {
  toast.textContent = message;
  toast.classList.add('visible');
  window.setTimeout(() => toast.classList.remove('visible'), 3600);
};

const runVoiceCommand = (command) => {
  const normalizedCommand = normalizeVoiceText(command);
  const destinations = [
    { keywords: ['arsenal', 'deck', 'cartas'], target: '#arsenal', label: 'el arsenal' },
    { keywords: ['exodia', 'sello', 'faraon'], target: '#exodia', label: 'el sello de Exodia' },
    { keywords: ['academia', 'historia'], target: '#academy', label: 'la academia' },
    { keywords: ['torneo', 'torneos', 'evento', 'eventos'], target: '#events', label: 'los torneos' },
    { keywords: ['inicio', 'arriba', 'comienzo'], target: '#top', label: 'el inicio' }
  ];
  const destination = destinations.find(({ keywords }) => keywords.some((keyword) => normalizedCommand.includes(keyword)));

  if (normalizedCommand.includes('entrar') || normalizedCommand.includes('duelo')) {
    enterButton.click();
    showVoiceMessage('Comando: entrando al duelo.');
    return;
  }

  if (destination) {
    document.querySelector(destination.target)?.scrollIntoView({ behavior: 'smooth' });
    showVoiceMessage(`Comando: mostrando ${destination.label}.`);
    return;
  }

  showVoiceMessage(`No reconocí el comando: “${command}”.`);
};

if (voiceCommand) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    voiceCommand.disabled = true;
    voiceCommand.title = 'Tu navegador no admite comandos de voz';
    voiceCommand.setAttribute('aria-label', 'Comandos de voz no disponibles');
  } else {
    const recognition = new SpeechRecognition();
    let isRecognizing = false;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      isRecognizing = true;
      voiceCommand.classList.add('is-listening');
      voiceCommand.textContent = '...';
      showVoiceMessage('Escuchando un comando.');
    };

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.trim();
      runVoiceCommand(command);
    };

    recognition.onerror = () => {
      isRecognizing = false;
      showVoiceMessage('No se pudo reconocer el comando de voz.');
    };
    recognition.onend = () => {
      isRecognizing = false;
      voiceCommand.classList.remove('is-listening');
      voiceCommand.textContent = 'MIC';
    };
    voiceCommand.addEventListener('click', () => {
      if (isRecognizing) return;
      try {
        recognition.start();
      } catch {
        showVoiceMessage('El micrófono ya está activo.');
      }
    });
  }
}

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
