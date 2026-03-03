# Physics 132L — Interactive Lab Notebook

This is a Mathigon Studio-based interactive lab notebook for a university Physics 132L course.
It provides web-based labs with sliders, SVG visualisations, and live data analysis.

## Structure

- `config.yaml` – global Mathigon Studio configuration.
- `server/` – TypeScript server entry and Pug templates.
- `frontend/` – static frontend assets (optional, currently empty).
- `content/` – course content, scripts, and styles for each lab.

Current labs:

- `vectors` – interactive 2D vectors, addition, subtraction, dot and cross product.
- `kinematics` – velocity vs time table, live scatter plot and linear fit.

## Install

```bash
cd physics132L
npm install
```

## Development

```bash
npm run dev
```

Then open `http://localhost:8080` in your browser.

## Production build

```bash
npm run build
npm start
```

