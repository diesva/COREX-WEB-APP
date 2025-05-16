import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "../../../index";

// Estilos para el contenedor principal
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
`;

// Estilos para la tabla
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${(props) => props.theme.bg};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.th`
  padding: 12px;
  background-color: ${(props) => props.theme.bg};
  color: white;
  font-size: 14px;
  text-align: left;
  border-bottom: 1px solid #414244;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${(props) => props.theme.bg};
  }
  &:nth-child(odd) {
    background-color:  ${(props) => props.theme.bg};
  }
`;

const TableCell = styled.td`
  padding: 12px;
  font-size: 14px;
  color: ${(props) => props.theme.text};
  border-bottom: 1px solid #414244;
`;

// Estilos para el modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.bg};
  padding: 20px;
  border-radius: 8px;
  width: 600px;
  max-width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  text-align: left;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  margin: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  background-color: ${(props) => (props.primary ? "#007bff" : "#ccc")};
  color: white;
`;

const DetailTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 15px;
  color: ${(props) => props.theme.text};
`;

const DetailItem = styled.div`
  margin-bottom: 10px;
  font-size: 14px;
  color: ${(props) => props.theme.text};
  strong {
    display: inline-block;
    width: 150px;
  }
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
`;

const ProductTableHeader = styled.th`
  padding: 8px;
  background-color: #f0f0f0;
  font-size: 12px;
  text-align: left;
  border-bottom: 1px solid #414244;
`;

const ProductTableCell = styled.td`
  padding: 8px;
  font-size: 12px;
  border-bottom: 1px solid #414244;
`;

function ReporteNeaList() {
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Consulta para obtener todos los reportes de registro_nea
  const { data: reportes = [], isLoading, error } = useQuery({
    queryKey: ["reportes_nea"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registro_nea")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleViewReporte = (reporte) => {
    setSelectedReporte(reporte);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedReporte(null);
    setShowModal(false);
  };

  if (isLoading) {
    return <Container>Cargando reportes...</Container>;
  }

  if (error) {
    return <Container>Error al cargar los reportes: {error.message}</Container>;
  }

  return (
    <Container>
      <h2>Lista de Reportes NEA</h2>
      {reportes.length === 0 ? (
        <p>No hay reportes registrados.</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <TableHeader>Número de Documento</TableHeader>
              <TableHeader>Dependencia Solicitante</TableHeader>
              <TableHeader>Fecha de Generación</TableHeader>
              <TableHeader>Total Monto</TableHeader>
              <TableHeader>Acciones</TableHeader>
            </tr>
          </thead>
          <tbody>
            {reportes.map((reporte) => (
              <TableRow key={reporte.id}>
                <TableCell>{reporte.numero_documento}</TableCell>
                <TableCell>{reporte.dependencia_solicitante}</TableCell>
                <TableCell>
                  {new Date(reporte.fecha_generacion).toLocaleString("es-PE")}
                </TableCell>
                <TableCell>
                  S/. {reporte.total_monto?.toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleViewReporte(reporte)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: 12,
                    }}
                  >
                    Ver
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      )}

      {showModal && selectedReporte && (
        <ModalOverlay>
          <ModalContent>
            <DetailTitle>Detalles del Reporte NEA</DetailTitle>
            <DetailItem>
              <strong>Número de Documento:</strong> {selectedReporte.numero_documento}
            </DetailItem>
            <DetailItem>
              <strong>Dependencia Solicitante:</strong> {selectedReporte.dependencia_solicitante}
            </DetailItem>
            <DetailItem>
              <strong>Solicita Entrega:</strong> {selectedReporte.solicita_entrega || "No especificado"}
            </DetailItem>
            <DetailItem>
              <strong>Destino:</strong> {selectedReporte.destino || "No especificado"}
            </DetailItem>
            <DetailItem>
              <strong>Referencia:</strong> {selectedReporte.referencia || "No especificado"}
            </DetailItem>
            <DetailItem>
              <strong>Cuenta Mayor:</strong> {selectedReporte.cuenta_mayor || "No especificado"}
            </DetailItem>
            <DetailItem>
              <strong>Programa:</strong> {selectedReporte.programa || "No especificado"}
            </DetailItem>
            <DetailItem>
              <strong>Sub-Programa:</strong> {selectedReporte.sub_programa || "No especificado"}
            </DetailItem>
            <DetailItem>
              <strong>Meta:</strong> {selectedReporte.meta || "No especificado"}
            </DetailItem>
            <DetailItem>
              <strong>Total Monto:</strong> S/. {selectedReporte.total_monto?.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </DetailItem>
            <DetailItem>
              <strong>Generado Por:</strong> {selectedReporte.generado_por || "Usuario X"}
            </DetailItem>
            <DetailItem>
              <strong>Fecha de Generación:</strong> {new Date(selectedReporte.fecha_generacion).toLocaleString("es-PE")}
            </DetailItem>
            <DetailItem>
              <strong>Creado:</strong> {new Date(selectedReporte.created_at).toLocaleString("es-PE")}
            </DetailItem>
            <DetailItem>
              <strong>Actualizado:</strong> {new Date(selectedReporte.updated_at).toLocaleString("es-PE")}
            </DetailItem>
            <DetailItem>
              <strong>ID Empresa:</strong> {selectedReporte.id_empresa}
            </DetailItem>
            <DetailItem>
              <strong>Productos:</strong>
              {selectedReporte.productos && selectedReporte.productos.length > 0 ? (
                <ProductTable>
                  <thead>
                    <tr>
                      <ProductTableHeader>Descripción</ProductTableHeader>
                      <ProductTableHeader>Código Interno</ProductTableHeader>
                      <ProductTableHeader>Código de Barras</ProductTableHeader>
                      <ProductTableHeader>Cantidad</ProductTableHeader>
                      <ProductTableHeader>Precio Compra</ProductTableHeader>
                      <ProductTableHeader>Stock</ProductTableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReporte.productos.map((producto, index) => (
                      <tr key={index}>
                        <ProductTableCell>{producto.descripcion || "N/A"}</ProductTableCell>
                        <ProductTableCell>{producto.codigointerno || "N/A"}</ProductTableCell>
                        <ProductTableCell>{producto.codigobarras || "N/A"}</ProductTableCell>
                        <ProductTableCell>{producto.cantidad || "N/A"}</ProductTableCell>
                        <ProductTableCell>
                          {producto.preciocompra
                            ? `S/. ${parseFloat(producto.preciocompra).toLocaleString("es-PE", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : "N/A"}
                        </ProductTableCell>
                        <ProductTableCell>{producto.stock || "N/A"}</ProductTableCell>
                      </tr>
                    ))}
                  </tbody>
                </ProductTable>
              ) : (
                <p>No hay productos registrados.</p>
              )}
            </DetailItem>
            <div style={{ textAlign: "center" }}>
              <ModalButton primary onClick={handleCloseModal}>
                Cerrar
              </ModalButton>
            </div>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

export default ReporteNeaList;