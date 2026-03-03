# Physics 132L — Interactive Lab Notebook
## Build Instructions for Vibe Coding Agent

> **Purpose**: These instructions are written for an AI coding agent (Cursor, Windsurf, Claude Code, etc.).
> Follow them top-to-bottom to build a reproducible, from-scratch Mathigon Studio lab notebook
> for a university Physics 132L course. Every step is explicit so the build can be repeated
> after a broken state.

---

## 0. Prerequisites (do this manually before running the agent)

```bash
# Check versions — you need Node >= 18
node -v
npm -v

# Install ts-node globally if missing
npm install -g ts-node nodemon
```

---

## 1. Project Scaffold

Create the following directory structure from scratch. Do not reuse any broken files.

```
physics132L/
├── config.yaml
├── package.json
├── tsconfig.json
├── server/
│   ├── app.ts
│   └── templates/
│       ├── home.pug
│       └── courses.pug
├── frontend/
│   └── assets/
├── content/
│   └── shared/
└── README.md
```

### 1a. `package.json`

```json
{
  "name": "physics132l-lab",
  "version": "1.0.0",
  "scripts": {
    "build": "mgon-build --assets --minify",
    "dev": "mgon-build --assets --watch & nodemon --exec ts-node server/app.ts",
    "start": "node server/app.js"
  },
  "dependencies": {
    "@mathigon/studio": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0",
    "nodemon": "^3.0.0"
  }
}
```

### 1b. `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "strict": false,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": ".",
    "skipLibCheck": true
  },
  "include": ["server/**/*", "content/**/*"]
}
```

### 1c. `config.yaml`

```yaml
title: Physics 132L Lab Notebook
description: Interactive laboratory notebook for Physics 132L
contentDir: content
theme:
  primary: "#1565C0"
  accent: "#FF6F00"
```

### 1d. `server/app.ts`

```typescript
import {MathigonStudioApp} from '@mathigon/studio/server/app';

const studio = new MathigonStudioApp()
  .setup({sessionSecret: 'physics132L-secret'})
  .get('/', (req, res) => res.render('home.pug'))
  .get('/courses', (req, res) => res.render('courses.pug'))
  .course({})
  .errors()
  .listen(8080);
```

### 1e. `server/templates/home.pug`

```pug
extends ../node_modules/@mathigon/studio/server/templates/layout.pug

block content
  h1 Physics 132L Lab Notebook
  p Welcome! Select a lab below to get started.
  a(href="/courses") View All Labs
```

### 1f. `server/templates/courses.pug`

```pug
extends ../node_modules/@mathigon/studio/server/templates/layout.pug

block content
  h1 Available Labs
  ul
    li: a(href="/course/vectors") Lab 1 — Vectors
    li: a(href="/course/kinematics") Lab 2 — Kinematics (v vs t)
    li: a(href="/course/forces") Lab 3 — Forces & Hooke's Law
```

---

## 2. Install Dependencies

```bash
cd physics132L
npm install
```

---

## 3. Shared Utilities

Create `content/shared/types.ts` — this file is intentionally minimal:

```typescript
// Shared type re-exports for lab content scripts
export type {Step} from '@mathigon/studio';
```

---

## 4. Lab 1 — Vectors

### File: `content/vectors/content.md`

```markdown
# Vectors

> color: "#1565C0"
> description: Understand vector addition, subtraction, dot product and cross product interactively.

## What is a Vector?

> section: intro
> id: intro-slider

A **vector** has magnitude and direction. Set components: x = ${vx}{vx|3|-5,5,1}, y = ${vy}{vy|2|-5,5,1}

Magnitude ≈ **${round(sqrt(vx*vx + vy*vy), 2)}**

    figure: svg#vector-intro(width=340 height=340)

---

## Vector Addition

> section: addition
> id: addition-interactive

