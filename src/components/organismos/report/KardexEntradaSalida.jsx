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
  //DATOS:
  const [dependencia, setDependencia] = useState("");
const [solicitaEntrega, setSolicitaEntrega] = useState("");
const [destino, setDestino] = useState("");
const [referencia, setReferencia] = useState("");
const [ctaMayor, setCtaMayor] = useState("");
const [programa, setPrograma] = useState("");
const [subPrograma, setSubPrograma] = useState("");
const [meta, setMeta] = useState("");



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

  const renderTableRow = (rowData, isHeader = false, index = null) => (
    <View style={styles.row} key={rowData.id || Math.random()}>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {isHeader ? "N°" : index + 1}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.codigointerno}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.stock}
      </Text>
      <Text style={[styles.descripcionCell, isHeader && styles.headerCell]}>
        {rowData.descripcion}
      </Text>
      {/*<Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.nombres}
      </Text>*/}
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.codigobarras}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.cantidad}
      </Text>
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
  {String(rowData.preciocompra ?? "")}
</Text>
<Text style={[styles.cell, isHeader && styles.headerCell]}>
  {isHeader
    ? "Total"
    : rowData.cantidad && rowData.preciocompra
    ? `S/. ${(parseFloat(rowData.cantidad) * parseFloat(rowData.preciocompra)).toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    : ""}
</Text>



      {/*<Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.tipo}
      </Text>
      
      <Text style={[styles.cell, isHeader && styles.headerCell]}>
        {rowData.fecha}
      </Text>*/}
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
                  



                  <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
  <div style={{ flex: 1, minWidth: "300px" }}>
    <FormInputGroup>
      <label>Dependencia solicitante:</label>
      <select value={dependencia} onChange={(e) => setDependencia(e.target.value)}>
        <option value="">-- Seleccione --</option>
        <option>Área de Liquidaciones</option>
<option>Cuna Jardín San Gerónimo</option>
<option>Gerencia General Regional</option>
<option>Gerencia Sub Regional</option>
<option>Oficina Sub Regional de Administración</option>
<option>Oficina Sub Regional de Asesoría Jurídica</option>
<option>Oficina Sub Regional de Planeamiento y Presupuesto</option>
<option>Oficina Sub Regional de Supervisión</option>
<option>Órgano de Control Institucional</option>
<option>Programa de Mantenimiento de Insfraestructura</option>
<option>Sub Gerencia de Desarrollo Económico Social y Ambiental</option>
<option>Sub Gerencia de Infraestructura Pública</option>
<option>Unidad de Almacén</option>
<option>Unidad de Contabilidad</option>
<option>Unidad de Formulación y Estudios</option>
<option>Unidad de Informática</option>
<option>Unidad de Logística</option>
<option>Unidad de Patrimonio</option>
<option>Unidad de Recursos Humanos</option>
<option>Unidad de Tesorería</option>

        
      </select>
    </FormInputGroup>

    <FormInputGroup>
      <label>Solicito Entregar a:</label>
      <input type="text" value={solicitaEntrega} onChange={(e) => setSolicitaEntrega(e.target.value)} />
    </FormInputGroup>

    <FormInputGroup>
      <label>Con Destino a:</label>
      <input type="text" value={destino} onChange={(e) => setDestino(e.target.value)} />
    </FormInputGroup>

    <FormInputGroup>
      <label>Referencia:</label>
      <input type="text" value={referencia} onChange={(e) => setReferencia(e.target.value)} />
    </FormInputGroup>
  </div>

  <div style={{ flex: 1, minWidth: "300px" }}>
    <FormInputGroup>
      <label>Cuenta Mayor:</label>
      <input type="text" value={ctaMayor} onChange={(e) => setCtaMayor(e.target.value)} />
    </FormInputGroup>

    <FormInputGroup>
      <label>Programa:</label>
      <input type="text" value={programa} onChange={(e) => setPrograma(e.target.value)} />
    </FormInputGroup>

    <FormInputGroup>
      <label>Sub-Programa:</label>
      <input type="text" value={subPrograma} onChange={(e) => setSubPrograma(e.target.value)} />
    </FormInputGroup>

    <FormInputGroup>
      <label>Meta:</label>
      <input type="text" value={meta} onChange={(e) => setMeta(e.target.value)} />
    </FormInputGroup>
  </div>
</div>


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
                <View style={{ width: "10%" }}>
                  <Text>Fecha: {formattedDate}</Text>
                  <Text>Generado por: {dataKardex?.[0]?.[0]?.nombres || "Usuario X"}</Text>

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
                <View style={{ marginBottom: 10, fontSize: 8 }}>
  <Text>Dependencia Solicitante: {dependencia}</Text>
  <Text>Solicito Entregar a: {solicitaEntrega}</Text>
  <Text>Con Destino a: {destino}</Text>
  <Text>Referencia: {referencia}</Text>
  <Text>Cuenta Mayor: {ctaMayor}</Text>
  <Text>Programa: {programa}</Text>
  <Text>Sub-Programa: {subPrograma}</Text>
  <Text>Meta: {meta}</Text>
</View>



              <View style={styles.table}>
              {renderTableRow(
  {
    nombres: "Usuario",
    codigointerno: "Codigo Patrimonio",
    stock: "Stock",
    descripcion: "Producto",
    codigobarras: "Cuenta Contable",
    cantidad: "Cantidad",
    preciocompra: "Precio Unitario",   
    tipo: "Tipo",
    fecha: "Fecha",
    total: "Total",
    
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
  height: 100vh;
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
const FormInputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  label {
    font-size: 14px;
    color: ${(props) => props.theme.text};
  }

  input,
  select {
    background-color: ${(props) => props.theme.bg};
    color: ${(props) => props.theme.text};
    border: 1px solid #414244;
    border-radius: 10px;
    padding: 12px 15px;
    font-size: 16px;
    outline: none;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
  }

  select:focus {
    outline: none;
  }
    
`;


export default KardexEntradaSalida;
//COLOCAR N SELECT BOX PARA VER LA UNIDAD O EL META