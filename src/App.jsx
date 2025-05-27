import { MyRoutes, Light, Dark, AuthContextProvider } from "./index";
import { createContext, useState, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Íconos de ojo (puedes usar una librería como react-icons o íconos personalizados)
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Instala react-icons si no lo tienes: npm install react-icons

export const ThemeContext = createContext(null);

function App() {
  const [themeuse, setTheme] = useState("dark");
  const theme = themeuse === "light" ? "light" : "dark";
  const themeStyle = theme === "light" ? Light : Dark;

  const [inputPassword, setInputPassword] = useState("");
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar visibilidad
  const contraseñaCorrecta = import.meta.env.VITE_APP_PASSWORD;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputPassword === contraseñaCorrecta) {
      setAccesoPermitido(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (!accesoPermitido) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>🔒 Acceso protegido</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <input
              type={showPassword ? "text" : "password"} // Cambia el tipo según el estado
              placeholder="Contraseña"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              style={{
                padding: "10px",
                fontSize: "16px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                marginBottom: "10px",
                paddingRight: "40px", // Espacio para el ícono
              }}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                color: "#555",
              }}
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </button>
          </div>
          <br />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#4CAF50",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ThemeProvider theme={themeStyle}>
        <AuthContextProvider>
          <MyRoutes />
          <ReactQueryDevtools initialIsOpen={true} />
        </AuthContextProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;