**a**: x = ${ax}{ax|2|-4,4,1}, y = ${ay}{ay|1|-4,4,1} &nbsp;&nbsp; **b**: x = ${bx}{bx|1|-4,4,1}, y = ${by}{by|3|-4,4,1}

**a + b** = (${ax+bx}, ${ay+by})

    figure: svg#vector-add(width=340 height=340)

---

## Vector Subtraction

> section: subtraction
> id: sub-interactive

**a**: x = ${ax2}{ax2|3|-4,4,1}, y = ${ay2}{ay2|2|-4,4,1} &nbsp;&nbsp; **b**: x = ${bx2}{bx2|1|-4,4,1}, y = ${by2}{by2|3|-4,4,1}

**a − b** = (${ax2-bx2}, ${ay2-by2})

    figure: svg#vector-sub(width=340 height=340)

---

## Dot Product

> section: dot-product
> id: dot-interactive

**a**: x = ${dax}{dax|3|-4,4,1}, y = ${day}{day|1|-4,4,1} &nbsp;&nbsp; **b**: x = ${dbx}{dbx|1|-4,4,1}, y = ${dby}{dby|2|-4,4,1}

**a · b** = ${dax*dbx + day*dby} &nbsp;&nbsp; Angle ≈ **${round(acos(max(-1,min(1,(dax*dbx+day*dby)/(max(0.01,sqrt(dax*dax+day*day))*max(0.01,sqrt(dbx*dbx+dby*dby))))))*180/pi, 1)}°**

    figure: svg#vector-dot(width=340 height=340)

---

## Cross Product

> section: cross-product
> id: cross-interactive

**a**: x = ${cax}{cax|3|-4,4,1}, y = ${cay}{cay|1|-4,4,1} &nbsp;&nbsp; **b**: x = ${cbx}{cbx|1|-4,4,1}, y = ${cby}{cby|2|-4,4,1}

**a × b** = ${cax*cby - cay*cbx} &nbsp;&nbsp; Parallelogram area = **${abs(cax*cby - cay*cbx)}** sq units

    figure: svg#vector-cross(width=340 height=340)

---

## Summary

> section: summary
> id: summary-1

| Operation | Formula | Result Type |
|-----------|---------|-------------|
| Addition | (a_x+b_x, a_y+b_y) | Vector |
| Subtraction | (a_x−b_x, a_y−b_y) | Vector |
| Dot Product | a_x·b_x + a_y·b_y | Scalar |
| Cross Product | a_x·b_y − a_y·b_x | Scalar (2D) |
```

### File: `content/vectors/functions.ts`

```typescript
import {Step} from '@mathigon/studio';

const S = 340, O = S / 2, SC = 30;
const NS = 'http://www.w3.org/2000/svg';
const px = (v: number) => O + v * SC;

function drawGrid(svg: SVGSVGElement) {
  for (let i = -5; i <= 5; i++) {
    const vl = document.createElementNS(NS, 'line');
    vl.setAttribute('x1', String(px(i))); vl.setAttribute('y1', '0');
    vl.setAttribute('x2', String(px(i))); vl.setAttribute('y2', String(S));
    vl.setAttribute('stroke', i === 0 ? '#555' : '#e0e0e0');
    vl.setAttribute('stroke-width', i === 0 ? '1.5' : '0.5');
    svg.appendChild(vl);

    const hl = document.createElementNS(NS, 'line');
    hl.setAttribute('x1', '0'); hl.setAttribute('y1', String(px(i)));
    hl.setAttribute('x2', String(S)); hl.setAttribute('y2', String(px(i)));
    hl.setAttribute('stroke', i === 0 ? '#555' : '#e0e0e0');
    hl.setAttribute('stroke-width', i === 0 ? '1.5' : '0.5');
    svg.appendChild(hl);

    if (i !== 0) {
      const tx = document.createElementNS(NS, 'text');
      tx.setAttribute('x', String(px(i))); tx.setAttribute('y', String(O + 14));
      tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('font-size', '9');
      tx.setAttribute('fill', '#aaa'); tx.textContent = String(i);
      svg.appendChild(tx);

      const ty = document.createElementNS(NS, 'text');
      ty.setAttribute('x', String(O + 6)); ty.setAttribute('y', String(px(-i) + 3));
      ty.setAttribute('font-size', '9'); ty.setAttribute('fill', '#aaa');
      ty.textContent = String(i);
      svg.appendChild(ty);
    }
  }
}

