import { gsap } from 'gsap';
import { Engine, Render, Runner, Bodies, Body, World, Events } from 'matter-js';

const initShapes = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const container = document.createElement('div');
  container.className = 'bg-shapes';
  document.body.appendChild(container);

  const engine = Engine.create();
  engine.gravity.y = 0.9;

  const render = Render.create({
    element: container,
    engine,
    options: { width: vw, height: vh, background: 'transparent', wireframes: false },
  });
  render.canvas.style.background = 'transparent';
  render.canvas.style.filter = 'saturate(0.82)';

  const wall = { fillStyle: 'transparent', strokeStyle: 'transparent', lineWidth: 0 };
  World.add(engine.world, [
    Bodies.rectangle(vw / 2,  vh + 25,  vw * 2, 50,    { isStatic: true, render: wall }),
    Bodies.rectangle(-25,     vh / 2,   50,     vh * 3, { isStatic: true, render: wall }),
    Bodies.rectangle(vw + 25, vh / 2,   50,     vh * 3, { isStatic: true, render: wall }),
  ]);

  // 30 cores cobrindo o espectro completo com variantes
  const colors = [
    '#ef4444', '#dc2626', '#f87171',           // vermelhos
    '#f97316', '#ea580c', '#fb923c',           // laranjas
    '#f59e0b', '#d97706', '#fbbf24', '#fde68a', // ambers/amarelos
    '#22c55e', '#16a34a', '#4ade80',           // verdes
    '#10b981', '#059669', '#6ee7b7',           // esmeraldas
    '#14b8a6', '#0d9488',                      // teals
    '#06b6d4', '#0891b2', '#67e8f9',           // cyans
    '#3b82f6', '#2563eb', '#93c5fd',           // azuis
    '#6366f1', '#4f46e5',                      // índigos
    '#8b5cf6', '#7c3aed', '#c4b5fd',           // violetas
    '#ec4899', '#db2777', '#f9a8d4',           // pinks
  ];

  const makeBody = (x: number, y: number, size: number, color: string) => {
    const opts = {
      friction:       0.65,
      restitution:    0.08,
      frictionAir:    0.006,
      frictionStatic: 0.4,
      render: { fillStyle: color, strokeStyle: 'rgba(0,0,0,0.20)', lineWidth: 1, opacity: 0.08 },
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
  const MAX          = 140;
  const FADE_RATE    = 0.004; // ~4 s at 60 fps

  const retire = (b: PhysBody) => {
    const idx = activeBodies.indexOf(b);
    if (idx !== -1) activeBodies.splice(idx, 1);
    bodyExpiry.delete(b);
    dyingBodies.add(b);
  };

  const spawn = () => {
    const x     = spawnX();
    const size  = Math.random() * 30 + 14;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const b     = makeBody(x, -40, size, color);

    World.add(engine.world, b);
    activeBodies.push(b);

    // Tempo de vida aleatório: 35–55 segundos
    bodyExpiry.set(b, Date.now() + (35 + Math.random() * 20) * 1000);

    // Hard cap para segurança de memória
    if (activeBodies.length > MAX) retire(activeBodies[0]);
  };

  Events.on(engine, 'afterUpdate', () => {
    const now = Date.now();

    // Enviar para dying os que expiraram por idade
    for (const [b, expiry] of [...bodyExpiry]) {
      if (now > expiry) retire(b);
    }

    // Fade-in por posição (aguado no topo → sólido na base)
    for (const b of activeBodies) {
      const t = Math.max(0, Math.min(1, b.position.y / (vh * 0.65)));
      b.render.opacity = 0.08 + t * 0.92;
    }

    // Fade-out suave (~4 s) para os dying
    for (const b of [...dyingBodies]) {
      b.render.opacity = Math.max(0, (b.render.opacity ?? 1) - FADE_RATE);
      if ((b.render.opacity ?? 0) < 0.01) {
        World.remove(engine.world, b);
        dyingBodies.delete(b);
      }
    }
  });

  Runner.run(Runner.create(), engine);
  Render.run(render);

  for (let i = 0; i < 70; i++) setTimeout(spawn, i * 130);
  setInterval(spawn, 110);
};

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
  (document.querySelectorAll('nav a') as NodeListOf<HTMLAnchorElement>).forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && href === './')) {
      link.classList.add('active');
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    initShapes();
    gsap.from('main', { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' });
  });
})();
