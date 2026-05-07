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

// Cama de formas com física de gravidade e perfil triangular
const initShapeBed = () => {
  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];
  const types = ['circle', 'square', 'triangle', 'pentagon', 'hexagon', 'octagon', 'diamond'];

  (['left', 'right'] as const).forEach(side => {
    const bed = document.createElement('div');
    bed.className = `shape-bed ${side}`;
    document.body.appendChild(bed);

    const activeShapes: HTMLElement[] = [];
    const maxShapes = 55;

    const spawnShape = () => {
      const shape = document.createElement('div');
      const type = types[Math.floor(Math.random() * types.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 33 + 14;

      shape.className = `shape ${type}`;
      if (type !== 'triangle') {
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        shape.style.backgroundColor = color;
      } else {
        shape.style.setProperty('--shape-color', color);
        shape.style.borderLeftWidth = `${size * 0.6}px`;
        shape.style.borderRightWidth = `${size * 0.6}px`;
        shape.style.borderBottomWidth = `${size}px`;
      }

      // Cores sólidas
      shape.style.opacity = '1';

      const xPercent = Math.random() * 88;
      shape.style.left = `${xPercent}%`;
      shape.style.top = '0px';
      shape.style.bottom = 'auto';

      bed.appendChild(shape);
      activeShapes.push(shape);

      const vh = window.innerHeight;
      const floor = vh - size - 8;
      const maxPileHeight = vh * 0.25;

      // xRatio: 0 = borda da tela (pico da pilha), 1 = lado aberto (base)
      const xRatio = side === 'left' ? xPercent / 88 : (88 - xPercent) / 88;
      const pileHeightAtX = maxPileHeight * (1 - xRatio);
      const landingY = floor - Math.random() * pileHeightAtX;

      gsap.fromTo(shape,
        { y: -size - 10, rotation: Math.random() * 200 - 100 },
        {
          y: landingY,
          rotation: Math.random() * 25 - 12,
          duration: Math.random() * 0.9 + 0.5,
          ease: 'bounce.out',
        }
      );

      if (activeShapes.length > maxShapes) {
        const oldest = activeShapes.shift()!;
        gsap.to(oldest, {
          y: `+=${vh * 0.3}`,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.in',
          onComplete: () => oldest.remove(),
        });
      }
    };

    // Preenchimento inicial denso
    for (let i = 0; i < 50; i++) {
      setTimeout(spawnShape, i * 80);
    }

    // Fluxo contínuo
    setInterval(spawnShape, 500);
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