function arrow(svg: SVGSVGElement, x1: number, y1: number, x2: number, y2: number,
               color: string, label: string, uid: string) {
  const mid = `mk-${uid}`;
  const defs = document.createElementNS(NS, 'defs');
  const mk = document.createElementNS(NS, 'marker');
  mk.setAttribute('id', mid); mk.setAttribute('markerWidth', '8');
  mk.setAttribute('markerHeight', '8'); mk.setAttribute('refX', '6');
  mk.setAttribute('refY', '3'); mk.setAttribute('orient', 'auto');
  const poly = document.createElementNS(NS, 'polygon');
  poly.setAttribute('points', '0 0, 6 3, 0 6'); poly.setAttribute('fill', color);
  mk.appendChild(poly); defs.appendChild(mk); svg.appendChild(defs);

  // dashed component lines
  for (const [a, b, c, d] of [[x1, y2, x2, y2], [x1, y1, x1, y2]]) {
    const dl = document.createElementNS(NS, 'line');
    dl.setAttribute('x1', String(a)); dl.setAttribute('y1', String(b));
    dl.setAttribute('x2', String(c)); dl.setAttribute('y2', String(d));
    dl.setAttribute('stroke', color); dl.setAttribute('stroke-dasharray', '4,3');
    dl.setAttribute('stroke-width', '1'); dl.setAttribute('opacity', '0.35');
    svg.appendChild(dl);
  }

  const ln = document.createElementNS(NS, 'line');
  ln.setAttribute('x1', String(x1)); ln.setAttribute('y1', String(y1));
  ln.setAttribute('x2', String(x2)); ln.setAttribute('y2', String(y2));
  ln.setAttribute('stroke', color); ln.setAttribute('stroke-width', '2.5');
  ln.setAttribute('marker-end', `url(#${mid})`);
  svg.appendChild(ln);

  const tx = document.createElementNS(NS, 'text');
  tx.setAttribute('x', String(x2 + 7)); tx.setAttribute('y', String(y2 - 5));
  tx.setAttribute('fill', color); tx.setAttribute('font-size', '13');
  tx.setAttribute('font-weight', 'bold'); tx.textContent = label;
  svg.appendChild(tx);
}

function parallelogram(svg: SVGSVGElement, ax: number, ay: number, bx: number, by: number) {
  const poly = document.createElementNS(NS, 'polygon');
  const pts = [[O,O],[px(ax),px(-ay)],[px(ax+bx),px(-(ay+by))],[px(bx),px(-by)]]
    .map(p => p.join(',')).join(' ');
  poly.setAttribute('points', pts);
  poly.setAttribute('fill', 'rgba(21,101,192,0.1)');
  poly.setAttribute('stroke', '#1565C0');
  poly.setAttribute('stroke-width', '1');
  poly.setAttribute('stroke-dasharray', '5,3');
  svg.appendChild(poly);
}

function redraw(svgId: string, fn: (svg: SVGSVGElement) => void) {
  const svg = document.querySelector(`#${svgId}`) as SVGSVGElement | null;
  if (!svg) return;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  drawGrid(svg);
  fn(svg);
}

export function introSlider($step: Step) {
  $step.model.watch(() => {
    const vx = $step.model.vx ?? 3, vy = $step.model.vy ?? 2;
    redraw('vector-intro', svg => arrow(svg, O, O, px(vx), px(-vy), '#E91E63', 'v', 'vi'));
  });
}

