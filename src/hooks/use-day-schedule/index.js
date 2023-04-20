import { useState, useEffect, useCallback } from 'react'// Import useState, useEffect and useCallback
import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import dayjs from 'dayjs'// Import dayjs
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import API from '../../api/NewUrl'// Import API base url
import { getDayHours } from '../../utils/schedule-status'

dayjs.extend(utc)
dayjs.extend(timezone)

const useDaySchedule = (url, timezone) => {
    const [fetchedData, setFetchedData] = useState({// Set initia fetch state to empty
        data: [],
        isLoading: true,
        error: false,
    })
    const controller = new AbortController()// Create a new AbortController
    const dayHours = getDayHours() // Array of hours in a day 24h format

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
            const { items } = await response.data// Get data from response
            const dayData = items.reduce((acc, name) => {
                const keyName = `${name.first_name} ${name.last_name}`
                const timeObj = dayHours.reduce((obj, time) => {
                    obj[time] = name.shifts.filter(item => time === dayjs(item.start_time).tz(timezone).format('HH:mm'))
                    obj[time] = obj[time] ? obj[time] : []
                    return obj
                }, {})

                acc.push({
                    key: name.user_id,
                    name: keyName,
                    ...timeObj
                })

                return acc
            }, [])

            //console.log(dayData)

            setFetchedData({// Set fetched data
                data: dayData,
                isLoading: false,
                error: false,
            })
        }
        catch (error) {
            setFetchedData({// Set fetched data
                data: [],
                isLoading: false,
                error: true,
            })
        }
    }, [url, timezone])

    const refetch = () => {// Create a new refetch function
        setFetchedData({// Set fetched data
            data: [],
            isLoading: true,
            error: false,
        })
        fetchData()// Call fetchData function
    }

    useEffect(() => {// Create a new useEffect
        fetchData()// Call fetchData function
        return () => controller.abort()// Abort fetch on unmount
    }, [url])

    const { data, isLoading, error } = fetchedData// Destructure fetchedData
    return { data, isLoading, error, refetch } // Return data, isLoading, error and refetch
}

export default useDaySchedule