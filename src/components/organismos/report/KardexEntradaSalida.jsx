import styled from "styled-components";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import {
  Buscador,
  ListaGenerica,
  useEmpresaStore,
  useProductosStore,
} from "../../../index";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

function KardexEntradaSalida() {
  const [stateListaproductos, setstateListaProductos] = useState(false);
  const {
    reportKardexEntradaSalida,
    buscarProductos,
    buscador,
    setBuscador,
    selectProductos,
    productoItemSelect,
  } = useProductosStore();
  const { dataempresa } = useEmpresaStore();

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "reporte kardex entrada salida",
      { _id_empresa: dataempresa?.id, _id_producto: productoItemSelect?.id },
    ],
    queryFn: () =>
      reportKardexEntradaSalida({
        _id_empresa: dataempresa?.id,
        _id_producto: productoItemSelect?.id,
      }),
    enabled: !!dataempresa,
  });

  const {
    data: dataproductosbuscador,
    isLoading: ProductosBuscador,
    error: errorBuscador,
  } = useQuery({
    queryKey: [
      "buscar productos",
      { id_empresa: dataempresa?.id, descripcion: buscador },
    ],
    queryFn: () =>
      buscarProductos({
        id_empresa: dataempresa?.id,
        descripcion: buscador,
      }),
    enabled: !!dataempresa,
  });

  const styles = StyleSheet.create({
    page: { flexDirection: "row", position: "relative" },
    section: { margin: 10, padding: 10, flexGrow: 1 },
    table: {
      width: "100%",
      margin: "auto",
      marginTop: 10,
    },
    row: {
      flexDirection: "row",
      borderBottom: 1,
      borderBottomColor: "#121212",
      height: "auto",
      alignItems: "center",
    },
    cell: {
      flex: 1,
      textAlign: "center",
      fontSize: 8,
      padding: 4,
      borderLeft: 1,
      borderLeftColor: "#000",
    },
    headerCell: {
      flex: 1,
      textAlign: "center",
      fontSize: 8,
      padding: 4,
      backgroundColor: "#dcdcdc",
      fontWeight: "bold",
      borderLeft: 1,
      borderLeftColor: "#000",
    },
    descripcionCell: {
      flex: 1,
      textAlign: "center",
      fontSize: 8,
      fontWeight: "normal", // Asegura que no sea bold
      padding: 4,
      borderLeft: 1,
      borderLeftColor: "#000",
    },
    
  });
  
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

  const renderTableRow = (rowData, isHeader = false) => (
        <View style={styles.row} key={rowData.id || Math.random()}>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.nombres}
      </Text>
      <Text
        style={[
          styles.descripcionCell,
          isHeader && styles.headerCell,
        ]}
      >
        {rowData.descripcion}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.tipo}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.cantidad}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.fecha}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.stock}
      </Text>
    </View>

  );

  return (
    <Container>
      <Buscador
        funcion={() => setstateListaProductos(!stateListaproductos)}
        setBuscador={setBuscador}
      />
      {stateListaproductos && (
        <ListaGenerica
          funcion={(p) => {
            selectProductos(p);
            setBuscador("");
          }}
          setState={() => setstateListaProductos(!stateListaproductos)}
          data={dataproductosbuscador?.slice(0, 3)} // 🔍 solo 3 productos sugeridos
        />
      )}

      <PDFViewer className="pdfviewer">
        <Document title="Reporte de stock todos">
          <Page size="A4" orientation="landscape" style={{ padding: 20 }}>
            <View style={{ flexDirection: "column", width: "100%" }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                DOCUMENTO KARDEX - ENTRADA Y SALIDA DE BIENES
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontSize: 9,
                  marginBottom: 10,
                }}
              >
                <View style={{ width: "48%" }}>
                  <View style={{ fontSize: 14, fontWeight: "bold" }}>
                    <Text>Región Moquegua</Text>
                  </View>
                  <Text>
                    U. Orgánica: Sub Gerencia de Infraestructura Pública
                  </Text>
                  <Text>
                    Sec. Func.: Mejoramiento del Servicio de Educación Inicial
                  </Text>
                  <Text>Tarea Func.: 0034-021 Costo Directo</Text>
                </View>
                <View style={{ width: "48%" }}>
                  <Text>Fecha: {formattedDate}</Text>
                  <Text>Solicitante: {data?.[0]?.nombres || "Usuario X"}</Text>
                </View>
              </View>

              <View style={styles.table}>
                {renderTableRow(
                  {
                    nombres: "Usuario",
                    descripcion: "Producto",
                    tipo: "Tipo",
                    cantidad: "Cantidad",
                    fecha: "Fecha",
                    stock: "Stock",
                  },
                  true
                )}
                {data?.slice(0, 3).map((movement, index) =>
                  renderTableRow(movement)
                )}
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 10,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "bold" }}>
                  Total movimientos mostrados: {Math.min(data?.length || 0, 3)}
                </Text>
              </View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  gap: 15px;
  .pdfviewer {
    width: 100%;
    height: 100%;
  }
`;

export default KardexEntradaSalida;
