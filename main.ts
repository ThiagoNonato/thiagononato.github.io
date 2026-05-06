import { gsap } from 'gsap';

// Toggle de tema com persistência e tipagem
(() => {
  const btn = document.getElementById('themeToggle') as HTMLButtonElement | null;
  const root = document.documentElement;

  if (btn) {
    btn.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme');
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      root.setAttribute('data-theme', nextTheme);
      localStorage.setItem('tn-theme', nextTheme);
    });
  }

  // Lógica para destacar o link ativo na navegação
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a') as NodeListOf<HTMLAnchorElement>;

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && href === './')) {
      link.classList.add('active');
    }
  });

  // Animação de entrada (Fade-in suave)
  window.addEventListener('DOMContentLoaded', () => {
    gsap.from('main', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out'
    });
  });
})();
