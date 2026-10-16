import Image from "next/image";
import CalculadoraHipoteca from "@/components/CalculadoraHipoteca";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10 sm:py-14">
      <header className="flex items-center gap-4">
        <Image src="/turidevicon.png" alt="" width={56} height={56} priority className="rounded-xl" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Calculadora de hipotecas</h1>
          <p className="text-sm text-muted">
            Cuota mensual según el valor de la vivienda, la financiación, el interés fijo y el plazo.
          </p>
        </div>
      </header>

      <CalculadoraHipoteca />

      <p className="text-center text-xs text-muted">
        Nota: este cálculo no incluye seguros, impuestos u otros gastos adicionales.
      </p>
    </main>
  );
}
