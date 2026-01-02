
import React, { useRef, useEffect } from 'react';
import { Player, Enemy, Projectile, ExperienceGem, GameStatus, GameTheme } from '../types';

interface GameCanvasProps {
  playerRef: React.MutableRefObject<Player>;
  enemiesRef: React.MutableRefObject<Enemy[]>;
  projectilesRef: React.MutableRefObject<Projectile[]>;
  gemsRef: React.MutableRefObject<ExperienceGem[]>;
  keysRef: React.MutableRefObject<{ [key: string]: boolean }>;
  status: GameStatus;
  setStatus: (s: GameStatus) => void;
  theme: GameTheme;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setTimer: React.Dispatch<React.SetStateAction<number>>;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  playerRef, enemiesRef, projectilesRef, gemsRef, keysRef, status, setStatus, theme, setScore, setTimer 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Provide initial value for useRef to satisfy TypeScript requirements
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);

  const update = (deltaTime: number) => {
    if (status !== GameStatus.PLAYING) return;

    const p = playerRef.current;
    const enemies = enemiesRef.current;
    const projectiles = projectilesRef.current;
    const gems = gemsRef.current;

    // Timer
    setTimer(prev => prev + deltaTime / 1000);

    // 1. Movement
    let dx = 0, dy = 0;
    if (keysRef.current['w'] || keysRef.current['arrowup']) dy -= 1;
    if (keysRef.current['s'] || keysRef.current['arrowdown']) dy += 1;
    if (keysRef.current['a'] || keysRef.current['arrowleft']) dx -= 1;
    if (keysRef.current['d'] || keysRef.current['arrowright']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const mag = Math.sqrt(dx * dx + dy * dy);
      p.x += (dx / mag) * p.speed;
      p.y += (dy / mag) * p.speed;
    }

    // Constraints
    p.x = Math.max(p.radius, Math.min(window.innerWidth - p.radius, p.x));
    p.y = Math.max(p.radius, Math.min(window.innerHeight - p.radius, p.y));

    // 2. Shooting (Auto-aim at nearest enemy)
    const now = Date.now();
    if (now - p.lastFired > p.fireRate && enemies.length > 0) {
      let nearest: Enemy | null = null;
      let minDist = Infinity;
      enemies.forEach(e => {
        const d = Math.hypot(e.x - p.x, e.y - p.y);
        if (d < minDist) {
          minDist = d;
          nearest = e;
        }
      });

      if (nearest) {
        const angle = Math.atan2((nearest as Enemy).y - p.y, (nearest as Enemy).x - p.x);
        projectiles.push({
          x: p.x,
          y: p.y,
          dx: Math.cos(angle) * 10,
          dy: Math.sin(angle) * 10,
          damage: p.damage,
          color: '#fbbf24'
        });
        p.lastFired = now;
      }
    }

    // 3. Spawning
    spawnTimerRef.current += deltaTime;
    if (spawnTimerRef.current > 1500) {
      const type = theme.enemyTypes[Math.floor(Math.random() * theme.enemyTypes.length)];
      const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let ex = 0, ey = 0;
      if (edge === 0) { ex = Math.random() * window.innerWidth; ey = -50; }
      if (edge === 1) { ex = window.innerWidth + 50; ey = Math.random() * window.innerHeight; }
      if (edge === 2) { ex = Math.random() * window.innerWidth; ey = window.innerHeight + 50; }
      if (edge === 3) { ex = -50; ey = Math.random() * window.innerHeight; }

      enemies.push({
        id: Math.random().toString(),
        x: ex,
        y: ey,
        radius: 12,
        health: 40 * type.healthMult,
        maxHealth: 40 * type.healthMult,
        color: type.color,
        type: type.name,
        speed: (1.5 + Math.random()) * type.speedMult,
        damage: 10,
        score: 10
      });
      spawnTimerRef.current = 0;
    }

    // 4. Update Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const pr = projectiles[i];
      pr.x += pr.dx;
      pr.y += pr.dy;
      if (pr.x < -100 || pr.x > window.innerWidth + 100 || pr.y < -100 || pr.y > window.innerHeight + 100) {
        projectiles.splice(i, 1);
        continue;
      }
      // Check collision with enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        const en = enemies[j];
        if (Math.hypot(pr.x - en.x, pr.y - en.y) < en.radius + 5) {
          en.health -= pr.damage;
          projectiles.splice(i, 1);
          if (en.health <= 0) {
            setScore(s => s + en.score);
            gems.push({ x: en.x, y: en.y, value: 20, color: '#a855f7' });
            enemies.splice(j, 1);
          }
          break;
        }
      }
    }

    // 5. Update Enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      const en = enemies[i];
      const angle = Math.atan2(p.y - en.y, p.x - en.x);
      en.x += Math.cos(angle) * en.speed;
      en.y += Math.sin(angle) * en.speed;

      // Hit player
      if (Math.hypot(en.x - p.x, en.y - p.y) < en.radius + p.radius) {
        p.health -= 0.5; // continuous damage
        if (p.health <= 0) {
          setStatus(GameStatus.GAME_OVER);
        }
      }
    }

    // 6. Update Gems
    for (let i = gems.length - 1; i >= 0; i--) {
      const gem = gems[i];
      if (Math.hypot(gem.x - p.x, gem.y - p.y) < p.radius + 10) {
        p.exp += gem.value;
        gems.splice(i, 1);
        if (p.exp >= p.nextLevelExp) {
          p.level++;
          p.exp = 0;
          p.nextLevelExp = Math.floor(p.nextLevelExp * 1.5);
          setStatus(GameStatus.LEVEL_UP);
        }
      }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Background stars
    ctx.fillStyle = '#1e293b';
    for (let i = 0; i < 50; i++) {
       const x = (Math.sin(i * 12345) * 0.5 + 0.5) * ctx.canvas.width;
       const y = (Math.cos(i * 67890) * 0.5 + 0.5) * ctx.canvas.height;
       ctx.fillRect(x, y, 2, 2);
    }

    const p = playerRef.current;
    const enemies = enemiesRef.current;
    const projectiles = projectilesRef.current;
    const gems = gemsRef.current;

    // Draw Gems
    gems.forEach(g => {
      ctx.beginPath();
      ctx.arc(g.x, g.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = g.color;
      ctx.fill();
    });

    // Draw Enemies
    enemies.forEach(e => {
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.fill();
      // Health bar
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(e.x - 10, e.y - 20, 20, 3);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(e.x - 10, e.y - 20, 20 * (e.health / e.maxHealth), 3);
    });

    // Draw Projectiles
    projectiles.forEach(pr => {
      ctx.beginPath();
      ctx.arc(pr.x, pr.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = pr.color;
      ctx.fill();
    });

    // Draw Player
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const loop = (time: number) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    update(deltaTime);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx);

    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status]); // Re-run effect if status changes to handle pause/resume logically

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full block bg-slate-950"
    />
  );
};

export default GameCanvas;
