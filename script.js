// ========== ПЛАВНОЕ ПОЯВЛЕНИЕ СЕКЦИЙ ПРИ СКРОЛЛЕ ==========
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // показываем один раз
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Через секунду после загрузки показываем hero (он тоже с .reveal)
setTimeout(() => {
  const heroContent = document.querySelector('.hero-content');
  if (heroContent) heroContent.classList.add('visible');
}, 300);


// ========== КАРУСЕЛИ ДРЕСС-КОДА ==========
document.querySelectorAll('.carousel').forEach(carousel => {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const prevBtn = carousel.querySelector('.prev');
  const nextBtn = carousel.querySelector('.next');
  const dotsBox = carousel.querySelector('.carousel-dots');

  let current = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => { goTo(i); restartAuto(); });
    dotsBox.appendChild(dot);
  });

  const dots = dotsBox.querySelectorAll('span');

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); restartAuto(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); restartAuto(); });

  // автопрокрутка каждые 6 секунд
  function startAuto() {
    autoTimer = setInterval(() => goTo(current + 1), 6000);
  }
  function restartAuto() {
    clearInterval(autoTimer);
    startAuto();
  }
  startAuto();

  // свайп на телефоне
  let startX = 0;
  carousel.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) {
      goTo(dx > 0 ? current - 1 : current + 1);
      restartAuto();
    }
  });
});


// ========== ПОКАЗ ПОЛЕЙ ДЛЯ ГОСТЕЙ ==========
const form = document.getElementById('rsvp-form');
const extraFields = document.getElementById('extra-fields');
const statusEl = document.getElementById('form-status');

form.querySelectorAll('input[name="attending"]').forEach(radio => {
  radio.addEventListener('change', function () {
    if (this.value === 'Смогу' || this.value === 'Затрудняюсь ответить') {
      extraFields.classList.remove('hidden');
    } else {
      extraFields.classList.add('hidden');
      extraFields.querySelectorAll('input[type="checkbox"]')
        .forEach(cb => cb.checked = false);
    }
  });
});


// ========== ОТПРАВКА ФОРМЫ ==========
form.addEventListener('submit', function (e) {
  e.preventDefault();

  const nameInput = form.querySelector('input[name="name"]');
  const attendingInput = form.querySelector('input[name="attending"]:checked');

  if (!nameInput.value.trim()) {
    statusEl.textContent = 'Пожалуйста, укажите ваше имя';
    statusEl.style.color = '#a33';
    return;
  }
  if (!attendingInput) {
    statusEl.textContent = 'Пожалуйста, выберите вариант';
    statusEl.style.color = '#a33';
    return;
  }

  const data = new FormData(form);
  const drinks = data.getAll('drinks');

  const payload = {
    name: data.get('name'),
    attending: attendingInput.value,
    drinks: drinks.length ? drinks.join(', ') : '—',
    food: data.get('food') || '—',
    transfer: data.get('transfer') || '—',
    timestamp: new Date().toISOString()
  };

  statusEl.textContent = 'Отправляем...';
  statusEl.style.color = '#9a8b7e';

  fetch('https://formspree.io/f/mkjoqejw', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(response => {
      if (response.ok) showSuccess();
      else showError();
    })
    .catch(() => showError());
});


function showSuccess() {
  statusEl.textContent = 'Спасибо! Ваш ответ получен ♥';
  statusEl.style.color = '#6b1f2e';
  form.reset();
  extraFields.classList.add('hidden');
}

function showError() {
  statusEl.textContent = 'Что-то пошло не так. Попробуйте ещё раз.';
  statusEl.style.color = '#a33';
}