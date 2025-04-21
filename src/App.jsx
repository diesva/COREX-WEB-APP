import { MyRoutes, Light, Dark, AuthContextProvider } from "./index";
import { createContext, useState, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const ThemeContext = createContext(null);

function App() {
  const [themeuse, setTheme] = useState("dark");
  const theme = themeuse === "light" ? "light" : "dark";
  const themeStyle = theme === "light" ? Light : Dark;

  const [inputPassword, setInputPassword] = useState("");
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const contraseñaCorrecta = import.meta.env.VITE_APP_PASSWORD;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputPassword === contraseñaCorrecta) {
      setAccesoPermitido(true);
    } else {
      alert("Contraseña incorrecta");
    }
  };

  if (!accesoPermitido) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>🔒 Acceso protegido</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Contraseña"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginBottom: "10px",
            }}
          />
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
