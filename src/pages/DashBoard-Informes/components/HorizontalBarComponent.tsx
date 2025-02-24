import React, { CSSProperties } from "react";
import { scaleBand, scaleLinear, max } from "d3";

// Definimos el tipo para los datos
interface DataPoint {
  key: string;
  value: number;
}

const data: DataPoint[] = [
  { key: "France", value: 100 },
  { key: "Spain", value: 70 },
  { key: "Italy", value: 60 },
  { key: "Portugal", value: 10 },
  { key: "Germany", value: 10 },
  { key: "Netherlands", value: 30 },
  { key: "Belgium", value: 50 },
  { key: "Austria", value: 20 },
  { key: "Greece", value: 30 },
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

  return (
    <div className="bg-white p-10 md:m-1/4 w-full h-full">
      {/* Descripción del gráfico */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Porcentaje de Progreso por Registro 
        </h2>
        <p className="text-sm text-gray-500">
          Estado de Progreso
        </p>
      </div>

      {/* Contenedor del gráfico */}
      <div
        className="relative w-full h-79"
        style={
          {
            "--marginTop": "10px",
            "--marginRight": "30px",
            "--marginBottom": "10px",
            "--marginLeft": `${longestWord * 7}px`,
          } as CSSProperties
        }
      >
        {/* Área del gráfico */}
        <div
          className="absolute inset-0 z-10 h-[calc(100%-var(--marginTop)-var(--marginBottom))] translate-y-[var(--marginTop)] w-[calc(100%-var(--marginLeft)-var(--marginRight))] translate-x-[var(--marginLeft)] overflow-visible"
        >
          {/* Tooltips para cada barra */}
          {data.map((d, index) => {
            const barWidth = xScale(d.value);
            const barHeight = yScale.bandwidth();
            const hoverColor =
              barWidth > 50
                ? "hover:bg-pink-200/40"
                : barWidth > 25
                ? "hover:bg-purple-200/40"
                : barWidth > 10
                ? "hover:bg-indigo-200/40"
                : "hover:bg-sky-200/40";
            return (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: "0",
                  top: `${yScale(d.key)}%`,
                  width: `100%`,
                  height: `calc(${barHeight}% + 8px)`,
                  transform: "translateY(-4px)",
                }}
                className={`${hoverColor} hover:bg-gray-200/50 relative z-10`}
              />
            );
          })}

          {/* Barras del gráfico */}
          {data.map((d, index) => {
            const barWidth = xScale(d.value);
            const barHeight = yScale.bandwidth();
            const barColor =
              barWidth > 50
                ? "bg-pink-300 dark:bg-pink-600"
                : barWidth > 25
                ? "bg-purple-300 dark:bg-purple-500"
                : barWidth > 10
                ? "bg-indigo-300 dark:bg-indigo-500"
                : "bg-sky-300 dark:bg-sky-500";
            return (
              <React.Fragment key={index}>
                <div
                  style={{
                    position: "absolute",
                    left: "0",
                    top: `${yScale(d.key)}%`,
                    width: `${barWidth}%`,
                    height: `${barHeight}%`,
                  }}
                  className={`${barColor}`}
                />
                {/* Punta de la barra */}
                <div
                  style={{
                    position: "absolute",
                    left: `${barWidth}%`,
                    top: `${yScale(d.key)! + barHeight / 2}%`,
                    transform: "translate(-100%, -50%)",
                    width: "12px",
                    height: "9px",
                    borderRadius: "2px",
                  }}
                  className={`${barColor}`}
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
              style={{
                left: `${xScale(value)}%`,
                top: "100%",
              }}
              className="absolute text-xs -translate-x-1/2 tabular-nums text-gray-400"
            >
              {value}
            </div>
          ))}
        </div>

        {/* Eje Y (Etiquetas) */}
        <div
          className="h-[calc(100%-var(--marginTop)-var(--marginBottom))] w-[var(--marginLeft)] translate-y-[var(--marginTop)] overflow-visible"
        >
          {data.map((entry, i) => (
            <span
              key={i}
              style={{
                left: "0",
                top: `${yScale(entry.key)! + yScale.bandwidth() / 2}%`,
              }}
              className="absolute text-xs text-gray-400 -translate-y-1/2 w-full text-right pr-2"
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