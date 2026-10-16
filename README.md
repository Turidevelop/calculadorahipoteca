# calculadorahipoteca
Calculadora de cuota mensual hipotecaria según el valor de la vivienda a comprar, el porcentaje de financiación, el interés a tipo fijo y los años de hipoteca.

Incluye el desglose del préstamo (total a pagar e intereses) y una tabla de amortización anual.

## Web (Next.js + pnpm)

Requisitos: Node.js 20.9 o superior y pnpm.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # compilación de producción
pnpm lint
```

### Despliegue en Vercel

Importa el repositorio en [Vercel](https://vercel.com/new). Detecta Next.js y pnpm automáticamente (campo `packageManager` de `package.json`), sin configuración adicional.

## Versión de escritorio

La aplicación de escritorio original (Python + Tkinter, empaquetada con PyInstaller) está en la rama [`app/desktop`](../../tree/app/desktop).
