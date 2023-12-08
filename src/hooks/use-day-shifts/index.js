import { useState, useCallback, useEffect } from "react"
import { Auth } from "aws-amplify"
import dayjs from 'dayjs'// Import dayjs
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import API from "../../api/NewUrl"

dayjs.extend(utc)
dayjs.extend(timezone)

const useDayShifts = (url, tz, day) => {
    dayjs.tz.setDefault(tz)
    const initialState = {
        data: [],
        isLoading: true,
        error: false
    }
    const dayHours = [...Array(24)].map((_,idx) => (
        idx < 10 ? `0${idx}:00` : `${idx}:00`
    ))

    const [fetchedData, setFetchedData] = useState(initialState)

    const getAuth = async () => {
        try {
            const auth = await Auth.currentSession()
            const token = auth.getAccessToken().getJwtToken()
            const options = {
                headers: {
                    ...(process.env.REACT_APP_NEW_ENV && {'env': process.env.REACT_APP_NEW_ENV}),
                    'Authorization': token,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
            return { options }
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    const fetchData = useCallback(async () => {
        try {
            const { options } = await getAuth()
            const response = await API.get(url, options)
            const { items } = await response.data

            const duplicatedItems = items.flatMap((item) => // Duplicate overnight shifts
                item.is_overnight && dayjs(item.end_time).tz().utc().isSame(dayjs(day).tz().utc(), 'day') && dayjs(item.start_time).tz().utc().isSame(dayjs(day).tz().utc(), 'day')
                    ? [item, { ...item, is_duplicate: true }]
                    : item
            )

            const shiftItems = duplicatedItems.map(item => { // Add overnight times
                if (item.is_overnight) {
                    const isSameDay = day.tz().utc().isSame(dayjs(item.end_time), 'day');
                    if (!isSameDay) {
                      item.overnight_end = item.end_time;
                      item.end_time = day.tz().utc().endOf('day').toISOString();
                      item.overnight_start = item.start_time;
                    } else {
                      item.overnight_start = item.start_time;
                      item.start_time = day.tz().utc().startOf('day').toISOString();
                      item.overnight_end = item.end_time;
                    }
                  }
                  return item
            })

            const shiftData = dayHours.reduce((obj, time) => {
                obj[time] = shiftItems.filter(shift => dayjs(shift.start_time).tz().utc().format('HH:mm') === time) || []
                return obj
            }, { key: day.format('YYYY-MM-DD') })

            console.log('shiftData: ', shiftData)

            setFetchedData({
                data: items,
                isLoading: false,
                error: false
            })
        } catch (error) {
            console.log(error)
            setFetchedData({
                ...initialState,
                isLoading: false,
                error: true,
            })
            throw error
        }
    }, [])

    const refetch = () => {
        setFetchedData(initialState)
        fetchData()
    }

    useEffect(() => {
        fetchData()
    }, [url])

    const { data, isLoading, error } = fetchedData
    return { data, isLoading, error, refetch }
}

export default useDayShifts