export type TipoVivienda = "segunda-mano" | "obra-nueva";

export type Comunidad = {
  id: string;
  nombre: string;
  // Tipo general del ITP para vivienda de segunda mano (%).
  itp: number;
  // AJD sobre la escritura de compra de obra nueva (%).
  ajd: number;
  // Impuesto indirecto sobre la obra nueva: IVA en general, IGIC en Canarias.
  indirecto?: { nombre: string; general: number };
};

const IVA = { nombre: "IVA", general: 10 };
const IVA_VPO = 4;

// Tipos generales orientativos. Muchas comunidades aplican tramos según el precio
// y tipos reducidos (jóvenes, familia numerosa, discapacidad, VPO...).
export const COMUNIDADES: Comunidad[] = [
  { id: "andalucia", nombre: "Andalucía", itp: 7, ajd: 1.2 },
  { id: "aragon", nombre: "Aragón", itp: 8, ajd: 1.5 },
  { id: "asturias", nombre: "Asturias", itp: 8, ajd: 1.2 },
  { id: "baleares", nombre: "Illes Balears", itp: 8, ajd: 1.5 },
  { id: "canarias", nombre: "Canarias", itp: 6.5, ajd: 1, indirecto: { nombre: "IGIC", general: 7 } },
  { id: "cantabria", nombre: "Cantabria", itp: 9, ajd: 1.5 },
  { id: "castilla-leon", nombre: "Castilla y León", itp: 8, ajd: 1.5 },
  { id: "castilla-la-mancha", nombre: "Castilla-La Mancha", itp: 9, ajd: 1.5 },
  { id: "cataluna", nombre: "Cataluña", itp: 10, ajd: 1.5 },
  { id: "valencia", nombre: "Comunitat Valenciana", itp: 9, ajd: 1.5 },
  { id: "extremadura", nombre: "Extremadura", itp: 8, ajd: 1.5 },
  { id: "galicia", nombre: "Galicia", itp: 7, ajd: 1.5 },
  { id: "madrid", nombre: "Comunidad de Madrid", itp: 6, ajd: 0.75 },
  { id: "murcia", nombre: "Región de Murcia", itp: 7.75, ajd: 1.5 },
  { id: "navarra", nombre: "Navarra", itp: 6, ajd: 0.5 },
  { id: "pais-vasco", nombre: "País Vasco", itp: 4, ajd: 0.5 },
  { id: "la-rioja", nombre: "La Rioja", itp: 7, ajd: 1 },
];

export function buscarComunidad(id: string): Comunidad {
  return COMUNIDADES.find((c) => c.id === id) ?? COMUNIDADES[0];
}

export function nombreIndirecto(comunidad: Comunidad): string {
  return (comunidad.indirecto ?? IVA).nombre;
}

// Tipos que se proponen al elegir comunidad, tipo de vivienda y VPO.
export function tiposPorDefecto(comunidad: Comunidad, vpo: boolean) {
  const indirecto = comunidad.indirecto ?? IVA;
  return {
    itp: comunidad.itp,
    indirecto: vpo && !comunidad.indirecto ? IVA_VPO : indirecto.general,
    ajd: comunidad.ajd,
  };
}

export type ConceptoImpuesto = { nombre: string; tipo: number; importe: number };

export type ResultadoImpuestos = {
  tipoVivienda: TipoVivienda;
  comunidad: string;
  conceptos: ConceptoImpuesto[];
  total: number;
};

export function calcularImpuestos(
  precio: number,
  tipoVivienda: TipoVivienda,
  comunidad: Comunidad,
  tipos: { itp: number; indirecto: number; ajd: number },
): ResultadoImpuestos {
  const conceptos: ConceptoImpuesto[] =
    tipoVivienda === "segunda-mano"
      ? [{ nombre: "ITP", tipo: tipos.itp, importe: (precio * tipos.itp) / 100 }]
      : [
          { nombre: nombreIndirecto(comunidad), tipo: tipos.indirecto, importe: (precio * tipos.indirecto) / 100 },
          { nombre: "AJD", tipo: tipos.ajd, importe: (precio * tipos.ajd) / 100 },
        ];

  return {
    tipoVivienda,
    comunidad: comunidad.nombre,
    conceptos,
    total: conceptos.reduce((suma, c) => suma + c.importe, 0),
  };
}
