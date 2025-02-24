import React from "react";
import { scaleBand, scaleLinear, max } from "d3";
import { ProcesoDatos } from "./interfaces/proceso.interface";

// Definimos el tipo para los datos
const data: ProcesoDatos[] = [
  { key: "France", value: 100 },
  { key: "Spain", value: 70 },
  { key: "Italy", value: 60 },
  { key: "Portugal", value: 10 },
  { key: "Germany", value: 10 },
  { key: "Netherlands", value: 30 },
  { key: "Belgium", value: 50 },
  { key: "Austria", value: 20 },
  { key: "Greeece", value: 30 },
].sort((a, b) => b.value - a.value); // Ordenamos los datos

const HorizontalBar: React.FC = () => {
  // Escalas
  const yScale = scaleBand<string>()
    .domain(data.map((d) => d.key))
    .range([0, 100])
    .padding(0.6);

  const xScale = scaleLinear<number>()
    .domain([0, max(data, (d) => d.value) ?? 0])
    .range([0, 100]);

  // Calculamos el ancho máximo de las etiquetas del eje Y
  const longestWord = max(data.map((d) => d.key.length)) ?? 1;

  // Función para determinar el color de la barra
  const getBarColor = (width: number) => {
    if (width > 50) return "bg-pink-300 dark:bg-pink-600";
    if (width > 25) return "bg-purple-300 dark:bg-purple-500";
    if (width > 10) return "bg-indigo-300 dark:bg-indigo-500";
    return "bg-sky-300 dark:bg-sky-500";
  };

  return (
    <div className="bg-white p-4 md:m-1/4 w-full h-[730px]">
      {/* Descripción del gráfico */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Porcentaje de Progreso por Registro
        </h2>
        <p className="text-sm text-gray-500">Estado de Progreso</p>
      </div>

      {/* Contenedor del gráfico */}
      <div
        className="relative w-full h-150"
        style={
          {
            "--marginTop": "10px",
            "--marginRight": "30px",
            "--marginBottom": "10px",
            "--marginLeft": `${longestWord * 7}px`,
          } as React.CSSProperties
        }
      >
        {/* Área del gráfico */}
        <div className="absolute inset-0 z-10 h-[calc(100%-var(--marginTop)-var(--marginBottom))] translate-y-[var(--marginTop)] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] overflow-visible">
          {/* Barras del gráfico */}
          {data.map((d, index) => {
            const barWidth = xScale(d.value);
            const barHeight = yScale.bandwidth();
            const barColor = getBarColor(barWidth);

            return (
              <React.Fragment key={index}>
                <div
                  className={`absolute left-0 ${barColor} transition-all duration-200 ease-in-out hover:opacity-80`}
                  style={{
                    top: `${yScale(d.key)}%`,
                    width: `${barWidth}%`,
                    height: `${barHeight}%`,
                  }}
                  aria-label={`${d.key}: ${d.value}`}
                />
                {/* Punta de la barra */}
                <div
                  className={`absolute ${barColor} rounded-sm`}
                  style={{
                    left: `${barWidth}%`,
                    top: `${yScale(d.key)! + barHeight / 2}%`,
                    transform: "translate(-100%, -50%)",
                    width: "12px",
                    height: "9px",
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* Líneas de la cuadrícula */}
          <svg
            className="h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {xScale
              .ticks(8)
              .map(xScale.tickFormat(8, "d"))
              .map((active, i) => (
                <g
                  transform={`translate(${xScale(+active)},0)`}
                  className="text-gray-300/80 dark:text-gray-800/80"
                  key={i}
                >
                  <line
                    y1={0}
                    y2={100}
                    stroke="currentColor"
                    strokeDasharray="6,5"
                    strokeWidth={0.5}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              ))}
          </svg>

          {/* Eje X (Valores) */}
          {xScale.ticks(4).map((value, i) => (
            <div
              key={i}
              className="absolute text-xs -translate-x-1/2 tabular-nums text-gray-400"
              style={{
                left: `${xScale(value)}%`,
                top: "100%",
              }}
            >
              {value}
            </div>
          ))}
        </div>

        {/* Eje Y (Etiquetas) */}
        <div className="h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible">
          {data.map((entry, i) => (
            <span
              key={i}
              className="absolute text-xs text-gray-400 -translate-y-1/2 w-full text-right pr-2"
              style={{
                top: `${yScale(entry.key)! + yScale.bandwidth() / 2}%`,
              }}
            >
              {entry.key}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalBar;
