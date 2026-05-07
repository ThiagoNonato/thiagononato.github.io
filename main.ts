import { gsap } from 'gsap';
import { Engine, Render, Runner, Bodies, Body, World, Events } from 'matter-js';

const initShapes = () => {
  if (document.querySelector('.bg-shapes')) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const container = document.createElement('div');
  container.className = 'bg-shapes';
  document.body.appendChild(container);

  const engine = Engine.create();
  engine.gravity.y = 0.03;

  const render = Render.create({
    element: container,
    engine,
    options: { width: vw, height: vh, background: 'transparent', wireframes: false },
  });
  render.canvas.style.background = 'transparent';

  const wall = { fillStyle: 'transparent', strokeStyle: 'transparent', lineWidth: 0 };
  const wallFilter = { category: 2, mask: 1 };
  World.add(engine.world, [
    Bodies.rectangle(vw / 2,  vh + 25,  vw * 2, 50,    { isStatic: true, render: wall, collisionFilter: wallFilter }),
    Bodies.rectangle(-25,     vh / 2,   50,     vh * 3, { isStatic: true, render: wall, collisionFilter: wallFilter }),
    Bodies.rectangle(vw + 25, vh / 2,   50,     vh * 3, { isStatic: true, render: wall, collisionFilter: wallFilter }),
  ]);

  const colors = [
    '#f2f2f2', '#e0e0e0', '#cccccc', '#b8b8b8',
    '#a3a3a3', '#8f8f8f', '#7a7a7a', '#666666',
    '#525252', '#3d3d3d', '#292929', '#1f1f1f',
    '#141414', '#0a0a0a',
  ];

  const makeBody = (x: number, y: number, size: number, color: string) => {
    const opts = {
      friction:       0.65,
      restitution:    0.08,
      frictionAir:    0.012,
      frictionStatic: 0.4,
      render: { fillStyle: color, strokeStyle: 'rgba(0,0,0,0.12)', lineWidth: 1, opacity: 1.0 },
      collisionFilter: { category: 1, mask: 0xFFFF },
    };

    const t = Math.floor(Math.random() * 7);
    let b: ReturnType<typeof Bodies.circle>;
    switch (t) {
      case 0:  b = Bodies.circle(x, y, size / 2, opts); break;
      case 1:  b = Bodies.rectangle(x, y, size, size, opts); break;
      case 2:  b = Bodies.polygon(x, y, 3, size / 2, opts); break;
      case 3:  b = Bodies.polygon(x, y, 5, size / 2, opts); break;
      case 4:  b = Bodies.polygon(x, y, 6, size / 2, opts); break;
      case 5:  b = Bodies.polygon(x, y, 8, size / 2, opts); break;
      default:
        b = Bodies.polygon(x, y, 4, size / 2, opts);
        Body.setAngle(b, Math.PI / 4);
    }
    Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.08);
    return b;
  };

  const edgeW = vw * 0.20;
  const spawnX = () =>
    Math.random() < 0.5
      ? Math.random() * edgeW
      : vw - edgeW + Math.random() * edgeW;

  type PhysBody = ReturnType<typeof Bodies.circle>;
  const activeBodies: PhysBody[]    = [];
  const dyingBodies  = new Set<PhysBody>();
  const bodyExpiry   = new Map<PhysBody, number>();
  const MAX          = 90;
  const FADE_RATE    = 0.002;

  const retire = (b: PhysBody) => {
    const idx = activeBodies.indexOf(b);
    if (idx !== -1) activeBodies.splice(idx, 1);
    bodyExpiry.delete(b);
    b.collisionFilter = { category: 4, mask: 1 };
    dyingBodies.add(b);
  };

  const spawn = () => {
    const x     = spawnX();
    const size  = Math.random() * 30 + 14;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const b     = makeBody(x, -40, size, color);

    World.add(engine.world, b);
    activeBodies.push(b);
    bodyExpiry.set(b, Date.now() + (66 + Math.random() * 30) * 1000);

    if (activeBodies.length > MAX) retire(activeBodies[0]);
  };

  Events.on(engine, 'afterUpdate', () => {
    const now = Date.now();
    for (const [b, expiry] of [...bodyExpiry]) {
      if (now > expiry) retire(b);
    }
    for (const b of [...dyingBodies]) {
      b.render.opacity = Math.max(0, (b.render.opacity ?? 1) - FADE_RATE);
      if (b.position.y > vh + 150 || (b.render.opacity ?? 0) < 0.01) {
        World.remove(engine.world, b);
        dyingBodies.delete(b);
      }
    }
  });

  Runner.run(Runner.create(), engine);
  Render.run(render);

  for (let i = 0; i < 10; i++) setTimeout(spawn, i * 600);
  setInterval(spawn, 600);
};

const updateActiveLink = () => {
  const path = window.location.pathname;
  const currentPage = path.split('/').pop() || 'index.html';
  
  (document.querySelectorAll('nav a') as NodeListOf<HTMLAnchorElement>).forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && (href === './' || href === 'index.html'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
};

const animateIn = () => {
  gsap.fromTo('main', 
    { opacity: 0, y: 20 }, 
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', clearProps: 'all' }
  );
};

const loadPage = async (url: string, pushState = true) => {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const newMain = doc.querySelector('main');
    const newTitle = doc.querySelector('title');
    const newDescription = doc.querySelector('meta[name="description"]');

    if (newMain && newTitle) {
      const currentMain = document.querySelector('main');
      const currentDescription = document.querySelector('meta[name="description"]');
      
      if (currentMain) {
        // Opção: animate out antes de trocar
        await gsap.to(currentMain, { opacity: 0, y: -20, duration: 0.3, ease: 'power2.in' });
        
        currentMain.innerHTML = newMain.innerHTML;
        currentMain.className = newMain.className;
        
        document.title = newTitle.innerText;
        if (currentDescription && newDescription) {
          currentDescription.setAttribute('content', newDescription.getAttribute('content') || '');
        }
        
        if (pushState) {
          window.history.pushState({}, '', url);
        }

        updateActiveLink();
        window.scrollTo(0, 0);
        animateIn();
      }
    }
  } catch (error) {
    console.error('Error loading page:', error);
    // Fallback: hard redirect
    window.location.href = url;
  }
};

(() => {
  // Theme Toggle (header remains constant, but we attach it once)
  const setupThemeToggle = () => {
    const btn = document.getElementById('themeToggle') as HTMLButtonElement | null;
    const root = document.documentElement;
    if (btn && !btn.dataset.init) {
      btn.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('tn-theme', next);
      });
      btn.dataset.init = 'true';
    }
  };

  // Intercept Clicks
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link && link instanceof HTMLAnchorElement) {
      const href = link.getAttribute('href');
      const isInternal = link.origin === window.location.origin && href && !href.startsWith('#') && !href.startsWith('mailto:');
      
      if (isInternal) {
        e.preventDefault();
        loadPage(link.href);
      }
    }
  });

  window.addEventListener('popstate', () => {
    loadPage(window.location.href, false);
  });

  window.addEventListener('DOMContentLoaded', () => {
    initShapes();
    setupThemeToggle();
    updateActiveLink();
    animateIn();
  });
})();
