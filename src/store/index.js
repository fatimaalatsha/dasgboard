import create from "zustand"
import { devtools, persist } from "zustand/middleware"

let filterStore = (set) => ({
    filter: {
        pagination: {
        current: 1,
        pageSize: 50,
        showSizeChanger: true,
        },
        sort: {
          created_at: 'desc',
        }
    },
    setFilter: (filter) => set((state) => ({ filter: { ...state.filter, ...filter } })),
})

filterStore = devtools(filterStore)
filterStore = persist(filterStore, { name: "filter" })

export const useFilterStore = create(filterStore)