export function additionInteractive($step: Step) {
  $step.model.watch(() => {
    const ax = $step.model.ax ?? 2, ay = $step.model.ay ?? 1;
    const bx = $step.model.bx ?? 1, by = $step.model.by ?? 3;
    redraw('vector-add', svg => {
      arrow(svg, O, O, px(ax), px(-ay), '#E91E63', 'a', 'aa');
      arrow(svg, px(ax), px(-ay), px(ax+bx), px(-(ay+by)), '#4CAF50', 'b', 'ab');
      arrow(svg, O, O, px(ax+bx), px(-(ay+by)), '#1565C0', 'a+b', 'asum');
    });
  });
}

export function subInteractive($step: Step) {
  $step.model.watch(() => {
    const ax2 = $step.model.ax2 ?? 3, ay2 = $step.model.ay2 ?? 2;
    const bx2 = $step.model.bx2 ?? 1, by2 = $step.model.by2 ?? 3;
    redraw('vector-sub', svg => {
      arrow(svg, O, O, px(ax2), px(-ay2), '#E91E63', 'a', 'sa');
      arrow(svg, O, O, px(bx2), px(-by2), '#4CAF50', 'b', 'sb');
      arrow(svg, px(bx2), px(-by2), px(ax2), px(-ay2), '#FF9800', 'a−b', 'sd');
    });
  });
}

export function dotInteractive($step: Step) {
  $step.model.watch(() => {
    const dax = $step.model.dax ?? 3, day = $step.model.day ?? 1;
    const dbx = $step.model.dbx ?? 1, dby = $step.model.dby ?? 2;
    redraw('vector-dot', svg => {
      arrow(svg, O, O, px(dax), px(-day), '#E91E63', 'a', 'da');
      arrow(svg, O, O, px(dbx), px(-dby), '#4CAF50', 'b', 'db');
    });
  });
}

export function crossInteractive($step: Step) {
  $step.model.watch(() => {
    const cax = $step.model.cax ?? 3, cay = $step.model.cay ?? 1;
    const cbx = $step.model.cbx ?? 1, cby = $step.model.cby ?? 2;
    redraw('vector-cross', svg => {
      parallelogram(svg, cax, cay, cbx, cby);
      arrow(svg, O, O, px(cax), px(-cay), '#E91E63', 'a', 'ca');
      arrow(svg, O, O, px(cbx), px(-cby), '#4CAF50', 'b', 'cb');
    });
  });
}
```

### File: `content/vectors/styles.scss`

```scss
.course-vectors {
  figure svg {
    display: block;
    margin: 1rem auto;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: #fafafa;
  }
}
```

---

## 5. Lab 2 — Kinematics: v vs t Data Table + Live Plot

This lab lets students enter (t, v) data into a table. A scatter plot and linear fit
update live. The slope is displayed as the measured acceleration.

### File: `content/kinematics/content.md`

```markdown
# Kinematics — Velocity vs Time

> color: "#FF6F00"
> description: Measure velocity at different times, plot your data, and extract acceleration from the slope.

## Background

> section: background
> id: background-1

In uniform acceleration, velocity and time are related by:

**v = v₀ + at**

where **a** is acceleration (the slope of a v-t graph) and **v₀** is the initial velocity
(the y-intercept). In this lab you will enter your measurements and the graph will
fit a straight line automatically.

---

## Data Entry & Live Plot

> section: data-lab
> id: data-table

Enter your (t, v) measurements in the table. The scatter plot and best-fit line
will update as you type.

    .lab-container
      .data-panel
        h3 Data Table
        table.vt-table
          thead
            tr
              th Time t (s)
              th Velocity v (m/s)
          tbody
            - for (let i = 0; i < 8; i++)
              tr
                td: input.t-val(type="number" step="0.1" placeholder=`t${i+1}`)
                td: input.v-val(type="number" step="0.1" placeholder=`v${i+1}`)
        .results-box#fit-results
          p Enter at least 2 data points to see the fit.

      .plot-panel
        svg#vt-plot(width=360 height=360)

