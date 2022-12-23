import create from "zustand"
import { devtools, persist } from "zustand/middleware"

let filterStore = (set) => ({
    driverFilter: {
        pagination: {
          current: 1,
          pageSize: 50,
          showSizeChanger: true,
        },
        sort: {
          created_at: 'desc',
        }
    },
    setDriverFilter: (filter) => set((state) => ({ driverFilter: { ...state.driverFilter, ...filter } })),
    documentFilter: {
        pagination: {
          current: 1,
          pageSize: 20,
          showSizeChanger: true,
        },
        sort: {
          updated_at: 'desc',
        }
    },
    setDocumentFilter: (filter) => set((state) => ({ documentFilter: { ...state.documentFilter, ...filter } })),
})

filterStore = devtools(filterStore, { enabled: process.env.REACT_APP_ENV === "admin_dev" })
filterStore = persist(filterStore, { name: "filter" })

export const useFilterStore = create(filterStore)