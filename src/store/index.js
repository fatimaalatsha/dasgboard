import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import pageSize from "../assets/data/table_page_size"; // Import table page size definition
import dayjs from "dayjs"; // Import date handlers
import utc from "dayjs/plugin/utc"; // Import dayjs utc plugin

dayjs.extend(utc);

let filterStore = (set) => ({
  driverFilter: {
    pagination: {
      current: 1,
      pageSize: 50,
      showSizeChanger: true,
      pageSizeOptions: pageSize,
      position: ["bottomRight", "topRight"],
    },
    sort: {
      created_at: "desc",
    },
    filter: {
      status: ["in|active", "inactive"],
    },
  },
  setDriverFilter: (filter) =>
    set((state) => ({ driverFilter: { ...state.driverFilter, ...filter } })),
  documentFilter: {
    pagination: {
      current: 1,
      pageSize: 20,
      showSizeChanger: true,
      pageSizeOptions: pageSize,
      position: ["bottomRight", "topRight"],
    },
    sort: {
      updated_at: "desc",
    },
    filter: {
      current: "eq|true",
    },
  },
  setDocumentFilter: (filter) =>
    set((state) => ({
      documentFilter: { ...state.documentFilter, ...filter },
    })),
  applicantFilter: {
    pagination: {
      current: 1,
      pageSize: 50,
      showSizeChanger: true,
      pageSizeOptions: pageSize,
      position: ["bottomRight", "topRight"],
    },
    sort: {
      created_at: "desc",
    },
    filter: {
      status: ["in|onboard", "pending"],
    },
  },
  setApplicantFilter: (filter) =>
    set((state) => ({
      applicantFilter: { ...state.applicantFilter, ...filter },
    })),
  autofleetFilter: {
    pagination: {
      current: 1,
      pageSize: 50,
      showSizeChanger: true,
      pageSizeOptions: pageSize,
      position: ["bottomRight", "topRight"],
    },
    filter: {
      status: null,
      //["in|online", "stand-by", "activating", "offline", "active"]
    },
    city_id: null,
    // sort: "ASC",
  },
  setAutofleetFilter: (filter) =>
    set((state) => ({
      autofleetFilter: {
        ...state.autofleetFilter,
        ...filter,
      },
    })),
  financeFilter: {
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      pageSizeOptions: pageSize,
      position: ["bottomRight", "topRight"],
    },
    sort: {
      // created_at: "desc",
    },
    filter: {
      // status: ["in|active", "inactive"],
    },
  },
  setFinanceFilter: (filter) =>
    set((state) => ({
      financeFilter: { ...state.financeFilter, ...filter },
    })),
  
  ridesFilter: {
    pagination: {
      current: 1,
      pageSize: 50,
      showSizeChanger: true,
      pageSizeOptions: pageSize,
      position: ["bottomRight", "topRight"],
    },
    filter: {
      status: ["in|completed", "canceled"],
    },
  },
  setRidesFilter: (filter) =>
    set((state) => ({
      ridesFilter: { ...state.ridesFilter, ...filter },
    })),
  scheduleFilter: {
    filter: {
      city_id: "",
      status: null,
    },
    tz: "America/Thunder_Bay",
    city_label: "",
    paginated: false,
    navigation: {
      tab: "active", // active, draft, approval
      view: 1, // 1 = week, 0 = day, 2 = month (default: 1)
      template: 1, // 1 = Table, 0 = Grid (default: 1)
    },
    pagination: {
      current: 1,
      pageSize: 20,
      showSizeChanger: true,
      pageSizeOptions: pageSize,
      position: ["bottomRight", "topRight"],
    },
  },
  setScheduleFilter: (filter) =>
    set((state) => ({
      scheduleFilter: { ...state.scheduleFilter, ...filter },
    })),
  reportFilter: {
    date_from: dayjs().subtract(90, "days").format("YYYY-MM-DD"),
    date_to: dayjs().format("YYYY-MM-DD"),
  },
  setReportFilter: (filter) =>
    set((state) => ({
      reportFilter: { ...state.reportFilter, ...filter },
    })),
})

filterStore = devtools(filterStore, { enabled: process.env.REACT_APP_ENV === "admin_dev" })
filterStore = persist(filterStore, { name: "filter" })

export const useFilterStore = create(filterStore);