---

## Analysis Questions

> section: analysis
> id: analysis-1

Based on your graph, answer the following:

1. What is the measured acceleration from the slope of your best-fit line?
2. Does your y-intercept make physical sense? What does it represent?
3. Estimate the uncertainty in your slope by considering how much the line could
   rotate and still pass through most of your data points.
```

### File: `content/kinematics/functions.ts`

```typescript
import {Step} from '@mathigon/studio';

const NS = 'http://www.w3.org/2000/svg';
const W = 360, H = 360;
const PAD = {top: 20, right: 20, bottom: 50, left: 55};
const PW = W - PAD.left - PAD.right;
const PH = H - PAD.top - PAD.bottom;

// ── math helpers ──────────────────────────────────────────────────────────

function linFit(xs: number[], ys: number[]) {
  const n = xs.length;
  if (n < 2) return null;
  const sx = xs.reduce((a, b) => a + b, 0);
  const sy = ys.reduce((a, b) => a + b, 0);
  const sxy = xs.reduce((a, b, i) => a + b * ys[i], 0);
  const sx2 = xs.reduce((a, b) => a + b * b, 0);
  const denom = n * sx2 - sx * sx;
  if (Math.abs(denom) < 1e-10) return null;
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  return {slope, intercept};
}

// ── plot helpers ──────────────────────────────────────────────────────────

function scaleX(x: number, xMin: number, xMax: number) {
  return PAD.left + ((x - xMin) / (xMax - xMin)) * PW;
}

function scaleY(y: number, yMin: number, yMax: number) {
  return PAD.top + PH - ((y - yMin) / (yMax - yMin)) * PH;
}

function niceRange(vals: number[]) {
  const mn = Math.min(...vals), mx = Math.max(...vals);
  const pad = (mx - mn) * 0.15 || 1;
  return [mn - pad, mx + pad];
}

function el(tag: string, attrs: Record<string, string>) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}

function drawAxes(svg: SVGSVGElement, xMin: number, xMax: number, yMin: number, yMax: number) {
  // background
  svg.appendChild(el('rect', {x:'0',y:'0',width:String(W),height:String(H),fill:'#fafafa'}));

  // grid lines (5 ticks each axis)
  for (let i = 0; i <= 5; i++) {
    const xv = xMin + i * (xMax - xMin) / 5;
    const xp = String(scaleX(xv, xMin, xMax));
    svg.appendChild(el('line', {x1:xp,y1:String(PAD.top),x2:xp,y2:String(PAD.top+PH),
      stroke:'#e0e0e0','stroke-width':'0.8'}));
    const xt = el('text', {x:xp,y:String(PAD.top+PH+18),'text-anchor':'middle',
      'font-size':'11',fill:'#888'});
    xt.textContent = xv.toFixed(1);
    svg.appendChild(xt);

    const yv = yMin + i * (yMax - yMin) / 5;
    const yp = String(scaleY(yv, yMin, yMax));
    svg.appendChild(el('line', {x1:String(PAD.left),y1:yp,x2:String(PAD.left+PW),y2:yp,
      stroke:'#e0e0e0','stroke-width':'0.8'}));
    const yt = el('text', {x:String(PAD.left-8),y:yp,'text-anchor':'end',
      'dominant-baseline':'middle','font-size':'11',fill:'#888'});
    yt.textContent = yv.toFixed(1);
    svg.appendChild(yt);
  }

  // axes
  svg.appendChild(el('line', {x1:String(PAD.left),y1:String(PAD.top),
    x2:String(PAD.left),y2:String(PAD.top+PH),stroke:'#555','stroke-width':'1.5'}));
  svg.appendChild(el('line', {x1:String(PAD.left),y1:String(PAD.top+PH),
    x2:String(PAD.left+PW),y2:String(PAD.top+PH),stroke:'#555','stroke-width':'1.5'}));

  // axis labels
  const xl = el('text', {x:String(PAD.left+PW/2),y:String(H-4),
    'text-anchor':'middle','font-size':'13',fill:'#333','font-weight':'bold'});
  xl.textContent = 'Time t (s)';
  svg.appendChild(xl);

  const yl = el('text', {x:'14',y:String(PAD.top+PH/2),
    'text-anchor':'middle','font-size':'13',fill:'#333',
    'font-weight':'bold',transform:`rotate(-90,14,${PAD.top+PH/2})`});
  yl.textContent = 'Velocity v (m/s)';
  svg.appendChild(yl);
}

