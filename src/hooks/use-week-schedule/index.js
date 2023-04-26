import { useState, useEffect, useCallback } from 'react'// Import useState, useEffect and useCallback
import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import dayjs from 'dayjs'// Import dayjs
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import API from '../../api/NewUrl'// Import API base url
import { getDayHours } from '../../utils/schedule-status'

dayjs.extend(utc)
dayjs.extend(timezone)

const useWeekSchedule = (url, timezone) => {
    dayjs.tz.setDefault(timezone)
    const [fetchedData, setFetchedData] = useState({// Set initia fetch state to empty
        data: [],
        isLoading: true,
        error: false,
    })
    const controller = new AbortController()// Create a new AbortController

    const weekHours = getDayHours() // Array of hours in a day 24h format

    const weekDays = ["sunday","monday", "tuesday", "wednesday", "thursday", "friday", "saturday",]

    const fetchData = useCallback(async () => {// Create a new fetchData function
        try {
            const auth = await Auth.currentSession()// Get current session
            const token = auth.getAccessToken().getJwtToken()// Get token from session
            const options = { // Set options for fetch
                headers: {
                    'Authorization': token,
                    ...(process.env.REACT_APP_NEW_ENV && {'env': process.env.REACT_APP_NEW_ENV}),
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
            const response = await API.get(url, options)// Fetch data from API
            const { data } = await response.data// Get data from response
            const weekData = weekHours.reduce((acc, time) => {
                const dayObj = weekDays.reduce((obj, day) => {
                    obj[day] = data.filter(item => day === dayjs(item.start_time).tz().format('dddd').toLowerCase() && time === dayjs(item.start_time).tz().format('HH:mm'))
                    obj[day] = obj[day] ? obj[day] : []
                    return obj
                }, {})

                acc.push({
                    key: time,
                    time,
                    ...dayObj
                })

                return acc
            }, [])

            setFetchedData({// Set fetched data
                data: weekData,
                isLoading: false,
                error: false,
            })
        } catch (error) {
            setFetchedData({// Set fetch state to error
                data: [],
                isLoading: false,
                error: true,
            })
            console.log(error)
        }
    }, [url, timezone])

    const refetch = () => {// Create a new refetch function
        setFetchedData({// Set fetched data to initial state
            data: [],
            isLoading: true,
            error: false,
        })
        fetchData()// Call fetchData function
    }

    useEffect(() => {
        fetchData()// Call fetchData function
        return () => controller.abort()// Abort fetch request
    }, [url])// Call fetchData function on mount and unmount

    const { data, isLoading, error } = fetchedData// Destructure fetched data
    return { data, isLoading, error, refetch }// Return fetched data
}

export default useWeekSchedule