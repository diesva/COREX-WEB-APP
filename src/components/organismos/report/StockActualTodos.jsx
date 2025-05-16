import styled from "styled-components";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Image,
} from "@react-pdf/renderer";
import { useEmpresaStore } from "../../../index";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../index";

// Estilos del PDF
const styles = StyleSheet.create({
  page: { 
    flexDirection: "column",
    padding: 20,
    backgroundColor: "transparent",
  },
  image: {
    width: 60,
    height: 40,
    marginBottom: 5,
    position: "relative",
    zIndex: 1,
  },
  boldText: {
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 6,
  },
  titleText: {
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  table: { 
    width: "100%", 
    marginTop: 5,
    borderTop: 1,
    borderTopColor: "#000",
    borderRight: 1,
    borderRightColor: "#000",
  },
  row: {
    flexDirection: "row",
    borderBottom: 1,
    borderBottomColor: "#000",
    minHeight: 15,
    alignItems: "center",
  },
  cell: {
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  headerCell: {
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  itemCell: {
    width: 40,
    textAlign: "left",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  itemHeaderCell: {
    width: 40,
    textAlign: "left",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  codigoCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  codigoHeaderCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  descripcionCell: {
    width: 200,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  descripcionHeaderCell: {
    width: 200,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  stockCell: {
    width: 60,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  stockHeaderCell: {
    width: 60,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  precioCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  precioHeaderCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cuentaCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  cuentaHeaderCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  marcaCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  marcaHeaderCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  categoriaCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  categoriaHeaderCell: {
    width: 80,
    textAlign: "center",
    fontSize: 6,
    padding: 3,
    backgroundColor: "#dcdcdc",
    fontWeight: "bold",
    borderLeft: 1,
    borderLeftColor: "#000",
  },
  body: {
    flex: 1,
    flexDirection: "column",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: 1,
    borderTopColor: "#000",
    paddingTop: 10,
    marginTop: 20,
  },
  signature: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
  },
  signatureLine: {
    width: 100,
    marginBottom: 3,
  },
  signatureText: {
    fontSize: 6,
    textAlign: "center",
  },
});

// Contenedor para el PDF
const PDFContainer = styled.div`
  position: relative;
  width: 595px;
  height: 842px;
  margin-top: 20px;
  border: 1px solid #ccc;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  .pdfviewer {
    width: 100%;
    height: 100%;
  }
`;

function StockActualTodos() {
  const { dataempresa } = useEmpresaStore();

  // Verificar si dataempresa está definido
  if (!dataempresa || !dataempresa.id) {
    console.log("dataempresa no está definido:", dataempresa);
    return <span>Cargando datos de la empresa...</span>;
  }

  // Consulta para productos
  const { data: productos, isLoading: isLoadingProductos, error: errorProductos } = useQuery({
    queryKey: ["reporte stock todos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("id, descripcion, stock, preciocompra, codigobarras, codigointerno, idmarca, id_categoria");
      if (error) throw error;
      console.log("Productos fetched:", data);
      return data || [];
    },
    enabled: !!dataempresa.id,
  });

  // Consulta para marcas
  const { data: marcas, isLoading: isLoadingMarcas, error: errorMarcas } = useQuery({
    queryKey: ["marcas", { id_empresa: dataempresa.id }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marca")
        .select("id, descripcion")
        .eq("id_empresa", dataempresa.id);
      if (error) throw error;
      console.log("Marcas fetched:", data);
      return data || [];
    },
    enabled: !!dataempresa.id,
  });

  // Consulta para categorías
  const { data: categorias, isLoading: isLoadingCategorias, error: errorCategorias } = useQuery({
    queryKey: ["categorias", { id_empresa: dataempresa.id }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("id, descripcion")
        .eq("id_empresa", dataempresa.id);
      if (error) throw error;
      console.log("Categorias fetched:", data);
      return data || [];
    },
    enabled: !!dataempresa.id,
  });

  if (isLoadingProductos || isLoadingMarcas || isLoadingCategorias) {
    return <span>Cargando...</span>;
  }

  if (errorProductos || errorMarcas || errorCategorias) {
    const errorMessage = (errorProductos || errorMarcas || errorCategorias)?.message;
    console.log("Error en consultas:", errorMessage);
    return <span>Error: {errorMessage}</span>;
  }

  // Mapear idmarca y id_categoria a sus descripciones
  const getMarcaDescripcion = (idmarca) => {
    const marca = marcas?.find((m) => m.id === idmarca);
    return marca?.descripcion || idmarca || "";
  };

  const getCategoriaDescripcion = (id_categoria) => {
    const categoria = categorias?.find((c) => c.id === id_categoria);
    return categoria?.descripcion || id_categoria || "";
  };

  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}`;

  const renderTableRow = (rowData, isHeader = false, index = null) => {
    if (isHeader) {
      return (
        <View style={styles.row} key="header">
          <Text style={styles.itemHeaderCell}>ITEM</Text>
          <Text style={styles.codigoHeaderCell}>CÓDIGO PATRIMONIO</Text>
          <Text style={styles.descripcionHeaderCell}>DESCRIPCIÓN</Text>
          <Text style={styles.stockHeaderCell}>STOCK</Text>
          <Text style={styles.precioHeaderCell}>PRECIO COMPRA</Text>
          <Text style={styles.cuentaHeaderCell}>CÓDIGO CUENTA</Text>
          <Text style={styles.marcaHeaderCell}>MARCA</Text>
          <Text style={styles.categoriaHeaderCell}>CATEGORÍA</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.row} key={rowData.id}>
          <Text style={styles.itemCell}>{index + 1}</Text>
          <Text style={styles.codigoCell}>{rowData.codigointerno || ""}</Text>
          <Text style={styles.descripcionCell}>{rowData.descripcion || ""}</Text>
          <Text style={styles.stockCell}>{rowData.stock || "0"}</Text>
          <Text style={styles.precioCell}>
            {rowData.preciocompra
              ? `S/. ${parseFloat(rowData.preciocompra).toLocaleString("es-PE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "0.00"}
          </Text>
          <Text style={styles.cuentaCell}>{rowData.codigobarras || ""}</Text>
          <Text style={styles.marcaCell}>{getMarcaDescripcion(rowData.idmarca)}</Text>
          <Text style={styles.categoriaCell}>{getCategoriaDescripcion(rowData.id_categoria)}</Text>
        </View>
      );
    }
  };

  return (
    <PDFContainer>
      <PDFViewer className="pdfviewer">
        <Document title="Reporte de Stock Actual Todos">
          <Page size="A4" orientation="portrait" style={styles.page}>
            <Image src="../src/assets/GORE.png" style={styles.image} />
            <View style={styles.body}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 6,
                  marginBottom: 5,
                }}
              >
                <View style={{ width: "30%" }}>
                  <Text>UNIDAD EJECUTORA SUB REGION</Text>
                  <Text>DE DESARROLLO ILO N°003</Text>
                  <Text>ALMACEN CENTRAL</Text>
                  <Text>AV. VENECIA N°222</Text>
                  <Text>RUC: 20532480397</Text>
                </View>
                <View style={{ width: "40%", textAlign: "center" }}>
                  <Text style={styles.titleText}>REPORTE DE STOCK ACTUAL</Text>
                  <View style={{ fontSize: 6, textAlign: "center", marginBottom: 5 }}>
                    <Text>Stock: {dataempresa?.nombre || "Almacen Desconocido"}</Text>
                  </View>
                </View>
                <View style={{ width: "20%", textAlign: "right" }}>
                  <Text>Fecha: {formattedDate}</Text>
                  <Text>Generado por: Usuario X</Text>
                </View>
              </View>
              <View style={styles.table}>
                {renderTableRow({}, true)}
                {productos?.length > 0 ? (
                  productos.map((product, index) => renderTableRow(product, false, index))
                ) : (
                  <View style={styles.row}>
                    <Text style={[styles.cell, { width: "100%", textAlign: "center" }]}>
                      No se encontraron productos
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.footer} fixed>
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>Jefe de Abastecimiento</Text>
              </View>
              <View style={styles.signature}>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureText}>Jefe de Almacén</Text>
              </View>
            </View>
          </Page>
        </Document>
      </PDFViewer>
    </PDFContainer>
  );
}

export default StockActualTodos;