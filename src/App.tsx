import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Header from "./components/header/Header";
import Formulario3 from "./components/formularios/formulario3";
import Formulario4 from "./components/formularios/formulario4";
import Formulario7 from "./components/formularios/formulario7";
import Formulario8 from "./components/formularios/formulario8";
import Formulario10 from "./components/formularios/formulario10";
import Formulario16 from "./components/formularios/formulario16";
import GestorReportes from "./pages/gestor_reportes/gestor_reportes";
import ReporteEditor from "./pages/reporte_editor/reporte_editor";
import GestorDocumentos from "./pages/gestor_documentos/gestor_documentos";
import Login from "./pages/Login/login";
import Principal from "./pages/principal/principal";
import Format from "./components/reports/Format";
import Formulario2 from "./components/formularios/formulario2";
import Formulario6 from "./components/formularios/formulario6";
import Formulario11 from "./components/formularios/formulario11";
import Formulario12 from "./components/formularios/formulario12";
import Formulario15 from "./components/formularios/formulario15";
import Formulario17 from "./components/formularios/formulario17";
import Formulario19 from "./components/formularios/formulario19";
import Formulario20 from "./components/formularios/formulario20";
import Formulario21 from "./components/formularios/formulario21";
import Dashboard from "./pages/DashBoard-Informes/dashboard-informes";
import Dash from "./pages/DashBoard-Informes/screens/dashboard"
import Reports from "./pages/DashBoard-Informes/screens/reports"

const App = () => {
  return (
    <div className="flex flex-col min-h-screen">
       {!["/dashboard", "/Reporteria", "/reports","/reporteria"].includes(location.pathname) && <Header />}
      <main className="flex-grow p-6 space-y-4">
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/GestorDocumento" element={<GestorDocumentos />} />
            <Route path="/ReporteEditor" element={<ReporteEditor />} />
            <Route path="/GestorReporte" element={<GestorReportes />} />
            <Route path="/Principal" element={<Principal />} />
            <Route path="/Formato" element={<Format />} />
            <Route path="/Formulario3" element={<Formulario3 />} />
            <Route path="/Formulario4" element={<Formulario4 />} />
            <Route path="/Formulario7" element={<Formulario7 />} />
            <Route path="/Formulario8" element={<Formulario8 />} />
            <Route path="/Formulario10" element={<Formulario10 />} />
            <Route path="/Formulario16" element={<Formulario16 />} />
            <Route path="/Formulario2" element={<Formulario2 />} />
            <Route path="/Formulario6" element={<Formulario6 />} />
            <Route path="/Formulario11" element={<Formulario11 />} />
            <Route path="/Formulario12" element={<Formulario12 />} />
            <Route path="/Formulario15" element={<Formulario15 />} />
            <Route path="/Formulario17" element={<Formulario17 />} />
            <Route path="/Formulario19" element={<Formulario19 />} />
            <Route path="/Formulario20" element={<Formulario20 />} />
            <Route path="/Formulario21" element={<Formulario21 />} />
            <Route path="/Reporteria" element={<Dashboard />} />
            <Route path="/Dashboard" element={<Dash/>} />
            <Route path="/Reports" element={<Reports />} />
          </Routes>
        </Router>
      </main>
    </div>
  );
};

export default App;
