"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { cn } from "@/lib/utils/cn";
import type { Antropometria } from "@/types";

type Metrica = "peso" | "porcentaje_grasa" | "cintura" | "cadera";

const METRICAS: { key: Metrica; label: string; unidad: string; color: string }[] = [
  { key: "peso", label: "Peso", unidad: "kg", color: "#16a34a" },
  { key: "porcentaje_grasa", label: "% Grasa", unidad: "%", color: "#dc2626" },
  { key: "cintura", label: "Cintura", unidad: "cm", color: "#2563eb" },
  { key: "cadera", label: "Cadera", unidad: "cm", color: "#9333ea" },
];

interface EvolucionChartProps {
  data: Antropometria[];
  className?: string;
}

export function EvolucionChart({ data, className }: EvolucionChartProps) {
  const [metrica, setMetrica] = useState<Metrica>("peso");

  const metricaActual = METRICAS.find((m) => m.key === metrica)!;

  // Ordenar por fecha ascendente para el gráfico
  const chartData = [...data]
    .reverse()
    .map((m) => ({
      fecha: m.fecha,
      valor: m[metrica],
    }))
    .filter((d) => d.valor != null);

  // Calcular rango para YAxis con margen
  const valores = chartData.map((d) => d.valor as number);
  const minVal = valores.length > 0 ? Math.min(...valores) : 0;
  const maxVal = valores.length > 0 ? Math.max(...valores) : 100;
  const padding = (maxVal - minVal) * 0.15 || 5;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selector de métrica */}
      <div className="flex flex-wrap gap-2">
        {METRICAS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetrica(m.key)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              metrica === m.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Gráfico */}
      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <p className="text-sm text-slate-400">Sin datos para mostrar</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id={`fill-${metrica}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricaActual.color} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={metricaActual.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="fecha"
                tickFormatter={(val: string) => {
                  const d = parseISO(val);
                  return format(d, "d MMM", { locale: es });
                }}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[Math.floor(minVal - padding), Math.ceil(maxVal + padding)]}
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                unit={metricaActual.unidad === "%" ? "%" : ""}
                width={45}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
                labelFormatter={(label) => {
                  if (typeof label !== "string") return label;
                  const d = parseISO(label);
                  return format(d, "d 'de' MMMM yyyy", { locale: es });
                }}
                formatter={(value) => {
                  if (typeof value !== "number") return ["—", metricaActual.label];
                  return [`${value} ${metricaActual.unidad}`, metricaActual.label];
                }}
              />
              <Area type="monotone" dataKey="valor" stroke="none" fill={`url(#fill-${metrica})`} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={metricaActual.color}
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: "white",
                  stroke: metricaActual.color,
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: metricaActual.color,
                  stroke: "white",
                  strokeWidth: 2,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Leyenda de última medición */}
      {chartData.length > 0 && (
        <div className="flex items-center justify-center gap-6 text-sm">
          <span className="text-slate-500">
            {chartData.length} {chartData.length === 1 ? "medición" : "mediciones"}
          </span>
          <span className="text-slate-500">
            Última:{" "}
            <span className="font-semibold text-slate-900">
              {chartData[chartData.length - 1].valor} {metricaActual.unidad}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
