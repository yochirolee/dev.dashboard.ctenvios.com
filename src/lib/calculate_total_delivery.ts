import { useOrderStore } from "@/stores/order-store";

export const calculateTotalDeliveryFee = () => {
   // calculate the total delivery fee from the receiver province and city
   //if province name is equal to La Habana, Artemisa or Mayabeque the delivery fee is 6000
   //if province name is equal to City name, then the city is capital and the delivery fee is 1200
   //if not return 18000
   const selectedReceiver = useOrderStore((state: any) => state.selectedReceiver);

   if (!selectedReceiver) return 0;
   if (
      selectedReceiver.province === "La Habana" ||
      selectedReceiver.province === "Artemisa" ||
      selectedReceiver.province === "Mayabeque"
   ) {
      return 600;
   }
   if (selectedReceiver.city === selectedReceiver.province) {
      return 1200;
   }
   if (selectedReceiver.city === "Santa Clara" || selectedReceiver.city === "Bayamo") {
      return 1200;
   }
   return 1800;
};
