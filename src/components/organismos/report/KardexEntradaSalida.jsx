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
import { Image } from "@react-pdf/renderer";

function KardexEntradaSalida() {
  const [stateListaproductos, setstateListaProductos] = useState(false);
  const {
    reportKardexEntradaSalida,
    buscarProductos,
    buscador,
    setBuscador,
    //NUEVO
    addProductoItem, 
    //FIN
    selectProductos,
    productoItemSelect,
  } = useProductosStore();
  const { dataempresa } = useEmpresaStore();

  /*const { data, isLoading, error } = useQuery({
    
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
  });*/
  console.log("Producto seleccionado:", productoItemSelect);

  const { data: dataKardex = [] } = useQuery({
    queryKey: ["reporte kardex entrada salida", productoItemSelect.map(p => p.id)],
    queryFn: async () => {
      const responses = await Promise.all(
        productoItemSelect.map(p =>
          reportKardexEntradaSalida({
            _id_empresa: dataempresa?.id,
            _id_producto: p.id,
          })
        )
      );
      return responses;
    },
    enabled: !!dataempresa && productoItemSelect.length > 0,
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
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.codigobarras}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.codigointerno}
      </Text>
      <Text style={[styles.descripcionCell, isHeader && styles.headerCell]}>
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
            <BuscadorContainer>
              
            
      
      {stateListaproductos && (
        <ListaGenerica
          funcion={(p) => {
            //selectProductos(p);
            addProductoItem(p); // ✅ agregar al array
            setBuscador("");
          }}
          setState={() => setstateListaProductos(!stateListaproductos)}
          data={dataproductosbuscador?.slice(0, 3)} // 🔍 solo 3 productos sugeridos
        />
      )}
                  </BuscadorContainer>

      <PDFViewer className="pdfviewer">
        <Document title="Reporte de stock todos">
          <Page size="A4" orientation="landscape" style={{ padding: 20 }}>
            
                            <Image
                              src="../src/assets/GORE.png"
                              style={{ width: 75, height: 50, marginBottom: 0 }}
                            />
                            
            <View style={{ flexDirection: "column", width: "100%" }}>
              

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontSize: 6,
                  marginBottom: 10,
                  textAlign: "left",
                }}
              >
                <View style={{ width: "48%" }}>
                  <Text>UNIDAD EJECUTORA SUB REGION</Text>
                  
                  <Text>
                  DE DESARROLLO ILO N°003
                  </Text>
                  <Text>
                  ALMACEN CENTRAL
                  </Text>
                  <Text>AV. VENECIA N°222</Text>
                  <Text>RUC: 20532480397</Text>
                </View>
                <View style={{ width: "20%" }}>
                  <Text>Fecha: {formattedDate}</Text>
                  <Text>Solicitante: {dataKardex?.[0]?.[0]?.nombres || "Usuario X"}</Text>

                </View>
              </View>
</View>
                    
                            
            <View style={{ flexDirection: "column", width: "100%" }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                PEDIDO COMPROBANTE DE SALIDA
              </Text>
                <View style={{fontSize: 8, flexDirection: "column", width: "100%", textAlign: "center"}}>
              <Text>Stock: {dataempresa?.nombre || "Almacen Desconocido"}</Text>
                </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  fontSize: 9,
                  marginBottom: 10,
                }}
              >

                </View>
              

              <View style={styles.table}>
                {renderTableRow(
                  {
                    nombres: "Usuario",
                    codigobarras: "Cuenta Contable",
                    codigointerno: "Codigo Patrimonio",
                    descripcion: "Producto",
                    tipo: "Tipo",
                    cantidad: "Cantidad",
                    fecha: "Fecha",
                    stock: "Stock",
                  },
                  true
                )}
                



                {dataKardex.length > 0 &&
  dataKardex.map((movimientos, i) => {
    const ultimaSalida = movimientos
      .filter((m) => m.tipo === "salida")
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
    return ultimaSalida ? renderTableRow(ultimaSalida) : null;
  })
}









                
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 10,
                }}
              >
<Text style={{ fontSize: 10, fontWeight: "bold" }}>
  Total movimientos mostrados: {
    dataKardex.filter((movimientos) =>
      movimientos.some((m) => m.tipo === "SALIDA")
    ).length
  }
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
const BuscadorContainer = styled.div`
  position: relative;
  width: 100%;

  > div {
    position: absolute;
    top: 0px;
    left: 0;
    right: 0;
    z-index: 10;
    background: ${(props) => props.theme.bg};
    border: 1px solid #ccc;
    border-radius: 10px;
    overflow: hidden;
  }
`;

export default KardexEntradaSalida;
