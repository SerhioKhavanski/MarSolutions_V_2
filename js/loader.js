window.addEventListener('load', () => {
  const preloader = document.getElementById('preloader');
  if(!preloader) return;

  // задержка перед началом скрытия (2000 мс = 2 сек)
  setTimeout(() => {
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 700);
  }, 2000);
});
