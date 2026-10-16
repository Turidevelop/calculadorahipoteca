"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import {
  aNumero,
  calcularHipoteca,
  euros,
  tablaAmortizacion,
  validar,
  type CamposHipoteca,
  type ResultadoHipoteca,
} from "@/lib/hipoteca";
import {
  COMUNIDADES,
  buscarComunidad,
  calcularImpuestos,
  nombreIndirecto,
  tiposPorDefecto,
  type ResultadoImpuestos,
  type TipoVivienda,
} from "@/lib/impuestos";

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

type TiposImpuesto = { itp: string; indirecto: string; ajd: string };

const COMUNIDAD_INICIAL = "madrid";

function tiposComoTexto(comunidadId: string, vpo: boolean): TiposImpuesto {
  const t = tiposPorDefecto(buscarComunidad(comunidadId), vpo);
  return { itp: String(t.itp), indirecto: String(t.indirecto), ajd: String(t.ajd) };
}

const porcentaje = (n: number) => `${n.toLocaleString("es-ES")} %`;

type Resultado = { hipoteca: ResultadoHipoteca; impuestos: ResultadoImpuestos | null };

export default function CalculadoraHipoteca() {
  const [campos, setCampos] = useState<CamposHipoteca>(VALORES_INICIALES);
  const [conImpuestos, setConImpuestos] = useState(false);
  const [tipoVivienda, setTipoVivienda] = useState<TipoVivienda>("segunda-mano");
  const [comunidadId, setComunidadId] = useState(COMUNIDAD_INICIAL);
  const [vpo, setVpo] = useState(false);
  const [tipos, setTipos] = useState<TiposImpuesto>(() => tiposComoTexto(COMUNIDAD_INICIAL, false));
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const comunidad = buscarComunidad(comunidadId);

  function cambiarComunidad(id: string) {
    setComunidadId(id);
    setTipos(tiposComoTexto(id, vpo));
  }

  function cambiarVpo(valor: boolean) {
    setVpo(valor);
    setTipos(tiposComoTexto(comunidadId, valor));
  }

  function calcular(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validacion = validar(campos);
    if (!validacion.ok) {
      setError(validacion.error);
      setResultado(null);
      return;
    }

    let impuestos: ResultadoImpuestos | null = null;
    if (conImpuestos) {
      const numeros = { itp: aNumero(tipos.itp), indirecto: aNumero(tipos.indirecto), ajd: aNumero(tipos.ajd) };
      const usados = tipoVivienda === "segunda-mano" ? [numeros.itp] : [numeros.indirecto, numeros.ajd];
      if (usados.some((n) => !Number.isFinite(n) || n < 0 || n > 100)) {
        setError("Los tipos de los impuestos deben ser números entre 0 y 100");
        setResultado(null);
        return;
      }
      impuestos = calcularImpuestos(validacion.datos.valorCasa, tipoVivienda, comunidad, numeros);
    }

    setError(null);
    setResultado({ hipoteca: calcularHipoteca(validacion.datos), impuestos });
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
            <CampoNumero
              key={nombre}
              etiqueta={etiqueta}
              sufijo={sufijo}
              paso={paso}
              valor={campos[nombre]}
              onChange={(valor) => setCampos({ ...campos, [nombre]: valor })}
            />
          ))}
        </div>

        <fieldset className="mt-5 border-t border-border pt-5">
          <label className="flex cursor-pointer items-center gap-2.5 font-medium">
            <input
              type="checkbox"
              checked={conImpuestos}
              onChange={(e) => setConImpuestos(e.target.checked)}
              className="size-4 accent-accent"
            />
            Calcular impuestos de la compra (ITP / IVA)
          </label>

          {conImpuestos && (
            <div className="mt-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-background p-1 text-sm font-medium">
                {(
                  [
                    ["segunda-mano", "Segunda mano"],
                    ["obra-nueva", "Obra nueva"],
                  ] as const
                ).map(([valor, texto]) => (
                  <label
                    key={valor}
                    className={`cursor-pointer rounded-md px-3 py-2 text-center transition ${
                      tipoVivienda === valor ? "bg-surface text-accent shadow-sm" : "text-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tipoVivienda"
                      value={valor}
                      checked={tipoVivienda === valor}
                      onChange={() => setTipoVivienda(valor)}
                      className="sr-only"
                    />
                    {texto}
                  </label>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1.5 text-sm font-medium sm:col-span-2">
                  Comunidad autónoma
                  <select
                    value={comunidadId}
                    onChange={(e) => cambiarComunidad(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                  >
                    {COMUNIDADES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </label>

                {tipoVivienda === "segunda-mano" ? (
                  <CampoNumero
                    etiqueta="ITP"
                    sufijo="%"
                    paso="0.1"
                    valor={tipos.itp}
                    onChange={(valor) => setTipos({ ...tipos, itp: valor })}
                  />
                ) : (
                  <>
                    <CampoNumero
                      etiqueta={nombreIndirecto(comunidad)}
                      sufijo="%"
                      paso="0.1"
                      valor={tipos.indirecto}
                      onChange={(valor) => setTipos({ ...tipos, indirecto: valor })}
                    />
                    <CampoNumero
                      etiqueta="AJD (actos jurídicos documentados)"
                      sufijo="%"
                      paso="0.1"
                      valor={tipos.ajd}
                      onChange={(valor) => setTipos({ ...tipos, ajd: valor })}
                    />
                    {!comunidad.indirecto && (
                      <label className="flex cursor-pointer items-center gap-2.5 text-sm sm:col-span-2">
                        <input
                          type="checkbox"
                          checked={vpo}
                          onChange={(e) => cambiarVpo(e.target.checked)}
                          className="size-4 accent-accent"
                        />
                        Vivienda de protección oficial (IVA superreducido del 4 %)
                      </label>
                    )}
                  </>
                )}
              </div>

              <p className="text-xs text-muted">
                Tipos generales orientativos. Puedes ajustarlos: muchas comunidades aplican tramos según el precio y
                tipos reducidos (jóvenes, familia numerosa, discapacidad…).
              </p>
            </div>
          )}
        </fieldset>

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

      {resultado && <Resultados hipoteca={resultado.hipoteca} />}
      {resultado?.impuestos && <Impuestos hipoteca={resultado.hipoteca} impuestos={resultado.impuestos} />}
    </div>
  );
}

function CampoNumero({
  etiqueta,
  sufijo,
  paso,
  valor,
  onChange,
}: {
  etiqueta: string;
  sufijo: string;
  paso: string;
  valor: string;
  onChange: (valor: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {etiqueta}
      <div className="flex items-center rounded-lg border border-border bg-background focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30">
        <input
          type="number"
          inputMode="decimal"
          step={paso}
          min="0"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 text-base outline-none"
        />
        <span className="pr-3 text-muted">{sufijo}</span>
      </div>
    </label>
  );
}

function Tarjeta({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section aria-live="polite" className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{titulo}</h2>
      {children}
    </section>
  );
}

function ListaDatos({ filas }: { filas: [string, string][] }) {
  return (
    <dl className="mt-4 divide-y divide-border text-sm">
      {filas.map(([termino, valor]) => (
        <div key={termino} className="flex justify-between gap-4 py-2">
          <dt className="text-muted">{termino}</dt>
          <dd className="text-right font-medium tabular-nums">{valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function Destacado({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="mt-3 rounded-xl bg-accent/10 p-4 text-center">
      <p className="text-sm text-muted">{etiqueta}</p>
      <p className="text-4xl font-bold tabular-nums text-accent">{valor}</p>
    </div>
  );
}

function Resultados({ hipoteca }: { hipoteca: ResultadoHipoteca }) {
  const filas = tablaAmortizacion(hipoteca);

  return (
    <Tarjeta titulo="Resultado del cálculo">
      <Destacado etiqueta="Cuota mensual" valor={euros(hipoteca.cuotaMensual)} />

      <ListaDatos
        filas={[
          ["Valor de la casa", euros(hipoteca.valorCasa)],
          ["Porcentaje financiado", porcentaje(hipoteca.porcentajeFinanciar)],
          ["Monto del préstamo", euros(hipoteca.montoPrestamo)],
          ["Tipo de interés anual", porcentaje(hipoteca.interesAnual)],
          ["Plazo", `${hipoteca.años} años (${hipoteca.numeroPagos} meses)`],
          ["Total a pagar", euros(hipoteca.totalPagar)],
          ["Total de intereses", euros(hipoteca.totalIntereses)],
        ]}
      />

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
    </Tarjeta>
  );
}

function Impuestos({ hipoteca, impuestos }: { hipoteca: ResultadoHipoteca; impuestos: ResultadoImpuestos }) {
  const entrada = hipoteca.valorCasa - hipoteca.montoPrestamo;
  const tipo = impuestos.tipoVivienda === "segunda-mano" ? "Segunda mano" : "Obra nueva";

  return (
    <Tarjeta titulo="Impuestos de la compra">
      <p className="mt-1 text-sm text-muted">
        {tipo} · {impuestos.comunidad}
      </p>

      <Destacado etiqueta="Ahorro necesario (entrada + impuestos)" valor={euros(entrada + impuestos.total)} />

      <ListaDatos
        filas={[
          ...impuestos.conceptos.map(
            (c): [string, string] => [`${c.nombre} (${porcentaje(c.tipo)})`, euros(c.importe)],
          ),
          ["Total impuestos", euros(impuestos.total)],
          [`Entrada (${porcentaje(100 - hipoteca.porcentajeFinanciar)} no financiado)`, euros(entrada)],
        ]}
      />

      <p className="mt-3 text-xs text-muted">
        Calculado sobre el valor de la casa. Algunas comunidades usan el valor de referencia catastral si es mayor. No
        incluye notaría, registro ni gestoría.
      </p>
    </Tarjeta>
  );
}
