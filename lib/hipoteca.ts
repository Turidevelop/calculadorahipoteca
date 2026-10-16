export type DatosHipoteca = {
  valorCasa: number;
  porcentajeFinanciar: number;
  interesAnual: number;
  años: number;
};

export type ResultadoHipoteca = DatosHipoteca & {
  montoPrestamo: number;
  numeroPagos: number;
  cuotaMensual: number;
  totalPagar: number;
  totalIntereses: number;
};

export type FilaAmortizacion = {
  año: number;
  cuotas: number;
  intereses: number;
  capital: number;
  pendiente: number;
};

export type CamposHipoteca = Record<keyof DatosHipoteca, string>;

function aNumero(texto: string): number {
  const limpio = texto.trim().replace(",", ".");
  return limpio === "" ? NaN : Number(limpio);
}

// Convierte y valida los campos del formulario. Devuelve los datos o un mensaje de error.
export function validar(
  campos: CamposHipoteca,
): { ok: true; datos: DatosHipoteca } | { ok: false; error: string } {
  const valorCasa = aNumero(campos.valorCasa);
  const porcentajeFinanciar = aNumero(campos.porcentajeFinanciar);
  const interesAnual = aNumero(campos.interesAnual);
  const años = aNumero(campos.años);

  if ([valorCasa, porcentajeFinanciar, interesAnual, años].some((n) => !Number.isFinite(n)) || !Number.isInteger(años)) {
    return { ok: false, error: "Por favor, introduce valores numéricos válidos en todos los campos" };
  }
  if (valorCasa <= 0) {
    return { ok: false, error: "El valor de la casa debe ser mayor a 0" };
  }
  if (porcentajeFinanciar <= 0 || porcentajeFinanciar > 100) {
    return { ok: false, error: "El porcentaje a financiar debe estar entre 0 y 100" };
  }
  if (interesAnual < 0) {
    return { ok: false, error: "El interés no puede ser negativo" };
  }
  if (años <= 0) {
    return { ok: false, error: "La cantidad de años debe ser mayor a 0" };
  }

  return { ok: true, datos: { valorCasa, porcentajeFinanciar, interesAnual, años } };
}

export function calcularHipoteca(datos: DatosHipoteca): ResultadoHipoteca {
  const montoPrestamo = datos.valorCasa * (datos.porcentajeFinanciar / 100);
  const interesMensual = datos.interesAnual / 100 / 12;
  const numeroPagos = datos.años * 12;

  let cuotaMensual: number;
  if (interesMensual === 0) {
    // Caso especial: interés 0%
    cuotaMensual = montoPrestamo / numeroPagos;
  } else {
    const factor = (1 + interesMensual) ** numeroPagos;
    cuotaMensual = (montoPrestamo * (interesMensual * factor)) / (factor - 1);
  }

  const totalPagar = cuotaMensual * numeroPagos;

  return {
    ...datos,
    montoPrestamo,
    numeroPagos,
    cuotaMensual,
    totalPagar,
    totalIntereses: totalPagar - montoPrestamo,
  };
}

// Cuadro de amortización (sistema francés) agrupado por años.
export function tablaAmortizacion(resultado: ResultadoHipoteca): FilaAmortizacion[] {
  const interesMensual = resultado.interesAnual / 100 / 12;
  const filas: FilaAmortizacion[] = [];
  let pendiente = resultado.montoPrestamo;

  for (let año = 1; año <= resultado.años; año++) {
    let intereses = 0;
    let capital = 0;
    for (let mes = 0; mes < 12; mes++) {
      const interesMes = pendiente * interesMensual;
      const capitalMes = resultado.cuotaMensual - interesMes;
      intereses += interesMes;
      capital += capitalMes;
      pendiente -= capitalMes;
    }
    filas.push({
      año,
      cuotas: resultado.cuotaMensual * 12,
      intereses,
      capital,
      pendiente: Math.max(0, Math.abs(pendiente) < 0.005 ? 0 : pendiente),
    });
  }

  return filas;
}

const formatoEuros = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: "always",
});

export function euros(valor: number): string {
  return formatoEuros.format(valor);
}
