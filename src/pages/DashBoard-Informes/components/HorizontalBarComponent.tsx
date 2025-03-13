import React, { useMemo } from "react";
import { scaleBand, scaleLinear, max } from "d3";
import { ProcesoDatos } from "./interfaces/proceso.interface";

interface HorizontalBarProps {
  Datos: ProcesoDatos[]; // Datos dinámicos pasados como prop
}

const HorizontalBar: React.FC<HorizontalBarProps> = ({ Datos }) => {
  const sortedData = [...Datos].sort((a, b) => b.value - a.value);
  const maxValue = max(sortedData, d => d.value) ?? 0;

  // 1. Tick values dinámicos
  const tickValues = useMemo(() => 
    Array.from({ length: maxValue + 1 }, (_, i) => i), 
    [maxValue]
  );

  // 2. Calcular margen derecho basado en el ancho del número más grande
  const maxTickWidth = Math.max(...tickValues.map(t => `${t}`.length)) * 8;
  const marginRight = Math.max(40, maxTickWidth + 15);

  // Resto de márgenes
  const longestWord = max(sortedData.map((d) => d.key.length)) ?? 1;
  const marginTop = 5;
  const marginBottom = 30;
  const marginLeft = longestWord * 7;

  // Dimensiones
  const chartHeight = 610;
  const totalHeight = chartHeight + marginTop + marginBottom;

  // Escalas modificadas
  const yScale = scaleBand<string>()
    .domain(sortedData.map((d) => d.key))
    .range([0, chartHeight])
    .padding(0.6);

  const xScale = scaleLinear<number>()
    .domain([0, maxValue])
    .range([0, 100]); // Mantenemos rango porcentual

  return (
    <div className="bg-white p-4 md:m-1/4 w-full h-[730px] relative">
      {/* Título y descripción */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Registros por Carrera
        </h2>
        <p className="text-sm text-gray-500">Estado de Progreso</p>
      </div>

      {/* Contenedor del gráfico */}
      <div className="relative w-full" style={{ height: `${totalHeight}px` }}>
        {/* Eje Y (Etiquetas) */}
        <div 
          className="absolute left-0 top-0 overflow-visible" 
          style={{ 
            height: `${chartHeight}px`, 
            width: `${marginLeft}px`, 
            marginTop: `${marginTop}px`
          }}
        >
          {sortedData.map((entry) => {
            const yPos = yScale(entry.key)!;
            const barHeight = yScale.bandwidth();
            
            return (
              <span
                key={entry.key}
                className="absolute text-xs text-gray-500 w-full text-right pr-2"
                style={{
                  top: `${yPos + barHeight / 2}px`,
                  transform: "translateY(-50%)"
                }}
              >
                {entry.key}
              </span>
            );
          })}
        </div>

        {/* Líneas de cuadrícula */}
        <div 
          className="absolute overflow-visible" 
          style={{ 
            height: `${chartHeight}px`, 
            left: `${marginLeft}px`, 
            top: `${marginTop}px`, 
            right: `${marginRight}px`,
            zIndex: 1
          }}
        >
          {tickValues.map((value) => (
            <div 
              key={value} 
              className="absolute h-full border-l border-gray-200 border-dashed"
              style={{
                left: `${xScale(value)}%`,
                width: `${100 - xScale(value)}%`, // Nueva propiedad
                overflow: 'hidden'
              }}
            />
          ))}
        </div>

        {/* Área principal del gráfico */}
        <div 
          className="absolute overflow-visible" 
          style={{ 
            height: `${chartHeight}px`, 
            left: `${marginLeft}px`, 
            top: `${marginTop}px`, 
            right: `${marginRight}px`,
            zIndex: 2
          }}
        >
          {/* Barras horizontales */}
          {sortedData.map((d) => {
            const barWidth = xScale(d.value);
            const barHeight = yScale.bandwidth();
            const yPos = yScale(d.key)!;
            
            // Verificamos si hay suficiente espacio para el valor dentro de la barra
            const valueWidth = String(d.value).length * 8; // Ancho aproximado del texto
            const spaceForValue = (barWidth / 100) * (100 - marginLeft - marginRight);
            const valueInsideBar = spaceForValue > valueWidth + 20; // 20px de margen
            
            return (
              <div key={d.key} className="relative">
                {/* Barra principal */}
                <div
                  className="absolute left-0 bg-pink-600 transition-all duration-200 ease-in-out hover:opacity-80"
                  style={{
                    top: `${yPos}px`,
                    width: `${barWidth}%`,
                    height: `${barHeight}px`,
                  }}
                  aria-label={`${d.key}: ${d.value}`}
                />
                
                {/* Valor numérico */}
                <div
                  className={`absolute text-xs font-medium ${valueInsideBar ? 'text-white' : 'text-pink-600'}`}
                  style={{
                    left: valueInsideBar ? `${barWidth - 5}%` : `${barWidth + 1}%`,
                    top: `${yPos + barHeight / 2}px`,
                    transform: "translateY(-50%)",
                    textAlign: valueInsideBar ? 'right' : 'left',
                    paddingRight: valueInsideBar ? '8px' : '0',
                    paddingLeft: valueInsideBar ? '0' : '4px'
                  }}
                >
                  {d.value}
                </div>
              </div>
            );
          })}
        </div>

   {/* Eje X modificado */}
   <div 
          className="absolute overflow-visible" 
          style={{ 
            height: `${marginBottom}px`, 
            left: `${marginLeft}px`, 
            top: `${marginTop + chartHeight}px`, 
            right: `${marginRight}px`
          }}
        >
          {tickValues.map((value) => (
            <div
              key={value}
              className="absolute text-xs text-gray-500"
              style={{
                left: `${xScale(value)}%`,
                transform: `translateX(${value === maxValue ? '-100%' : '-50%'})`,
                whiteSpace: 'nowrap'
              }}
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default HorizontalBar;