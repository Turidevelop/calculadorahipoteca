"use client";

import { useState, type FormEvent } from "react";
import {
  calcularHipoteca,
  euros,
  tablaAmortizacion,
  validar,
  type CamposHipoteca,
  type ResultadoHipoteca,
} from "@/lib/hipoteca";

const VALORES_INICIALES: CamposHipoteca = {
  valorCasa: "215000",
  porcentajeFinanciar: "90",
  interesAnual: "2.2",
  años: "30",
};

const VACIOS: CamposHipoteca = {
  valorCasa: "",
  porcentajeFinanciar: "",
  interesAnual: "",
  años: "",
};

const CAMPOS: { nombre: keyof CamposHipoteca; etiqueta: string; sufijo: string; paso: string }[] = [
  { nombre: "valorCasa", etiqueta: "Valor de la casa", sufijo: "€", paso: "1000" },
  { nombre: "porcentajeFinanciar", etiqueta: "Porcentaje a financiar", sufijo: "%", paso: "1" },
  { nombre: "interesAnual", etiqueta: "Interés anual", sufijo: "%", paso: "0.01" },
  { nombre: "años", etiqueta: "Cantidad de años", sufijo: "años", paso: "1" },
];

const porcentaje = (n: number) => `${n.toLocaleString("es-ES")} %`;

export default function CalculadoraHipoteca() {
  const [campos, setCampos] = useState<CamposHipoteca>(VALORES_INICIALES);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoHipoteca | null>(null);

  function calcular(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validacion = validar(campos);
    if (!validacion.ok) {
      setError(validacion.error);
      setResultado(null);
      return;
    }
    setError(null);
    setResultado(calcularHipoteca(validacion.datos));
  }

  function limpiar() {
    setCampos(VACIOS);
    setError(null);
    setResultado(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={calcular}
        noValidate
        className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {CAMPOS.map(({ nombre, etiqueta, sufijo, paso }) => (
            <label key={nombre} className="flex flex-col gap-1.5 text-sm font-medium">
              {etiqueta}
              <div className="flex items-center rounded-lg border border-border bg-background focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
                <input
                  type="number"
                  inputMode="decimal"
                  step={paso}
                  min="0"
                  name={nombre}
                  value={campos[nombre]}
                  onChange={(e) => setCampos({ ...campos, [nombre]: e.target.value })}
                  className="w-full min-w-0 bg-transparent px-3 py-2.5 text-base outline-none"
                />
                <span className="pr-3 text-muted">{sufijo}</span>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-white transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Calcular cuota
          </button>
          <button
            type="button"
            onClick={limpiar}
            className="rounded-lg border border-border px-5 py-2.5 font-semibold transition hover:bg-background"
          >
            Limpiar
          </button>
        </div>
      </form>

      {resultado && <Resultados resultado={resultado} />}
    </div>
  );
}

function Resultados({ resultado }: { resultado: ResultadoHipoteca }) {
  const filas = tablaAmortizacion(resultado);
  const detalles: [string, string][] = [
    ["Valor de la casa", euros(resultado.valorCasa)],
    ["Porcentaje financiado", porcentaje(resultado.porcentajeFinanciar)],
    ["Monto del préstamo", euros(resultado.montoPrestamo)],
    ["Tipo de interés anual", porcentaje(resultado.interesAnual)],
    ["Plazo", `${resultado.años} años (${resultado.numeroPagos} meses)`],
    ["Total a pagar", euros(resultado.totalPagar)],
    ["Total de intereses", euros(resultado.totalIntereses)],
  ];

  return (
    <section
      aria-live="polite"
      className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
    >
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
        Resultado del cálculo
      </h2>

      <div className="mt-3 rounded-xl bg-accent/10 p-4 text-center">
        <p className="text-sm text-muted">Cuota mensual</p>
        <p className="text-4xl font-bold tabular-nums text-accent">
          {euros(resultado.cuotaMensual)}
        </p>
      </div>

      <dl className="mt-4 divide-y divide-border text-sm">
        {detalles.map(([termino, valor]) => (
          <div key={termino} className="flex justify-between gap-4 py-2">
            <dt className="text-muted">{termino}</dt>
            <dd className="text-right font-medium tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>

      <details className="group mt-4">
        <summary className="cursor-pointer select-none font-semibold text-accent">
          Ver tabla de amortización anual
        </summary>
        <div className="mt-3 max-h-96 overflow-auto rounded-lg border border-border">
          <table className="w-full min-w-[34rem] text-right text-sm tabular-nums">
            <thead className="sticky top-0 bg-surface text-xs uppercase text-muted">
              <tr>
                <th className="px-3 py-2 text-left">Año</th>
                <th className="px-3 py-2">Pagado</th>
                <th className="px-3 py-2">Intereses</th>
                <th className="px-3 py-2">Capital</th>
                <th className="px-3 py-2">Pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filas.map((fila) => (
                <tr key={fila.año}>
                  <td className="px-3 py-1.5 text-left">{fila.año}</td>
                  <td className="px-3 py-1.5">{euros(fila.cuotas)}</td>
                  <td className="px-3 py-1.5">{euros(fila.intereses)}</td>
                  <td className="px-3 py-1.5">{euros(fila.capital)}</td>
                  <td className="px-3 py-1.5">{euros(fila.pendiente)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
