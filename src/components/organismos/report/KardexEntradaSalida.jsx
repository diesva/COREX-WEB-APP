import styled from "styled-components";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
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
  const { reportKardexEntradaSalida, buscarProductos, buscador, setBuscador ,selectProductos,productoItemSelect} =
    useProductosStore();
  const { dataempresa } = useEmpresaStore();
  const { data, isLoading, error } = useQuery({
    queryKey: ["reporte kardex entrada salida", { _id_empresa: dataempresa?.id,_id_producto:productoItemSelect?.id}],
    queryFn: () => reportKardexEntradaSalida({ _id_empresa: dataempresa?.id,_id_producto:productoItemSelect.id}),
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
      buscarProductos({ id_empresa: dataempresa?.id, descripcion: buscador }),
    enabled: !!dataempresa,
  });

  // if (isLoading) {
  //   return <span>cargando</span>;
  // }
  // if (error) {
  //   return <span>Error {error.message}</span>;
  // }
  const styles = StyleSheet.create({
    page: { flexDirection: "row", position: "relative" },
    section: { margin: 10, padding: 10, flexGrow: 1 },
    table: { width: "100%", margin: "auto", marginTop: 10 },
    row: {
      flexDirection: "row",
      borderBottom: 1,
      borderBottomColor: "#121212",
      alignItems: "stretch",
      height: 24,
      borderLeftColor: "#000",
      borderLeft: 1,
      textAlign: "left",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    cell: {
      flex: 1,
      textAlign: "center",

      borderLeftColor: "#000",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    headerCell: {
      flex: 1,
      backgroundColor: "#dcdcdc",
      fontWeight: "bold",

      textAlign: "left",
      justifyContent: "flex-start",
      alignItems: "center",
      textAlign: "center",
    },
  });
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;
  const renderTableRow = (rowData, isHeader = false) => (
    <View style={styles.row} key={rowData.id}>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.nombres}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
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
        <ListaGenerica funcion={(p)=>{
          selectProductos(p)
          setBuscador("")
        }}
          setState={() => setstateListaProductos(!stateListaproductos)}
          data={dataproductosbuscador}
        />
      )}

      <PDFViewer className="pdfviewer">
        <Document title="Reporte de stock todos">
        <Page size="A4" orientation="landscape" style={{ padding: 20 }}>
  <View style={{ flexDirection: "column", width: "100%" }}>
    
    {/* Encabezado Principal */}
    <Text style={{ fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 10 }}>
      DOCUMENTO KARDEX - ENTRADA Y SALIDA DE BIENES
    </Text>
    
    {/* Datos Generales */}
    <View style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 9, marginBottom: 10 }}>
      <View style={{ width: "48%" }}>
        <View style={{fontSize: 14,fontWeight: "bold"}}>
          <Text>Región Moquegua</Text>
        </View>
        <Text>U. Orgánica: Sub Gerencia de Infraestructura Pública</Text>
        <Text>Sec. Func.: Mejoramiento del Servicio de Educación Inicial</Text>
        <Text>Tarea Func.: 0034-021 Costo Directo</Text>
        
      </View>
      <View style={{ width: "48%" }}>
        <Text>Fecha: {formattedDate}</Text>
        <Text>Solicitante: {data?.[0]?.nombres || "Usuario X"}</Text>
        
      </View>
    </View>

    {/* Tabla de Productos */}
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
      {data?.map((movement, index) => (
        <View style={styles.row} key={index}>
          <Text style={styles.cell}>{movement.nombres}</Text>
          <Text style={styles.cell}>{movement.descripcion}</Text>
          <Text style={styles.cell}>{movement.tipo}</Text>
          <Text style={styles.cell}>{movement.cantidad}</Text>
          <Text style={styles.cell}>{movement.fecha}</Text>
          <Text style={styles.cell}>{movement.stock}</Text>
        </View>
      ))}
    </View>

    {/* Total */}
    <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
      <Text style={{ fontSize: 10, fontWeight: "bold" }}>
        Total movimientos: {data?.length || 0}
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
display:flex;
flex-direction:column;
gap:15px;
  .pdfviewer {
    width: 100%;
    height: 100%;
  }
`;
export default KardexEntradaSalida;