function renderPlot(svg: SVGSVGElement, xs: number[], ys: number[]) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);

  if (xs.length === 0) {
    svg.appendChild(el('rect', {x:'0',y:'0',width:String(W),height:String(H),fill:'#fafafa'}));
    const t = el('text', {x:String(W/2),y:String(H/2),'text-anchor':'middle',
      'font-size':'13',fill:'#bbb'});
    t.textContent = 'Enter data to plot';
    svg.appendChild(t);
    return;
  }

  const [xMin, xMax] = niceRange(xs);
  const [yMin, yMax] = niceRange(ys);
  drawAxes(svg, xMin, xMax, yMin, yMax);

  // best fit line
  const fit = linFit(xs, ys);
  if (fit) {
    const x1 = xMin, y1 = fit.slope * x1 + fit.intercept;
    const x2 = xMax, y2 = fit.slope * x2 + fit.intercept;
    svg.appendChild(el('line', {
      x1: String(scaleX(x1, xMin, xMax)), y1: String(scaleY(y1, yMin, yMax)),
      x2: String(scaleX(x2, xMin, xMax)), y2: String(scaleY(y2, yMin, yMax)),
      stroke: '#FF6F00', 'stroke-width': '2', 'stroke-dasharray': '6,3', opacity:'0.8'
    }));
  }

  // data points
  for (let i = 0; i < xs.length; i++) {
    svg.appendChild(el('circle', {
      cx: String(scaleX(xs[i], xMin, xMax)),
      cy: String(scaleY(ys[i], yMin, yMax)),
      r: '5', fill: '#1565C0', stroke: 'white', 'stroke-width': '1.5'
    }));
  }
}

function updateResults(container: Element, xs: number[], ys: number[]) {
  const fit = linFit(xs, ys);
  if (!fit) {
    container.innerHTML = '<p>Enter at least 2 data points to see the fit.</p>';
    return;
  }
  const sign = fit.intercept >= 0 ? '+' : '−';
  const intercept = Math.abs(fit.intercept).toFixed(3);
  container.innerHTML = `
    <p><strong>Best-fit line:</strong></p>
    <p class="fit-eq">v = ${fit.slope.toFixed(3)} t ${sign} ${intercept}</p>
    <p><strong>Slope (acceleration):</strong> ${fit.slope.toFixed(3)} m/s²</p>
    <p><strong>y-intercept (v₀):</strong> ${fit.intercept.toFixed(3)} m/s</p>
    <p><em>N = ${xs.length} points</em></p>
  `;
}

// ── Step export ───────────────────────────────────────────────────────────

