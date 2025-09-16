import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";
import type { Customer, Invoice, Receiver, Customs } from "@/data/types";

/**
 * Infinite query hooks for better UX with large datasets
 * Following functional programming patterns and TypeScript best practices
 */

interface InfiniteQueryResult<T> {
	pages: Array<{
		data: T[];
		totalCount: number;
		currentPage: number;
		totalPages: number;
	}>;
	pageParams: number[];
}

interface UseInfiniteOptions {
	limit?: number;
	enabled?: boolean;
	staleTime?: number;
}

export const useInfiniteCustomers = (searchQuery?: string, options: UseInfiniteOptions = {}) => {
	const { limit = 50, enabled = true, staleTime = 5 * 60 * 1000 } = options;

	return useInfiniteQuery<any, Error, InfiniteQueryResult<Customer>>({
		queryKey: ["infinite-customers", searchQuery],
		queryFn: ({ pageParam = 0 }) => {
			const page = typeof pageParam === "number" ? pageParam : 0;
			if (searchQuery) {
				return api.customer.search(searchQuery, page, limit);
			}
			return api.customer.get(page, limit);
		},
		getNextPageParam: (lastPage) => {
			const { currentPage, totalPages } = lastPage;
			return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
		},
		getPreviousPageParam: (firstPage) => {
			return firstPage.currentPage > 0 ? firstPage.currentPage - 1 : undefined;
		},
		initialPageParam: 0,
		enabled,
		staleTime,
		maxPages: 10, // Limit memory usage
	});
};

export const useInfiniteInvoices = (
	searchQuery?: string,
	startDate?: string,
	endDate?: string,
	options: UseInfiniteOptions = {},
) => {
	const { limit = 25, enabled = true, staleTime = 2 * 60 * 1000 } = options;

	return useInfiniteQuery<any, Error, InfiniteQueryResult<Invoice>>({
		queryKey: ["infinite-invoices", searchQuery, startDate, endDate],
		queryFn: ({ pageParam = 0 }) => {
			const page = typeof pageParam === "number" ? pageParam : 0;
			if (searchQuery || startDate || endDate) {
				return api.invoices.search(searchQuery || "", page, limit, startDate || "", endDate || "");
			}
			return api.invoices.get(page, limit);
		},
		getNextPageParam: (lastPage) => {
			const { currentPage, totalPages } = lastPage;
			return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
		},
		getPreviousPageParam: (firstPage) => {
			return firstPage.currentPage > 0 ? firstPage.currentPage - 1 : undefined;
		},
		initialPageParam: 0,
		enabled,
		staleTime,
		maxPages: 15, // More pages for invoices as they're frequently accessed
	});
};

export const useInfiniteReceivers = (searchQuery?: string, options: UseInfiniteOptions = {}) => {
	const { limit = 50, enabled = true, staleTime = 5 * 60 * 1000 } = options;

	return useInfiniteQuery<any, Error, InfiniteQueryResult<Receiver>>({
		queryKey: ["infinite-receivers", searchQuery],
		queryFn: ({ pageParam = 0 }) => {
			const page = typeof pageParam === "number" ? pageParam : 0;
			if (searchQuery) {
				return api.receivers.search(searchQuery, page, limit);
			}
			return api.receivers.get(page, limit);
		},
		getNextPageParam: (lastPage) => {
			const { currentPage, totalPages } = lastPage;
			return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
		},
		getPreviousPageParam: (firstPage) => {
			return firstPage.currentPage > 0 ? firstPage.currentPage - 1 : undefined;
		},
		initialPageParam: 0,
		enabled,
		staleTime,
		maxPages: 8,
	});
};

export const useInfiniteCustoms = (options: UseInfiniteOptions = {}) => {
	const { limit = 25, enabled = true, staleTime = 10 * 60 * 1000 } = options;

	return useInfiniteQuery<any, Error, InfiniteQueryResult<Customs>>({
		queryKey: ["infinite-customs"],
		queryFn: ({ pageParam = 0 }) => {
			const page = typeof pageParam === "number" ? pageParam : 0;
			return api.customs.get(page, limit);
		},
		getNextPageParam: (lastPage) => {
			const { currentPage, totalPages } = lastPage;
			return currentPage < totalPages - 1 ? currentPage + 1 : undefined;
		},
		getPreviousPageParam: (firstPage) => {
			return firstPage.currentPage > 0 ? firstPage.currentPage - 1 : undefined;
		},
		initialPageParam: 0,
		enabled,
		staleTime,
		maxPages: 5, // Customs data is relatively stable
	});
};

/**
 * Utility functions for working with infinite query data
 */
export const infiniteQueryUtils = {
	/**
	 * Flatten infinite query pages into a single array
	 */
	flattenPages: <T>(data?: InfiniteQueryResult<T>): T[] => {
		return data?.pages?.flatMap((page) => page.data) || [];
	},

	/**
	 * Get total count from infinite query
	 */
	getTotalCount: <T>(data?: InfiniteQueryResult<T>): number => {
		return data?.pages?.[0]?.totalCount || 0;
	},

	/**
	 * Check if there are more pages to load
	 */
	hasNextPage: <T>(_data?: InfiniteQueryResult<T>, hasNextPage?: boolean): boolean => {
		return hasNextPage || false;
	},

	/**
	 * Get current loaded items count
	 */
	getLoadedCount: <T>(data?: InfiniteQueryResult<T>): number => {
		return data?.pages?.reduce((count, page) => count + page.data.length, 0) || 0;
	},
};

/**
 * Hook for optimistic updates with infinite queries
 */
export const useOptimisticInfiniteUpdate = () => {
	const queryClient = useQueryClient();

	const addOptimisticItem = <T extends { id?: number }>(queryKey: string[], newItem: T): void => {
		queryClient.setQueryData(queryKey, (oldData: InfiniteQueryResult<T> | undefined) => {
			if (!oldData) return oldData;

			const newPages = [...oldData.pages];
			if (newPages[0]) {
				newPages[0] = {
					...newPages[0],
					data: [newItem, ...newPages[0].data],
					totalCount: newPages[0].totalCount + 1,
				};
			}

			return {
				...oldData,
				pages: newPages,
			};
		});
	};

	const updateOptimisticItem = <T extends { id?: number }>(
		queryKey: string[],
		itemId: number,
		updates: Partial<T>,
	): void => {
		queryClient.setQueryData(queryKey, (oldData: InfiniteQueryResult<T> | undefined) => {
			if (!oldData) return oldData;

			const newPages = oldData.pages.map((page) => ({
				...page,
				data: page.data.map((item) => (item.id === itemId ? { ...item, ...updates } : item)),
			}));

			return {
				...oldData,
				pages: newPages,
			};
		});
	};

	const removeOptimisticItem = <T extends { id?: number }>(
		queryKey: string[],
		itemId: number,
	): void => {
		queryClient.setQueryData(queryKey, (oldData: InfiniteQueryResult<T> | undefined) => {
			if (!oldData) return oldData;

			const newPages = oldData.pages.map((page) => ({
				...page,
				data: page.data.filter((item) => item.id !== itemId),
				totalCount: page.totalCount - 1,
			}));

			return {
				...oldData,
				pages: newPages,
			};
		});
	};

	return {
		addOptimisticItem,
		updateOptimisticItem,
		removeOptimisticItem,
	};
};
