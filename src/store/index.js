import create from "zustand"
import { devtools, persist } from "zustand/middleware"
import pageSize from "../assets/data/table_page_size"// Import table page size definition

let filterStore = (set) => ({
    driverFilter: {
        pagination: {
          current: 1,
          pageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: pageSize,
          position: ['bottomRight', 'topRight'],
        },
        sort: {
          created_at: 'desc',
        },
        filter: {
          status: ['in|active', 'inactive'],
        }
    },
    setDriverFilter: (filter) => set((state) => ({ driverFilter: { ...state.driverFilter, ...filter } })),
    documentFilter: {
        pagination: {
          current: 1,
          pageSize: 20,
          showSizeChanger: true,
          pageSizeOptions: pageSize,
          position: ['bottomRight', 'topRight'],
        },
        sort: {
          updated_at: 'desc',
        },
        filter: {
          current: 'eq|true',
        }
    },
    setDocumentFilter: (filter) => set((state) => ({ documentFilter: { ...state.documentFilter, ...filter } })),
    applicantFilter: {
        pagination: {
          current: 1,
          pageSize: 50,
          showSizeChanger: true,
          pageSizeOptions: pageSize,
          position: ['bottomRight', 'topRight'],
        },
        sort: {
          created_at: 'desc',
        },
        filter: {
          status: ['in|onboard', 'pending'],
        }
    },
    setApplicantFilter: (filter) => set((state) => ({ applicantFilter: { ...state.applicantFilter, ...filter } })),
    scheduleFilter: {
      city: null,
      status: null,
      date: null,
      tz: null,
    },
    setScheduleFilter: (filter) => set((state) => ({ scheduleFilter: { ...state.scheduleFilter, ...filter } })),
})

filterStore = devtools(filterStore, { enabled: process.env.REACT_APP_ENV === "admin_dev" })
filterStore = persist(filterStore, { name: "filter" })

export const useFilterStore = create(filterStore)