export function dataTable($step: Step) {
  const container = $step.$el._el as HTMLElement;

  const readData = () => {
    const tInputs = Array.from(container.querySelectorAll('.t-val')) as HTMLInputElement[];
    const vInputs = Array.from(container.querySelectorAll('.v-val')) as HTMLInputElement[];
    const xs: number[] = [], ys: number[] = [];
    for (let i = 0; i < tInputs.length; i++) {
      const t = parseFloat(tInputs[i].value);
      const v = parseFloat(vInputs[i].value);
      if (!isNaN(t) && !isNaN(v)) { xs.push(t); ys.push(v); }
    }
    return {xs, ys};
  };

  const refresh = () => {
    const {xs, ys} = readData();
    const svg = container.querySelector('#vt-plot') as SVGSVGElement | null;
    const results = container.querySelector('#fit-results');
    if (svg) renderPlot(svg, xs, ys);
    if (results) updateResults(results, xs, ys);
  };

  // attach listeners after DOM settles
  setTimeout(() => {
    container.querySelectorAll('.t-val, .v-val').forEach(inp => {
      inp.addEventListener('input', refresh);
    });
    refresh();
  }, 100);
}
```

### File: `content/kinematics/styles.scss`

```scss
.course-kinematics {
  .lab-container {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin: 1rem 0;
  }

  .data-panel {
    flex: 0 0 auto;

    h3 {
      margin-bottom: 0.5rem;
      color: #FF6F00;
      font-size: 1rem;
    }
  }

  .vt-table {
    border-collapse: collapse;

    th {
      background: #FF6F00;
      color: white;
      padding: 6px 12px;
      font-size: 0.85rem;
    }

    td {
      border: 1px solid #e0e0e0;
      padding: 2px 4px;
    }

    input {
      width: 80px;
      border: none;
      outline: none;
      padding: 4px 6px;
      font-size: 0.9rem;
      background: transparent;

      &:focus {
        background: #fff8e1;
      }
    }
  }

  .results-box {
    margin-top: 1rem;
    padding: 10px 14px;
    background: #fff3e0;
    border-left: 3px solid #FF6F00;
    border-radius: 4px;
    font-size: 0.9rem;
    min-width: 220px;

    .fit-eq {
      font-family: monospace;
      font-size: 1rem;
      color: #E65100;
    }
  }

  .plot-panel {
    svg {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }
  }
}
```

---

## 6. Build & Run

```bash
# Install
npm install

# Development (auto-watch + reload)
npm run dev

# Visit
open http://localhost:8080
```

---

## 7. Rules for the Agent — DO NOT VIOLATE

These rules prevent the most common Mathigon build failures:

| Rule | Reason |
|------|--------|
| Sliders must be **inline** in a sentence: `x = ${v}{v\|3\|-5,5,1}` | PUG parses line-start labels as HTML tags |
| All `${expr}` must use explicit `*` for multiplication | `vxvx` is undefined; `vx*vx` is correct |
| Export function names must be **camelCase** of the step `id` kebab-case | `my-step` → `myStep` |
| Import `Step` from `@mathigon/studio`, not relative paths | Relative `../shared/types` does not exist |
| Never call `redraw()` outside of `$step.model.watch()` | DOM is not ready at function call time |
| Use `setTimeout(..., 100)` when attaching DOM listeners in steps | Ensures PUG-rendered elements exist |
| Run `npx mgon-build --assets` after every content change | Server does not hot-reload content |
| Every `content.md` needs `> color:` and `> description:` | Build warns and course may not appear |
| Every section block needs `> section:` AND `> id:` | Missing id = no function binding |

---

## 8. Adding Future Labs

To add a new lab (e.g. Lab 3 — Hooke's Law):

1. Create `content/hookes-law/` directory
2. Add `content.md`, `functions.ts`, `styles.scss` following the patterns above
3. Add the route to `server/templates/courses.pug`
4. Run `npx mgon-build --assets`
5. Visit `http://localhost:8080/course/hookes-law`

Suggested future labs for Physics 132L:
- `hookes-law` — F vs x data table, slope = spring constant k
- `pendulum` — T vs L data, log-log plot, extract g
- `circuits` — V vs I (Ohm's law), interactive resistance slider
- `optics` — 1/f = 1/do + 1/di lens equation calculator
- `wave-interference` — two-source path difference visualization

---

*End of build instructions.*
