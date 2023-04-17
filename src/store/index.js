import create from "zustand";
import { devtools, persist } from "zustand/middleware";
import dayjs from "dayjs";

let filterStore = (set) => ({
  driverFilter: {
    pagination: {
      current: 1,
      pageSize: 50,
      showSizeChanger: true,
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
  reportFilter: {
   
      date_from: dayjs().subtract(90, "days").format("YYYY-MM-DD"),
      date_to: dayjs().format("YYYY-MM-DD"),
   
  },
  setReportFilter: (filter) =>
    set((state) => ({
      reportFilter: { ...state.reportFilter, ...filter }
    })),
});

filterStore = devtools(filterStore, {
  enabled: process.env.REACT_APP_ENV === "admin_dev",
});
filterStore = persist(filterStore, { name: "filter" });

export const useFilterStore = create(filterStore);
