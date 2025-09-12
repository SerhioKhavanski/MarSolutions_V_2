// Получаем текущий путь без лишних слэшей и параметров
let currentPath = window.location.pathname.replace(/\/$/, ''); 

// Если главная, нормализуем в index.html
if (currentPath === '') {
  currentPath = '/index.html';
}

document.querySelectorAll('.menu__item').forEach(link => {
  let linkPath = new URL(link.href).pathname.replace(/\/$/, '');

  if (linkPath === '') {
    linkPath = '/index.html';
  }

  if (linkPath === currentPath) {
    link.classList.add('active');
  }
});

let lastScroll = 0;
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;

  // Скрыть/показать при скролле вниз/вверх
  if (currentScroll > lastScroll && currentScroll > 50) {
    nav.style.transform = 'translateY(-100%)';
  } else {
    nav.style.transform = 'translateY(-5px)';
  }

  lastScroll = currentScroll;

  // Фон только на десктопе
  if (window.innerWidth > 1024) {
    if (window.scrollY > 0) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  } else {
    // На мобилке/планшете сбрасываем
    nav.classList.remove('scrolled');
  }
});