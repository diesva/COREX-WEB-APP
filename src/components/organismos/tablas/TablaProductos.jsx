import styled from "styled-components";
import {
  ContentAccionesTabla,
  useCategoriasStore,
  Paginacion,
  useProductosStore,
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
import { FaArrowsAltV } from "react-icons/fa";
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

export function TablaProductos({
  data,
  SetopenRegistro,
  setdataSelect,
  setAccion,
}) {
  if (data?.length === 0) return null;

  const [pagina, setPagina] = useState(1);
  const [columnFilters, setColumnFilters] = useState([]);
  const { eliminarProductos } = useProductosStore();

  // Procesar datos para los gráficos
  // Gráfica 1: Ítems con mayor stock
  const totalStock = data.reduce((sum, item) => sum + (parseFloat(item.stock) || 0), 0);
  const topItemsStock = data
    .sort((a, b) => (parseFloat(b.stock) || 0) - (parseFloat(a.stock) || 0))
    .slice(0, 10); // Top 10 ítems con mayor stock
  const itemsLabels = topItemsStock.map((item) => item.descripcion);
  const itemsStock = topItemsStock.map((item) => parseFloat(item.stock) || 0);

  // Gráfica 2: Ítems con mayor costo total
  const topItemsCosto = data
    .sort(
      (a, b) =>
        (parseFloat(b.stock) || 0) * (parseFloat(b.preciocompra) || 0) -
        (parseFloat(a.stock) || 0) * (parseFloat(a.preciocompra) || 0)
    )
    .slice(0, 10); // Top 10 ítems con mayor costo
  const costoLabels = topItemsCosto.map((item) => item.descripcion);
  const costoDataPoints = topItemsCosto.map(
    (item) => (parseFloat(item.stock) || 0) * (parseFloat(item.preciocompra) || 0)
  );

  // Gráfica 5: Fechas de vencimiento más próximas
  const fechasProximas = data
    .filter((item) => item.fecha_vencimiento && !isNaN(new Date(item.fecha_vencimiento)))
    .sort((a, b) => new Date(a.fecha_vencimiento) - new Date(b.fecha_vencimiento))
    .slice(0, 10); // Top 10 ítems con fechas más próximas
  const fechasLabels = fechasProximas.map((item) => item.descripcion);
  const fechasStock = fechasProximas.map((item) => parseFloat(item.stock) || 0);

  // Datos para los gráficos
  const itemsData = {
    labels: itemsLabels,
    datasets: [
      {
        label: "Stock de Ítems",
        data: itemsStock,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const costoData = {
    labels: costoLabels,
    datasets: [
      {
        label: "Costo Total (PEN)",
        data: costoDataPoints,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const fechaVencimientoData = {
    labels: fechasLabels,
    datasets: [
      {
        label: "Stock de Ítems",
        data: fechasStock,
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Opciones para los gráficos
  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `Ítems con Mayor Stock (Total: ${totalStock})` },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Ítems con Mayor Costo Total" },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            new Intl.NumberFormat("es-PE", {
              style: "currency",
              currency: "PEN",
            }).format(value),
        },
      },
    },
  };

  const fechaVencimientoOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Productos con Fechas de Vencimiento Más Próximas" },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            return fechasProximas[index].descripcion;
          },
          label: (tooltipItem) => {
            const index = tooltipItem.dataIndex;
            const fecha = new Date(fechasProximas[index].fecha_vencimiento).toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            const stock = fechasProximas[index].stock;
            return [`Fecha de Vencimiento: ${fecha}`, `Cantidad: ${stock}`];
          },
        },
      },
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
        await eliminarProductos({ id: p });
      }
    });
  }

  function editar(data) {
    SetopenRegistro(true);
    setdataSelect(data);
    setAccion("Editar");
  }

  const columns = [
    {
      accessorKey: "codigointerno",
      header: "Codigo Patrimonio",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Precio venta" className="ContentCell">
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
      accessorKey: "descripcion",
      header: "Descripcion",
      cell: (info) => <span>{info.getValue()}</span>,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      accessorKey: "codigobarras",
      header: "Cuenta Contable",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Cod. barras" className="ContentCell">
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
      accessorKey: "categoria",
      header: "Categoria",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Categoria" className="ContentCell">
          <Colorcontent
            color={info.row.original.color}
            className="contentCategoria"
          >
            {info.getValue()}
          </Colorcontent>
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
      header: "Stock Actual",
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
    {
      accessorKey: "fecha_vencimiento",
      header: "Fecha Vencimiento",
      enableSorting: false,
      cell: (info) => {
        const fecha = info.getValue();
        const fechaFormateada = fecha
          ? new Date(fecha).toLocaleDateString("es-PE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "Sin fecha";
        return (
          <td data-title="Fecha Vencimiento" className="ContentCell">
            <span>{fechaFormateada}</span>
          </td>
        );
      },
    },
    {
      accessorKey: "preciocompra",
      header: "Precio Unitario",
      enableSorting: false,
      cell: (info) => {
        const valor = parseFloat(info.getValue() || 0);
        const precioFormateado = new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
          minimumFractionDigits: 2,
        }).format(valor);
        return (
          <td data-title="Precio Unitario" className="ContentCell">
            <span>{precioFormateado}</span>
          </td>
        );
      },
      enableColumnFilter: true,
      filterFn: (row, columnId, filterStatuses) => {
        if (filterStatuses.length === 0) return true;
        const status = row.getValue(columnId);
        return filterStatuses.includes(status?.id);
      },
    },
    {
      header: "Precio total",
      enableSorting: false,
      cell: (info) => {
        const { stock, preciocompra } = info.row.original;
        const total = parseFloat(stock || 0) * parseFloat(preciocompra || 0);
        const totalFormateado = new Intl.NumberFormat("es-PE", {
          style: "currency",
          currency: "PEN",
          minimumFractionDigits: 2,
        }).format(total);
        return (
          <td data-title="Precio total" className="ContentCell">
            <span>{totalFormateado}</span>
          </td>
        );
      },
      enableColumnFilter: false,
    },
    {
      accessorKey: "acciones",
      header: "",
      enableSorting: false,
      cell: (info) => (
        <td data-title="Acciones" className="ContentCell">
          <ContentAccionesTabla
            funcionEditar={() => editar(info.row.original)}
            funcionEliminar={() => eliminar(info.row.original.id)}
          />
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
        data.map((row, index) =>
          index === rowIndex ? { ...row, [columnId]: value } : row
        ),
    },
  });

  return (
    <Container>
      <h2>Reporte de Productos</h2>

      {/* Tabla existente */}
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
          <h3>Ítems con Mayor Stock</h3>
          <Bar data={itemsData} options={barOptions} />
        </ChartSection>
        <ChartSection>
          <h3>Ítems con Mayor Costo Total</h3>
          <Line data={costoData} options={lineOptions} />
        </ChartSection>
        <ChartSection>
          <h3>Productos con Fechas de Vencimiento Más Próximas</h3>
          <Bar data={fechaVencimientoData} options={fechaVencimientoOptions} />
        </ChartSection>
      </ChartContainer>
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  margin: 5% 3%;
  h2 {
    font-size: 1.5em;
    margin-bottom: 1em;
    color: ${({ theme }) => theme.text};
    text-align: center;
  }
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
        .contentCategoria {
          color: ${(props) => props.color};
          background-color: ${(props) => props.color};
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
  @media ${Device.tablet} {
    width: 100%;
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