export interface CardProps {
  title: string;
  children?: React.ReactNode;
  className?: string;
  stackedBarChartData?: { name: string; Investigación: number; Vinculación: number; Carrera: number }[]; 
  barChartData?: { name: string; value: number }[]; // Datos para el gráfico de barras
  pieChartData?: { name: string; value: number }[]; // Datos para el gráfico de torta
  pieChartColors?: string[]; // Colores personalizados para el gráfico de torta
}