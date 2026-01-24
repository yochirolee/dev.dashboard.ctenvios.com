import { useMemo } from "react";
import { useOrderStore } from "@/stores/order-store";
import { useShallow } from "zustand/react/shallow";
import { useProvinces } from "@/hooks/use-provinces";

interface Province {
   id: number;
   name: string;
   cities?: Array<{ id: number; name: string }>;
}

const normalizeString = (value: unknown): string => {
   if (value == null) return "";
   const str = typeof value === "string" ? value : String(value);
   return str
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
};

// Extract name from province/city - handles both string and object formats
const extractName = (value: unknown): string => {
   if (!value) return "";
   if (typeof value === "object" && value !== null && "name" in value) {
      return (value as { name: string }).name;
   }
   return typeof value === "string" ? value : "";
};

export const useDeliveryFee = (): number => {
   const selectedReceiver = useOrderStore(
      useShallow((state) => state.selectedReceiver)
   );
   const { data: provinces } = useProvinces();

   const deliveryFee = useMemo(() => {
      if (!selectedReceiver) return 0;

      // Get province/city names - handles both string and object formats
      let provinceName = extractName(selectedReceiver.province);
      let cityName = extractName(selectedReceiver.city);

      // If names are missing but IDs exist, look them up from provinces data
      if (!provinceName && selectedReceiver.province_id && provinces) {
         const province = provinces.find((p: Province) => p.id === selectedReceiver.province_id);
         provinceName = province?.name || "";

         if (!cityName && selectedReceiver.city_id && province?.cities) {
            const city = province.cities.find((c: { id: number; name: string }) => c.id === selectedReceiver.city_id);
            cityName = city?.name || "";
         }
      }

      const province = normalizeString(provinceName);
      const city = normalizeString(cityName);

      // La Habana, Artemisa, Mayabeque provinces
      if (province === "la habana" || province === "artemisa" || province === "mayabeque") {
         return 600;
      }

      // Capital cities (city name matches province name)
      if (city === province && city !== "") {
         return 1200;
      }

      // Special cities
      if (city === "santa clara" || city === "bayamo") {
         return 1200;
      }

      return 1800;
   }, [
      selectedReceiver?.province,
      selectedReceiver?.city,
      selectedReceiver?.province_id,
      selectedReceiver?.city_id,
      provinces,
   ]);

   return deliveryFee;
};
