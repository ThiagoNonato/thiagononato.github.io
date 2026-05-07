import { gsap } from 'gsap';

// Gerador de formas geométricas animadas
const initShapes = () => {
  const container = document.createElement('div');
  container.className = 'bg-shapes';
  document.body.appendChild(container);

  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  const types = ['circle', 'square', 'triangle', 'pentagon', 'hexagon', 'octagon', 'diamond'];

  const createShape = (side: 'left' | 'right') => {
    const shape = document.createElement('div');
    const type = types[Math.floor(Math.random() * types.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 25 + 10;

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
      ? Math.random() * 15 
      : 85 + Math.random() * 15;
    
    shape.style.left = `${xPos}%`;

    container.appendChild(shape);

    // Animação GSAP: "Vulcão" de baixo para cima
    gsap.to(shape, {
      y: -window.innerHeight - 100,
      x: (Math.random() - 0.5) * 150, // Maior dispersão lateral
      rotation: Math.random() * 720, // Mais rotação
      duration: Math.random() * 6 + 4,
      ease: 'none',
      onComplete: () => {
        shape.remove();
        createShape(side); // Cria uma nova para manter o fluxo
      }
    });
  };

  // Inicializa muitas formas de cada lado para um volume maior
  for (let i = 0; i < 40; i++) {
    setTimeout(() => createShape('left'), i * 300);
    setTimeout(() => createShape('right'), i * 300 + 150);
  }
};

// Cama de formas estáticas nas laterais inferiores
const initShapeBed = () => {
  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
  const types = ['circle', 'square', 'triangle', 'pentagon', 'hexagon', 'octagon', 'diamond'];
  
  ['left', 'right'].forEach(side => {
    const bed = document.createElement('div');
    bed.className = `shape-bed ${side}`;
    document.body.appendChild(bed);

    // Cria uma densidade de formas na cama
    for (let i = 0; i < 25; i++) {
      const shape = document.createElement('div');
      const type = types[Math.floor(Math.random() * types.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 30 + 15;

      shape.className = `shape static-shape ${type}`;
      if (type !== 'triangle') {
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.backgroundColor = color;
      } else {
        shape.style.setProperty('--shape-color', color);
      }

      shape.style.left = `${Math.random() * 100}%`;
      shape.style.bottom = `${Math.random() * 100}%`;
      shape.style.transform = `rotate(${Math.random() * 360}deg)`;
      
      bed.appendChild(shape);

      // Reação ao Scroll (Física leve)
      window.addEventListener('scroll', () => {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        const moveAmount = scrollPercent * 40; // Movimento máximo de 40px
        
        gsap.to(shape, {
          y: -moveAmount * (Math.random() * 0.5 + 0.5), // Cada um move em velocidade levemente diferente
          rotation: `+=${scrollPercent * 10}`,
          duration: 0.6,
          ease: 'power1.out'
        });
      });
    }
  });
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
    initShapeBed();
    
    gsap.from('main', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out'
    });
  });
})();
