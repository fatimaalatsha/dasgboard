import { useState, useEffect, useCallback } from 'react'// Import useState, useEffect and useCallback
import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import dayjs from 'dayjs'// Import dayjs
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import API from '../../api/NewUrl'// Import API base url
import { getDayHours } from '../../utils/schedule-status'

dayjs.extend(utc)
dayjs.extend(timezone)

const useDaySchedule = (url, timezone, selectedDay) => {
    dayjs.tz.setDefault(timezone)
    const [fetchedData, setFetchedData] = useState({// Set initia fetch state to empty
        data: [],
        response: [],
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
            const { data } = await response.data// Get data from response

            const dayData = data.map(item => {
                const dayItems = item.shifts.map(shift => {
                  if (shift.is_overnight) {
                    const isSameDay = selectedDay.tz().utc().isSame(dayjs(shift.end_time), 'day');
                    if (!isSameDay) {
                      shift.overnight_end = shift.end_time;
                      shift.end_time = selectedDay.tz().utc().endOf('day').toISOString();
                      shift.overnight_start = shift.start_time;
                    } else {
                      shift.overnight_start = shift.start_time;
                      shift.start_time = selectedDay.tz().utc().startOf('day').toISOString();
                      shift.overnight_end = shift.end_time;
                    }
                  }
                  return shift;
                });
        
                const keyName = `${item.first_name} ${item.last_name}`;
                const timeObj = dayHours.reduce((obj, time) => {
                  obj[time] = dayItems.filter(shift => dayjs(shift.start_time).tz().utc().format('HH:mm') === time) || [];
                  return obj;
                }, {});
        
                return {
                  key: item.user_id,
                  driver: {
                    license_number: item.license_number,
                    phone: item.phone,
                    name: keyName,
                  },
                  ...timeObj
                };
              });

            setFetchedData({// Set fetched data
                data: dayData,
                response: data,
                isLoading: false,
                error: false,
            })
        }
        catch (error) {
            setFetchedData({// Set fetched data
                data: [],
                response: [],
                isLoading: false,
                error: true,
            })
        }
    }, [url])

    const refetch = () => {// Create a new refetch function
        setFetchedData({// Set fetched data
            data: [],
            response: [],
            isLoading: true,
            error: false,
        })
        fetchData()// Call fetchData function
    }

    useEffect(() => {// Create a new useEffect
        fetchData()// Call fetchData function
        return () => controller.abort()// Abort fetch on unmount
    }, [])

    const { data, response, isLoading, error } = fetchedData// Destructure fetchedData
    return { data, response, isLoading, error, refetch } // Return data, isLoading, error and refetch
}

export default useDaySchedule