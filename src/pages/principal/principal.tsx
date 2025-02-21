import React, { useState } from "react";
import clsx from "clsx";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import Card from "../../components/cards/card";
import CardContent from "../../components/cards/cardcontent";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../../components/tables/table";
import { FileText } from "lucide-react";

type ColorKey = 'red' | 'yellow' | 'green' | 'gray';

const COLORS = {
  red: "#d9534f",
  yellow: "#f0ad4e",
  green: "#5cb85c",
  gray: "#d3d3d3",
};

interface ChartData {
  year: string;
  progress: number;
  label: string;
  color: string;
  status: ColorKey;
}

interface TableData {
  name: string;
  progress: string;
  status: ColorKey;
}
const initialData: ChartData[] = [
  { year: "POA 2025", progress: 10, label: "1 actividad", color: COLORS.red, status: "red" },
  { year: "POA 2025", progress: 40, label: "3 actividad", color: COLORS.yellow, status: "yellow" },
  { year: "POA 2024", progress: 100, label: "Completo", color: COLORS.green, status: "green" },
];

const initialTableData: TableData[] = [
  { name: "POA 2026", progress: "-", status: "gray" },
  { name: "POA 2025", progress: "40%", status: "yellow" },
  { name: "POA 2024", progress: "100%", status: "green" },
];

const Principal: React.FC = () => {
  //const [data, setData] = useState<ChartData[]>(initialData);
  //const [tableData, setTableData] = useState<TableData[]>(initialTableData);
  const [data] = useState<ChartData[]>(initialData);
  const [tableData] = useState<TableData[]>(initialTableData);
  const pieData = Object.keys(COLORS).map((status) => ({
    name: status.toUpperCase(),
    value: tableData.filter((d) => d.status === status).length,
    color: COLORS[status as ColorKey],
  }));

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <nav className="bg-blue-950 text-white p-4 rounded-lg shadow-md w-full text-center font-semibold text-lg">
        Reportes
      </nav>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-6xl mt-6">
        <Card className="col-span-1 lg:col-span-2 w-full">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText /> Estado de Documentos
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Documento</TableHead>
                  <TableHead>Avance</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.progress}</TableCell>
                    <TableCell>
                      <span className={clsx("inline-block w-4 h-4 rounded-full", {
                        "bg-gray-500": row.status === "gray",
                        "bg-yellow-500": row.status === "yellow",
                        "bg-green-500": row.status === "green",
                        "bg-red-500": row.status === "red",
                      })}></span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Estado General</h2>
            <PieChart width={300} height={300}>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Avance de Documentos</h2>
            <LineChart width={600} height={300} data={data} className="w-full">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="progress" stroke="#8884d8" />
            </LineChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Principal;