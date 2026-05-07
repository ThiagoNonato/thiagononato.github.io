import { gsap } from 'gsap';

const initShapes = () => {
  const container = document.createElement('div');
  container.className = 'bg-shapes';
  document.body.appendChild(container);

  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];
  const types = ['circle', 'square', 'triangle', 'pentagon', 'hexagon', 'octagon', 'diamond'];

  let vw = window.innerWidth;
  let vh = window.innerHeight;

  // Column-based height map: tracks the top of the pile in each 12px-wide column
  const COL = 12;
  let numCols = Math.ceil(vw / COL);
  let heightMap = new Array(numCols).fill(vh); // starts at floor (bottom of viewport)

  window.addEventListener('resize', () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    numCols = Math.ceil(vw / COL);
    heightMap = new Array(numCols).fill(vh);
  });

  const colStart = (xPx: number) => Math.max(0, Math.floor(xPx / COL));
  const colEnd   = (xPx: number, w: number) => Math.min(numCols - 1, Math.floor((xPx + w) / COL));

  const getPileTop = (xPx: number, w: number): number => {
    let min = vh;
    for (let i = colStart(xPx); i <= colEnd(xPx, w); i++) min = Math.min(min, heightMap[i]);
    return min;
  };

  const claimColumns = (xPx: number, w: number, topY: number) => {
    for (let i = colStart(xPx); i <= colEnd(xPx, w); i++) heightMap[i] = Math.min(heightMap[i], topY);
  };

  const recalcHeightMap = (shapes: ShapeEntry[]) => {
    heightMap.fill(vh);
    for (const s of shapes) claimColumns(s.xPx, s.size, s.landedY);
  };

  // 40% left edge | 40% right edge | 20% center
  const getSpawnX = (size: number): number => {
    const edgeW = vw * 0.18;
    const r = Math.random();
    if (r < 0.40) return Math.random() * Math.max(0, edgeW - size);
    if (r < 0.80) return vw - edgeW + Math.random() * Math.max(0, edgeW - size);
    return edgeW + Math.random() * Math.max(0, vw - 2 * edgeW - size);
  };

  interface ShapeEntry { el: HTMLElement; xPx: number; size: number; landedY: number; }
  const activeShapes: ShapeEntry[] = [];
  const MAX_SHAPES    = 150;
  const MAX_PILE_H    = vh * 0.30; // pile can grow up to 30% of viewport height

  const spawnShape = () => {
    const type  = types[Math.floor(Math.random() * types.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size  = Math.random() * 28 + 13;
    const xPx   = getSpawnX(size);

    // Find where this shape would land on top of the current pile
    const pileTopY = getPileTop(xPx, size);
    const landedY  = pileTopY - size;

    // Skip if pile is already too tall at this x
    if (landedY < vh - MAX_PILE_H) return;

    const el = document.createElement('div');
    el.className = `shape ${type}`;

    if (type !== 'triangle') {
      el.style.width  = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = color;
    } else {
      el.style.setProperty('--shape-color', color);
      el.style.borderLeftWidth   = `${size * 0.6}px`;
      el.style.borderRightWidth  = `${size * 0.6}px`;
      el.style.borderBottomWidth = `${size}px`;
    }

    el.style.left   = `${xPx}px`;
    el.style.top    = '0px';
    el.style.bottom = 'auto';

    container.appendChild(el);

    // Reserve columns immediately so concurrent spawns don't stack in the same spot
    claimColumns(xPx, size, landedY);

    const entry: ShapeEntry = { el, xPx, size, landedY };
    activeShapes.push(entry);

    // Fall with gravity; opacity 0.08 (watery) → 1 (solid) as it descends
    gsap.fromTo(el,
      { y: -size - 20, rotation: Math.random() * 200 - 100, opacity: 0.08 },
      {
        y: landedY,
        rotation: Math.random() * 16 - 8,
        opacity: 1,
        duration: Math.random() * 2.0 + 1.5,
        ease: 'power2.in',
      }
    );

    // When over the limit, drop the oldest shape off the bottom
    if (activeShapes.length > MAX_SHAPES) {
      const oldest = activeShapes.shift()!;
      gsap.to(oldest.el, {
        y: `+=${vh * 0.35}`,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.in',
        onComplete: () => {
          oldest.el.remove();
          recalcHeightMap(activeShapes);
        },
      });
    }
  };

  // Initial fill — espaçado para a queda ser visível
  for (let i = 0; i < 70; i++) {
    setTimeout(spawnShape, i * 130);
  }
  // Fluxo contínuo com volume alto
  setInterval(spawnShape, 100);
};

// Toggle de tema com persistência e tipagem
(() => {
  const btn  = document.getElementById('themeToggle') as HTMLButtonElement | null;
  const root = document.documentElement;

  if (btn) {
    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('tn-theme', next);
    });
  }

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a') as NodeListOf<HTMLAnchorElement>;
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && href === './')) {
      link.classList.add('active');
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    initShapes();

    gsap.from('main', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power2.out',
    });
  });
})();
