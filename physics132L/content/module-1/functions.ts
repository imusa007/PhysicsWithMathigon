import {Step} from '@mathigon/studio';

const S = 340, O = S / 2, SC = 30;

/** Attach math helpers to the step model so ${...} expressions (round, sqrt, abs, acos, pi, etc.) evaluate. */
function bindVectorMath(model: Record<string, unknown>) {
  model.round = (x: number, n?: number) =>
    n !== undefined ? Number(x.toFixed(n)) : Math.round(x);
  model.sqrt = Math.sqrt;
  model.abs = Math.abs;
  model.acos = Math.acos;
  model.min = Math.min;
  model.max = Math.max;
  model.pi = Math.PI;
}
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
  bindVectorMath($step.model as Record<string, unknown>);
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
  bindVectorMath($step.model as Record<string, unknown>);
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
  bindVectorMath($step.model as Record<string, unknown>);
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

