import React, { useState, FormEvent, useEffect } from "react";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import "./login.css"; // Asegúrate de que tienes el archivo de estilo correspondiente

const socket = io("http://localhost:3001"); // Asegúrate de que la URL coincida con tu backend

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");  // Campo de correo actualizado a 'email'
  const [password, setPassword] = useState("");  // Campo de contraseña
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Verificación de que el email y la contraseña no estén vacíos
    if (!email || !password) {
      toast.error("Por favor, completa todos los campos.");
      return;
    }

    // Emitir evento de login al backend con los datos del email y la contraseña
    socket.emit("login", { email, password });
  };

  useEffect(() => {
    // Escuchar evento de éxito de login
    socket.on("login_success", (data) => {
      toast.success("Inicio de sesión exitoso!");
      localStorage.setItem("token", data.token); // Guardar el token para futuras peticiones
      localStorage.setItem("expiresAt", data.expiresAt); // Guardar la expiración del token
      navigate("/GestorDocumento"); // Redirige al gestor de documentos o la página privada
    });

    // Escuchar evento de error de login
    socket.on("login_error", (message) => {
      toast.error(message);
    });

    // Limpiar la suscripción al desmontar el componente
    return () => {
      socket.off("login_success");
      socket.off("login_error");
    };
  }, [navigate]); // Dependencia para que el efecto se ejecute solo una vez al montar

  return (
    <div className="contenedorPrincipal">
      <div className="contenedorLoguin">
        <div className="portadasLoguin">
          <div className="porta"></div>
        </div>
        <div className="contenedorFormularioLoguin">
          <div className="encabezadoLoguin">
            <img src="../../assets/img/logoUTA.png" alt="Logo DINNOVA" />
            <h1>Bienvenido a DINNOVA</h1>
          </div>
          <div className="formularioLoguin">
            <form onSubmit={handleSubmit}>
              {/* Campo de email */}
              <div className="contenedorIngreso">
                <input
                  type="email"  // Asegúrate de que el tipo sea email para validación automática
                  id="email"  // Cambié 'correo' por 'email'
                  name="email"  // Cambié 'correo' por 'email'
                  className="ingreso"
                  placeholder="Correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={50}
                  minLength={4}
                  required
                />
              </div>

              {/* Campo de contraseña */}
              <div className="contenedorIngreso">
                <div className="campoContrasena">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"  // Cambié 'contrasenia' por 'password'
                    name="password"  // Cambié 'contrasenia' por 'password'
                    className="ingreso"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    maxLength={25}
                    minLength={4}
                    required
                  />
                  {showPassword ? (
                    <BsEyeSlash className="iconoIngreso" onClick={togglePasswordVisibility} />
                  ) : (
                    <BsEye className="iconoIngreso" onClick={togglePasswordVisibility} />
                  )}
                </div>
              </div>

              {/* Botón de submit */}
              <button type="submit" className="botonVerde">
                Iniciar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
