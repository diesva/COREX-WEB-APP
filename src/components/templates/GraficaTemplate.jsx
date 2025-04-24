import React from "react";
import { Barras } from "../organismos/graficas/Barras";
import styled from "styled-components";
import { useState } from "react";


const datagrafica = {
  labels: ["Categoría A", "Categoría B", "Categoría C"],
  datasets: [
    {
      label: "Ventas",
      data: [300, 500, 200],
      backgroundColor: ["#4CAF50", "#2196F3", "#FFC107"],
    },
  ],
};

const data = [
  { icono: "🛒", descripcion: "Categoría A", total: "$300" },
  { icono: "📦", descripcion: "Categoría B", total: "$500" },
  { icono: "🎁", descripcion: "Categoría C", total: "$200" },
];

export default function graficaBarras() {
  return (
    <div>
      <h1>Mi Gráfica de Barras</h1>
      <Barras datagrafica={datagrafica} data={data} titulo="Ventas" />
    </div>
  );
}
