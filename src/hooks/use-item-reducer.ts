import { useReducer } from "react";
import { calculate_row_subtotal } from "@/lib/cents-utils";
import type { ShippingRate, Customs } from "@/data/types";

export interface ItemState {
   description: string;
   weight: number | undefined;
   price_in_cents: number;
   rate_id: number;
   unit: "PER_LB" | "FIXED";
   insurance_fee_in_cents: number;
   customs_fee_in_cents: number;
   charge_fee_in_cents: number;
   customs_id: number;
   subtotal: number;
   delivery_fee_in_cents: number;
}

type ItemAction =
   | {
        type: "TOGGLE_UNIT";
        payload: {
           newUnit: "PER_LB" | "FIXED";
           activeRate: ShippingRate | null;
        };
     }
   | {
        type: "SELECT_CUSTOMS";
        payload: {
           customs: Customs;
        };
     }
   | {
        type: "SELECT_FIXED_RATE";
        payload: {
           rate: ShippingRate;
        };
     }
   | {
        type: "UPDATE_FIELD";
        payload: {
           field: keyof ItemState;
           value: any;
        };
     }
   | {
        type: "CALCULATE_SUBTOTAL";
     }
   | {
        type: "SET_INSURANCE";
        payload: { amount: number };
     }
   | {
        type: "SET_CHARGE";
        payload: { amount: number };
     };

export function itemReducer(state: ItemState, action: ItemAction): ItemState {
   switch (action.type) {
      case "TOGGLE_UNIT": {
         const { newUnit, activeRate } = action.payload;

         // Reset state when toggling unit
         const newState: ItemState = {
            ...state,
            unit: newUnit,
            subtotal: 0,
            description: "",
            rate_id: activeRate?.id || 0,
            price_in_cents: activeRate?.price_in_cents || 0,
            customs_fee_in_cents: 0,
            customs_id: 0, // Reset customs_id when toggling unit
         };

         return newState;
      }

      case "SELECT_CUSTOMS": {
         const { customs } = action.payload;
         const newState: ItemState = {
            ...state,
            customs_id: customs.id || 0,
            customs_fee_in_cents: customs.fee_in_cents || 0,
            description: customs.description || "",
            // Add insurance_fee_in_cents from customs if available
            insurance_fee_in_cents: customs.insurance_fee_in_cents || state.insurance_fee_in_cents,
         };

         // Recalculate subtotal
         newState.subtotal = calculate_row_subtotal(
            newState.price_in_cents,
            newState.weight || 0,
            newState.customs_fee_in_cents,
            newState.charge_fee_in_cents,
            newState.insurance_fee_in_cents,
            newState.unit
         );

         return newState;
      }

      case "SELECT_FIXED_RATE": {
         const { rate } = action.payload;
         const newState: ItemState = {
            ...state,
            rate_id: rate.id || 0,
            price_in_cents: rate.price_in_cents || 0,
            description: rate.description || "",
            unit: "FIXED",
         };

         // Recalculate subtotal
         newState.subtotal = calculate_row_subtotal(
            newState.price_in_cents,
            newState.weight || 0,
            newState.customs_fee_in_cents,
            newState.charge_fee_in_cents,
            newState.insurance_fee_in_cents,
            newState.unit
         );

         return newState;
      }

      case "UPDATE_FIELD": {
         const { field, value } = action.payload;
         const newState: ItemState = {
            ...state,
            [field]: value,
         };

         // Recalculate subtotal if relevant fields changed
         if (
            field === "weight" ||
            field === "price_in_cents" ||
            field === "customs_fee_in_cents" ||
            field === "charge_fee_in_cents" ||
            field === "insurance_fee_in_cents"
         ) {
            newState.subtotal = calculate_row_subtotal(
               newState.price_in_cents,
               newState.weight || 0,
               newState.customs_fee_in_cents,
               newState.charge_fee_in_cents,
               newState.insurance_fee_in_cents,
               newState.unit
            );
         }

         return newState;
      }

      case "CALCULATE_SUBTOTAL": {
         const subtotal = calculate_row_subtotal(
            state.price_in_cents,
            state.weight || 0,
            state.customs_fee_in_cents,
            state.charge_fee_in_cents,
            state.insurance_fee_in_cents,
            state.unit
         );

         return {
            ...state,
            subtotal,
         };
      }

      case "SET_INSURANCE": {
         console.log("SET_INSURANCE", action.payload.amount);
         const newState: ItemState = {
            ...state,
            insurance_fee_in_cents: action.payload.amount,
         };

         newState.subtotal = calculate_row_subtotal(
            newState.price_in_cents,
            newState.weight || 0,
            newState.customs_fee_in_cents,
            newState.charge_fee_in_cents,
            newState.insurance_fee_in_cents,
            newState.unit
         );

         return newState;
      }

      case "SET_CHARGE": {
         const newState: ItemState = {
            ...state,
            charge_fee_in_cents: action.payload.amount,
         };

         newState.subtotal = calculate_row_subtotal(
            newState.price_in_cents,
            newState.weight || 0,
            newState.customs_fee_in_cents,
            newState.charge_fee_in_cents,
            newState.insurance_fee_in_cents,
            newState.unit
         );

         return newState;
      }

      default:
         return state;
   }
}

export function useItemReducer(initialState: ItemState): [ItemState, React.Dispatch<ItemAction>] {
   return useReducer(itemReducer, initialState);
}
