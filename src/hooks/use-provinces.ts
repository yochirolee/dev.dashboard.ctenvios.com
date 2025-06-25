import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export const useProvinces = () => {
	return useQuery({ queryKey: ["provinces"], queryFn: api.provinces.get });
};
