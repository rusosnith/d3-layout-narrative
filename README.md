# d3-layout-narrative

[XKCD](http://xkcd.com/657/)-style narrative chart layout engine.

**Zero D3 runtime dependency.** Works as a modern ES module in Observable, Vite, Rollup, and any bundler. Also ships a legacy UMD build for D3 v3 script-tag usage.

![Preview](https://cdn.rawgit.com/drzax/81fff35393fb65255621fd0ab8d11bd7/raw/cfc9d4e3063db145db94c9d237f628437180b448/preview.png)

This is a pure layout engine — it computes positions and paths. Rendering and styling are entirely up to you.

---

## Instalación / Install

```bash
npm install d3-layout-narrative
```

O copia directamente `narrative.esm.js` en tu proyecto.

---

## Uso moderno — ES module

```js
import { narrative } from 'd3-layout-narrative';
// o desde un archivo local:
import { narrative } from './narrative.esm.js';
```

### Observable

```js
// En una celda:
import { narrative } from 'https://cdn.jsdelivr.net/npm/d3-layout-narrative/narrative.esm.js';
```

---

## Uso legacy — script tag (D3 v3)

```html
<script src="narrative.js"></script>
<!-- expone d3.layout.narrative() como antes -->
```

---

## API

Todos los métodos son encadenables (chainable). Llamar a `.layout()` al final computa las posiciones.

```js
const layout = narrative()
  .scenes(scenes)          // array de objetos escena
  .characters(characters)  // array de objetos personaje (opcional si cada escena ya referencia objetos)
  .size([width, height])   // guía de tamaño — el extent final puede diferir
  .pathSpace(12)           // espacio en px por línea de personaje
  .groupMargin(16)         // margen entre grupos de personajes
  .labelSize([120, 14])    // [ancho, alto] reservado para etiquetas
  .labelPosition('left')   // 'left' | 'right' | 'above' | 'below'
  .scenePadding([5,6,5,6]) // padding [top, right, bottom, left] de cada escena
  .filterScenes(false)     // true → descarta escenas con un solo participante
  .layout();               // computa todo
```

### Objetos de entrada

**Escena:**
```js
{
  characters: [charA, charB],  // array de objetos personaje
  // opcionales:
  start: 3,                    // posición temporal (número)
  duration: 1,
  x: 200, y: 50               // forzar posición
}
```

**Personaje:**
```js
{
  name: 'Luke',
  // opcionales:
  initialgroup: 0,             // fuerza grupo en clustering
  width: 80, height: 14,       // tamaño de etiqueta individual
  x: 100, y: 50               // forzar posición de introducción
}
```

### Salidas — después de `.layout()`

| Método | Retorna |
|--------|---------|
| `layout.scenes()` | Escenas con `x`, `y`, `width`, `height`, `appearances` |
| `layout.characters()` | Personajes con `group`, `appearances`, `introduction` |
| `layout.links()` | Links `{character, source, target}` — para trazar paths |
| `layout.link()` | Función generadora de path SVG para un link |
| `layout.introductions()` | Nodos de introducción de cada personaje |
| `layout.extent()` | `[width, height]` real del layout |

### Generador de path

```js
const pathGenerator = layout.link().curvature(0.5);

svg.selectAll('.link')
  .data(layout.links())
  .enter().append('path')
  .attr('d', pathGenerator);
```

---

## Ejemplo mínimo completo

```js
import { narrative } from './narrative.esm.js';
import * as d3 from 'd3';

const charA = { name: 'Ana' };
const charB = { name: 'Bruno' };
const charC = { name: 'Carla' };

const layout = narrative()
  .scenes([
    { characters: [charA, charB] },
    { characters: [charA, charB, charC] },
    { characters: [charB, charC] }
  ])
  .size([800, 400])
  .pathSpace(12)
  .groupMargin(8)
  .labelSize([100, 14])
  .labelPosition('left')
  .scenePadding([4, 5, 4, 5])
  .layout();

const svg = d3.select('#chart')
  .append('svg')
  .attr('width', layout.extent()[0])
  .attr('height', layout.extent()[1]);

// Escenas
svg.selectAll('.scene')
  .data(layout.scenes())
  .enter().append('rect')
  .attr('x', d => d.x)
  .attr('y', d => d.y)
  .attr('width', d => d.width || 2)
  .attr('height', d => d.height);

// Links (líneas de personajes)
svg.selectAll('.link')
  .data(layout.links())
  .enter().append('path')
  .attr('fill', 'none')
  .attr('stroke', '#999')
  .attr('d', layout.link());

// Etiquetas de introducción
svg.selectAll('.intro')
  .data(layout.introductions())
  .enter().append('text')
  .attr('x', d => d.x)
  .attr('y', d => d.y)
  .text(d => d.character.name);
```

---

## Build

```bash
# Genera narrative.js (UMD legacy) + narrative.esm.js (ES module)
npm run build

# Solo UMD legacy (requiere grunt)
npm run build:legacy

# Solo ESM
npm run build:esm

# Tests
npm test
npm run test:build
```

---

## Licencia

MIT — ver [LICENSE](LICENSE).
