import { gsap } from 'gsap';

// Gerador de formas geométricas animadas
const initShapes = () => {
  const container = document.createElement('div');
  container.className = 'bg-shapes';
  document.body.appendChild(container);

  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  const types = ['circle', 'square', 'triangle'];

  const createShape = (side: 'left' | 'right') => {
    const shape = document.createElement('div');
    const type = types[Math.floor(Math.random() * types.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 20 + 10;

    shape.className = `shape ${type}`;
    if (type !== 'triangle') {
      shape.style.width = `${size}px`;
      shape.style.height = `${size}px`;
      shape.style.backgroundColor = color;
    } else {
      shape.style.setProperty('--shape-color', color);
    }

    // Posição horizontal (lateral)
    const xPos = side === 'left' 
      ? Math.random() * 10 
      : 90 + Math.random() * 10;
    
    shape.style.left = `${xPos}%`;

    container.appendChild(shape);

    // Animação GSAP: "Vulcão" de baixo para cima
    gsap.to(shape, {
      y: -window.innerHeight - 100,
      x: (Math.random() - 0.5) * 100, // Leve dispersão lateral
      rotation: Math.random() * 360,
      duration: Math.random() * 5 + 5,
      ease: 'none',
      onComplete: () => {
        shape.remove();
        createShape(side); // Cria uma nova para manter o fluxo
      }
    });
  };

  // Inicializa algumas formas de cada lado
  for (let i = 0; i < 15; i++) {
    setTimeout(() => createShape('left'), i * 600);
    setTimeout(() => createShape('right'), i * 600 + 300);
  }
};

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

  // Inicializa formas e animação de entrada
  window.addEventListener('DOMContentLoaded', () => {
    initShapes();
    
    gsap.from('main', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out'
    });
  });
})();
