// src/api/reportesPersonalizados.js
import { supabase } from "../supabase/supabase.config"; // Ajusta la ruta según tu proyecto

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
