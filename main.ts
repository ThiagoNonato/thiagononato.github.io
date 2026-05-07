import { gsap } from 'gsap';
import { Engine, Render, Runner, Bodies, Body, World, Events } from 'matter-js';

const initShapes = () => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Container (fixed, behind content)
  const container = document.createElement('div');
  container.className = 'bg-shapes';
  document.body.appendChild(container);

  // Physics engine
  const engine = Engine.create();
  engine.gravity.y = 0.9;

  // Canvas renderer — transparent background
  const render = Render.create({
    element: container,
    engine,
    options: {
      width: vw,
      height: vh,
      background: 'transparent',
      wireframes: false,
    },
  });
  render.canvas.style.background = 'transparent';

  // Invisible static walls: floor + left + right
  const wall = { fillStyle: 'transparent', strokeStyle: 'transparent', lineWidth: 0 };
  World.add(engine.world, [
    Bodies.rectangle(vw / 2, vh + 25,  vw * 2, 50,    { isStatic: true, render: wall }),
    Bodies.rectangle(-25,    vh / 2,    50,     vh * 3, { isStatic: true, render: wall }),
    Bodies.rectangle(vw + 25, vh / 2,  50,     vh * 3, { isStatic: true, render: wall }),
  ]);

  const colors = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

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

    // Small initial spin for natural variety
    Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.08);
    return b;
  };

  // 50% left edge (0-20%), 50% right edge (80-100%) — no center spawning
  const edgeW = vw * 0.20;
  const spawnX = () =>
    Math.random() < 0.5
      ? Math.random() * edgeW
      : vw - edgeW + Math.random() * edgeW;

  const activeBodies: ReturnType<typeof Bodies.circle>[] = [];
  const MAX = 140;

  const spawn = () => {
    const x     = spawnX();
    const size  = Math.random() * 30 + 14;
    const color = colors[Math.floor(Math.random() * colors.length)];

    const b = makeBody(x, -40, size, color);
    World.add(engine.world, b);
    activeBodies.push(b);

    // Remove oldest when over limit
    if (activeBodies.length > MAX) {
      const old = activeBodies.shift()!;
      World.remove(engine.world, old);
    }
  };

  // Fade in colour as shape descends: watery (0.08) → solid (1.0)
  Events.on(engine, 'afterUpdate', () => {
    for (const b of activeBodies) {
      const t = Math.max(0, Math.min(1, b.position.y / (vh * 0.65)));
      b.render.opacity = 0.08 + t * 0.92;
    }
  });

  Runner.run(Runner.create(), engine);
  Render.run(render);

  // Staggered initial fill (9 s to fill), then continuous flow
  for (let i = 0; i < 70; i++) setTimeout(spawn, i * 130);
  setInterval(spawn, 110);
};

// Theme toggle + active nav link
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
