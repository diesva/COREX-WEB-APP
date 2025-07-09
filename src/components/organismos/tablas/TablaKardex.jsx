import styled from "styled-components";
import {
  ContentAccionesTabla,
  useCategoriasStore,
  Paginacion,
} from "../../../index";
import Swal from "sweetalert2";
import { v } from "../../../styles/variables";
import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowsAltV, FaPrint } from "react-icons/fa";
import { Device } from "../../../styles/breakpoints";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export function TablaKardex({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  if (data?.length === 0) return null;

  const [pagina, setPagina] = useState(1);
  const [datas, setData] = useState(data);
  const [columnFilters, setColumnFilters] = useState([]);
  const { eliminarCategoria } = useCategoriasStore();

  // Estados para filtros y ordenación
  const [stockOrder, setStockOrder] = useState("mayor"); // mayor o menor
  const [salidasPeriod, setSalidasPeriod] = useState("semana"); // día o semana
  const [entradasPeriod, setEntradasPeriod] = useState("semana"); // día o semana
  const [salidasOrder, setSalidasOrder] = useState("mayor"); // mayor o menor
  const [entradasOrder, setEntradasOrder] = useState("mayor"); // mayor o menor

  // Procesar datos para las gráficas
  // Gráfica 1: Cantidad de productos
  const productosUnicos = [...new Set(data.map((item) => item.descripcion))];
  const stockPorProducto = productosUnicos.map((desc) => {
    const items = data.filter((item) => item.descripcion === desc);
    const stock = items.reduce((sum, item) => sum + (parseFloat(item.stock) || 0), 0);
    return { descripcion: desc, stock };
  });
  const totalStock = stockPorProducto.reduce((sum, item) => sum + item.stock, 0);
  const topStockProductos = stockPorProducto
    .sort((a, b) =>
      stockOrder === "mayor" ? b.stock - a.stock : a.stock - b.stock
    )
    .slice(0, 10);
  const stockLabels = topStockProductos.map((item) => item.descripcion);
  const stockDataPoints = topStockProductos.map((item) => item.stock);

  // Gráfica 2: Ítems tipo salida
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const salidas = data.filter((item) => item.tipo === "salida");
  const salidasFiltradas = salidas.filter((item) => {
    const fecha = new Date(item.fecha);
    if (salidasPeriod === "día") {
      return fecha >= startOfDay;
    } else {
      return fecha >= startOfWeek;
    }
  });
  const salidasPorProducto = productosUnicos.map((desc) => {
    const items = salidasFiltradas.filter((item) => item.descripcion === desc);
    const cantidad = items.reduce((sum, item) => sum + (parseFloat(item.cantidad) || 0), 0);
    return { descripcion: desc, cantidad };
  });
  const topSalidasProductos = salidasPorProducto
    .filter((item) => item.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
  const salidasLabels = topSalidasProductos.map((item) => item.descripcion);
  const salidasDataPoints = topSalidasProductos.map((item) => item.cantidad);

  // Gráfica 3: Ítems tipo entrada
  const entradas = data.filter((item) => item.tipo === "entrada");
  const entradasFiltradas = entradas.filter((item) => {
    const fecha = new Date(item.fecha);
    if (entradasPeriod === "día") {
      return fecha >= startOfDay;
    } else {
      return fecha >= startOfWeek;
    }
  });
  const entradasPorProducto = productosUnicos.map((desc) => {
    const items = entradasFiltradas.filter((item) => item.descripcion === desc);
    const cantidad = items.reduce((sum, item) => sum + (parseFloat(item.cantidad) || 0), 0);
    return { descripcion: desc, cantidad };
  });
  const topEntradasProductos = entradasPorProducto
    .filter((item) => item.cantidad > 0)
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 10);
  const entradasLabels = topEntradasProductos.map((item) => item.descripcion);
  const entradasDataPoints = topEntradasProductos.map((item) => item.cantidad);

  // Gráfica 4: Ítems con mayor cantidad de salidas
  const salidasTotales = productosUnicos.map((desc) => {
    const items = salidas.filter((item) => item.descripcion === desc);
    const cantidad = items.reduce((sum, item) => sum + (parseFloat(item.cantidad) || 0), 0);
    return { descripcion: desc, cantidad };
  });
  const topSalidasTotales = salidasTotales
    .filter((item) => item.cantidad > 0)
    .sort((a, b) =>
      salidasOrder === "mayor" ? b.cantidad - a.cantidad : a.cantidad - b.cantidad
    )
    .slice(0, 10);
  const salidasTotalesLabels = topSalidasTotales.map((item) => item.descripcion);
  const salidasTotalesDataPoints = topSalidasTotales.map((item) => item.cantidad);

  // Gráfica 5: Ítems con mayor cantidad de entradas
  const entradasTotales = productosUnicos.map((desc) => {
    const items = entradas.filter((item) => item.descripcion === desc);
    const cantidad = items.reduce((sum, item) => sum + (parseFloat(item.cantidad) || 0), 0);
    return { descripcion: desc, cantidad };
  });
  const topEntradasTotales = entradasTotales
    .filter((item) => item.cantidad > 0)
    .sort((a, b) =>
      entradasOrder === "mayor" ? b.cantidad - a.cantidad : a.cantidad - b.cantidad
    )
    .slice(0, 10);
  const entradasTotalesLabels = topEntradasTotales.map((item) => item.descripcion);
  const entradasTotalesDataPoints = topEntradasTotales.map((item) => item.cantidad);

  // Datos para las gráficas
  const stockData = {
    labels: stockLabels,
    datasets: [
      {
        label: "Stock de Productos",
        data: stockDataPoints,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const salidasData = {
    labels: salidasLabels,
    datasets: [
      {
        label: `Salidas (${salidasPeriod})`,
        data: salidasDataPoints,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const entradasData = {
    labels: entradasLabels,
    datasets: [
      {
        label: `Entradas (${entradasPeriod})`,
        data: entradasDataPoints,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const salidasTotalesData = {
    labels: salidasTotalesLabels,
    datasets: [
      {
        label: "Cantidad de Salidas",
        data: salidasTotalesDataPoints,
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };

  const entradasTotalesData = {
    labels: entradasTotalesLabels,
    datasets: [
      {
        label: "Cantidad de Entradas",
        data: entradasTotalesDataPoints,
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Opciones para las gráficas
  const stockOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Productos por Stock (Total: ${totalStock})` },
    },
  };

  const salidasOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Salidas por Producto (${salidasPeriod})` },
    },
  };

  const entradasOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Entradas por Producto (${entradasPeriod})` },
    },
  };

  const salidasTotalesOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Productos con Mayor Cantidad de Salidas` },
    },
  };

  const entradasTotalesOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Productos con Mayor Cantidad de Entradas` },
    },
  };

  function eliminar(p) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Una vez eliminado, ¡no podrá recuperar este registro!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await eliminarCategoria({ id: p });
      }
    });
  }

  function editar(data) {
    SetopenRegistro(true);
    setdataSelect(data);
    setAccion("Editar");
  }

  // Función para imprimir la tabla
  function imprimirTabla() {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>COREX - Impresión Kardex</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
            h1 { text-align: center; }
            .salida { color: #ed4d4d; font-weight: bold; }
            .entrada { color: #30c85b; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Kardex</h1>
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Motivo</th>
                <th>Usuario</th>
                <th>Cantidad</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              ${table
                .getRowModel()
                .rows.map(
                  (row) => `
                <tr>
                  <td>${row.original.descripcion}</td>
                  <td>${row.original.fecha}</td>
                  <td class="${row.original.tipo === "salida" ? "salida" : "entrada"}">${
                    row.original.tipo
                  }</td>
                  <td>${row.original.detalle}</td>
                  <td>${row.original.nombres}</td>
                  <td>${row.original.cantidad}</td>
                  <td>${row.original.stock}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }

  const columns = [
    {
      accessorKey: "descripcion",
      header: "Producto",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "fecha",
      header: "Fecha",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Fecha" className="ContentCell">
          <span>{info.getValue()}</span>
        </td>
      ),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "tipo",
      header: "Tipo",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Tipo" className="ContentCell">
          {info.getValue() === "salida" ? (
            <Colorcontent color="#ed4d4d" className="contentCategoria">
              {info.getValue()}
            </Colorcontent>
          ) : (
            <Colorcontent color="#30c85b" className="contentCategoria">
              {info.getValue()}
            </Colorcontent>
          )}
        </td>
      ),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "detalle",
      header: "Motivo",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Motivo" className="ContentCell">
          <span>{info.getValue()}</span>
        </td>
      ),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "nombres",
      header: "Usuario",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Usuario" className="ContentCell">
          <span>{info.getValue()}</span>
        </td>
      ),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "cantidad",
      header: "Cantidad",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Cantidad" className="ContentCell">
          <span>{info.getValue()}</span>
        </td>
      ),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Stock" className="ContentCell">
          <span>{info.getValue()}</span>
        </td>
      ),
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pageSize: 20,
    },
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: "onChange",
    meta: {
      updateData: (rowIndex, columnId, value) =>
        setData((prev) =>
          prev.map((row, index) =>
            index === rowIndex
              ? {
                  ...prev[rowIndex],
                  [columnId]: value,
                }
              : row
          )
        ),
    },
  });

  return (
    <Container>
      <ButtonContainer>
        <ButtonImprimir onClick={imprimirTabla}>
          <FaPrint style={{ marginRight: "8px" }} />
          Imprimir
        </ButtonImprimir>
      </ButtonContainer>
      <table className="responsive-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.column.columnDef.header}
                  {header.column.getCanSort() && (
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <FaArrowsAltV />
                    </span>
                  )}
                  {
                    {
                      asc: " 🔼",
                      desc: " 🔽",
                    }[header.column.getIsSorted()]
                  }
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className={`resizer ${
                      header.column.getIsResizing() ? "isResizing" : ""
                    }`}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((item) => (
            <tr key={item.id}>
              {item.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Paginacion
        table={table}
        irinicio={() => table.setPageIndex(0)}
        pagina={table.getState().pagination.pageIndex + 1}
        setPagina={setPagina}
        maximo={table.getPageCount()}
      />

      {/* Sección de Gráficos */}
      <ChartContainer>
        <ChartSection>
          <h3>Productos por Stock</h3>
          <ButtonGroup>
            <FilterButton
              active={stockOrder === "mayor"}
              onClick={() => setStockOrder("mayor")}
            >
              Mayor a Menor
            </FilterButton>
            <FilterButton
              active={stockOrder === "menor"}
              onClick={() => setStockOrder("menor")}
            >
              Menor a Mayor
            </FilterButton>
          </ButtonGroup>
          <Bar data={stockData} options={stockOptions} />
        </ChartSection>
        <ChartSection>
          <h3>Salidas por Producto</h3>
          <ButtonGroup>
            {/*<FilterButton
              active={salidasPeriod === "semana"}
              onClick={() => setSalidasPeriod("semana")}
            >
              Día Actual
            </FilterButton>*/}
            <FilterButton
              active={salidasPeriod === "semana"}
              onClick={() => setSalidasPeriod("semana")}
            >
              Semana Actual
            </FilterButton>
          </ButtonGroup>
          <Line data={salidasData} options={salidasOptions} />
        </ChartSection>
        <ChartSection>
          <h3>Entradas por Producto</h3>
          <ButtonGroup>
            {/*<FilterButton
              active={entradasPeriod === "día"}
              onClick={() => setEntradasPeriod("día")}
            >
              Día Actual
            </FilterButton>*/}
            <FilterButton
              active={entradasPeriod === "semana"}
              onClick={() => setEntradasPeriod("semana")}
            >
              Semana Actual
            </FilterButton>
          </ButtonGroup>
          <Line data={entradasData} options={entradasOptions} />
        </ChartSection>
        <ChartSection>
          <h3>Productos con Mayor Cantidad de Salidas</h3>
          <ButtonGroup>
            <FilterButton
              active={salidasOrder === "mayor"}
              onClick={() => setSalidasOrder("mayor")}
            >
              Mayor Cantidad
            </FilterButton>
            <FilterButton
              active={salidasOrder === "menor"}
              onClick={() => setSalidasOrder("menor")}
            >
              Menor Cantidad
            </FilterButton>
          </ButtonGroup>
          <Bar data={salidasTotalesData} options={salidasTotalesOptions} />
        </ChartSection>
        <ChartSection>
          <h3>Productos con Mayor Cantidad de Entradas</h3>
          <ButtonGroup>
            <FilterButton
              active={entradasOrder === "mayor"}
              onClick={() => setEntradasOrder("mayor")}
            >
              Mayor Cantidad
            </FilterButton>
            <FilterButton
              active={entradasOrder === "menor"}
              onClick={() => setEntradasOrder("menor")}
            >
              Menor Cantidad
            </FilterButton>
          </ButtonGroup>
          <Bar data={entradasTotalesData} options={entradasTotalesOptions} />
        </ChartSection>
      </ChartContainer>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  margin: 5% 3%;
  @media (min-width: ${v.bpbart}) {
    margin: 2%;
  }
  @media (min-width: ${v.bphomer}) {
    margin: 2em auto;
  }
  .responsive-table {
    width: 100%;
    margin-bottom: 1.5em;
    border-spacing: 0;
    @media (min-width: ${v.bpbart}) {
      font-size: 0.9em;
    }
    @media (min-width: ${v.bpmarge}) {
      font-size: 1em;
    }
    thead {
      position: absolute;
      padding: 0;
      border: 0;
      height: 1px;
      width: 1px;
      overflow: hidden;
      @media (min-width: ${v.bpbart}) {
        position: relative;
        height: auto;
        width: auto;
        overflow: auto;
      }
      th {
        border-bottom: 2px solid rgba(115, 115, 115, 0.32);
        font-weight: normal;
        text-align: center;
        color: ${({ theme }) => theme.text};
        &:first-of-type {
          text-align: center;
        }
      }
    }
    tbody,
    tr,
    th,
    td {
      display: block;
      padding: 0;
      text-align: left;
      white-space: normal;
    }
    tr {
      @media (min-width: ${v.bpbart}) {
        display: table-row;
      }
    }
    th,
    td {
      padding: 0.5em;
      vertical-align: middle;
      @media (min-width: ${v.bplisa}) {
        padding: 0.75em 0.5em;
      }
      @media (min-width: ${v.bpbart}) {
        display: table-cell;
        padding: 0.5em;
      }
      @media (min-width: ${v.bpmarge}) {
        padding: 0.75em 0.5em;
      }
      @media (min-width: ${v.bphomer}) {
        padding: 0.75em;
      }
    }
    tbody {
      @media (min-width: ${v.bpbart}) {
        display: table-row-group;
      }
      tr {
        margin-bottom: 1em;
        @media (min-width: ${v.bpbart}) {
          display: table-row;
          border-width: 1px;
        }
        &:last-of-type {
          margin-bottom: 0;
        }
        &:nth-of-type(even) {
          @media (min-width: ${v.bpbart}) {
            background-color: rgba(78, 78, 78, 0.12);
          }
        }
      }
      th[scope="row"] {
        @media (min-width: ${v.bplisa}) {
          border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        }
        @media (min-width: ${v.bpbart}) {
          background-color: transparent;
          text-align: center;
          color: ${({ theme }) => theme.text};
        }
      }
      .ContentCell {
        text-align: right;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        border-bottom: 1px solid rgba(161, 161, 161, 0.32);
        @media (min-width: ${v.bpbart}) {
          justify-content: center;
          border-bottom: none;
        }
      }
      td {
        text-align: right;
        @media (min-width: ${v.bpbart}) {
          border-bottom: 1px solid rgba(161, 161, 161, 0.32);
          text-align: center;
        }
      }
      td[data-title]:before {
        content: attr(data-title);
        float: left;
        font-size: 0.8em;
        @media (min-width: ${v.bplisa}) {
          font-size: 0.9em;
        }
        @media (min-width: ${v.bpbart}) {
          content: none;
        }
      }
    }
  }
`;

const Colorcontent = styled.div`
  color: ${(props) => props.color};
  border-radius: 8px;
  border: 1px dashed ${(props) => props.color};
  text-align: center;
  padding: 3px;
  width: 70%;
  font-weight: 700;
  @media ${Device.tablet} {
    width: 100%;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1em;
`;

const ButtonImprimir = styled.button`
  display: flex;
  align-items: center;
  background-color: #3085d6;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  &:hover {
    background-color: #2670b5;
  }
`;

const ChartContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr; /* Una columna en dispositivos pequeños */
  gap: 2em;
  margin-top: 2em;
  @media ${Device.tablet} {
    grid-template-columns: repeat(2, 1fr); /* Dos columnas en tablets y superiores */
    gap: 2em;
  }
`;

const ChartSection = styled.div`
  background-color: ${({ theme }) => theme.bg || "#fff"};
  padding: 1em;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  h3 {
    font-size: 1.2em;
    margin-bottom: 1em;
    color: ${({ theme }) => theme.text};
    text-align: center;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 1em;
`;

const FilterButton = styled.button`
  background-color: ${(props) => (props.active ? "#3085d6" : "#ccc")};
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  &:hover {
    background-color: ${(props) => (props.active ? "#2670b5" : "#bbb")};
  }
`;