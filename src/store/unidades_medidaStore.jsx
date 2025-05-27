// src/store/UnidadesMedidaStore.js
import { create } from "zustand";
import { supabase } from "../supabase/supabase.config";


export const useUnidadesMedidaStore = create((set) => ({
  dataunidades: [],
  unidadItemSelect: { id: 0, descripcion: "Seleccionar" },
  selectUnidad: (unidad) => set({ unidadItemSelect: unidad }),
  getUnidades: async () => {
    const { data } = await supabase.from("unidades_medida").select();
    set({ dataunidades: data });
  },
}));