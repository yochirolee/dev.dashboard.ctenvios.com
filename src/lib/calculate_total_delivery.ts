import { useOrderStore } from "@/stores/order-store";

// Normalize string for comparison (remove accents, lowercase, trim)
const normalizeString = (value: unknown): string => {
   if (value == null) return "";
   const str = typeof value === "string" ? value : String(value);
   return str
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove diacritics (accents)
};

export const calculateTotalDeliveryFee = () => {
   // calculate the total delivery fee from the receiver province and city
   //if province name is equal to La Habana, Artemisa or Mayabeque the delivery fee is 600
   //if province name is equal to City name, then the city is capital and the delivery fee is 1200
   //if not return 1800
   const selectedReceiver = useOrderStore((state: any) => state.selectedReceiver);

   if (!selectedReceiver) return 0;

   const province = normalizeString(selectedReceiver.province || "");
   const city = normalizeString(selectedReceiver.city || "");

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
};
