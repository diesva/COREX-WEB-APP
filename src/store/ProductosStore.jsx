import { create } from "zustand";
import {
  BuscarProductos,
  EditarProductos,
  EliminarProductos,
  InsertarProductos,
  MostrarProductos,
  ReportStockProductosTodos,ReportStockXProducto,ReportStockBajoMinimo,ReportKardexEntradaSalida,ReportInventarioValorado
} from "../index";



export const useProductosStore = create((set, get) => ({
  buscador: "",
  setBuscador: (p) => {
    set({ buscador: p });
  },
  dataproductos: [],
  productoItemSelect: [],
  parametros: {},
  mostrarProductos: async (p) => {
    const response = await MostrarProductos(p);
    set({ parametros: p });
    set({ dataproductos: response });
    set({ productoItemSelect: [] });
    return response;
  },
  selectProductos: (p) => {
    set({ productoItemSelect: p });
  },
  insertarProductos: async (p) => {
    await InsertarProductos(p);
    const { mostrarProductos } = get();
    const { parametros } = get();
    set(mostrarProductos(parametros));
  },
  eliminarProductos: async (p) => {
    await EliminarProductos(p);
    const { mostrarProductos } = get();
    const { parametros } = get();
    console.log("parametros", parametros);
    set(mostrarProductos(parametros));
  },

  editarProductos: async (p) => {
    await EditarProductos(p);
    const { mostrarProductos } = get();
    const { parametros } = get();
    console.log("parametros", parametros);
    set(mostrarProductos(parametros));
  },
  buscarProductos: async (p) => {
    const response = await BuscarProductos(p);
    set({ dataproductos: response });
    return response;
  },
  reportStockProductosTodos: async (p) => {
    const response = await ReportStockProductosTodos(p);
    return response;
  },
  reportStockXproducto: async (p) => {
    const response = await ReportStockXProducto(p);
    return response;
  },
  reportBajoMinimo: async (p) => {
    const response = await ReportStockBajoMinimo(p);
    return response;
  },
  reportKardexEntradaSalida: async (p) => {
    const response = await ReportKardexEntradaSalida(p);
    return response;
  },
  reportInventarioValorado: async (p) => {
    const response = await ReportInventarioValorado(p);
    return response;
  },
  
  

}));
//
export const ReportStockPorCategoria = async ({ id_empresa, categoria_id }) => {
  const { data, error } = await supabase
    .from("productos")
    .select("id, descripcion, stock")
    .eq("id_empresa", id_empresa)
    .eq("categoria_id", categoria_id);

  if (error) throw error;
  return data;
};

export const ReportStockPorMarca = async ({ id_empresa, marca_id }) => {
  const { data, error } = await supabase
    .from("productos")
    .select("id, descripcion, stock")
    .eq("id_empresa", id_empresa)
    .eq("marca_id", marca_id);

  if (error) throw error;
  return data;
};

export const ReportStockPorSeleccion = async ({ id_empresa, productos_ids }) => {
  const { data, error } = await supabase
    .from("productos")
    .select("id, descripcion, stock")
    .eq("id_empresa", id_empresa)
    .in("id", productos_ids);

  if (error) throw error;
  return data;
};
