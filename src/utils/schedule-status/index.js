import { Auth } from 'aws-amplify'
import API from '../../api/NewUrl'


import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

dayjs.extend(utc)
dayjs.extend(timezone)

const convertToHourTz = (date, timezone) => {
    return dayjs(date).tz(timezone).format('HH:mm')
}

const converToUTC = (date, timestring, timezone) => {
    const localTime = dayjs(`${date}T${timestring}:00.00Z`).tz(timezone)
    const utcTime = localTime.utc()
    const offsetInMinutes = localTime.utcOffset()

    return offsetInMinutes >= 0 
    ? utcTime.add(offsetInMinutes, 'minute').format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
    : utcTime.subtract(offsetInMinutes, 'minute').format('YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
}

const createWeekShift = async (payload) => {
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
        const response = await API.post(`/v1/shifts`, payload, options)
        const data = await response.data
        return data
    } catch (error) {
        throw new Error(error)
    }
}

const updateWeekShift = async (payload, id) => {
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
        const response = await API.put(`/v1/shifts/${id}`, payload, options)
        const data = await response.data
        return data
    } catch (error) {
        throw new Error(error)
    }
}

const deleteWeekShift = async (id) => {
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
        const response = await API.delete(`/v1/shifts/${id}`, options)
        const data = await response.data
        return data
    } catch (error) {
        console.log(error)
        return error.response.data
    }
}

const getDayHours = () => {
    const hours = []
    for (let hour = 0; hour < 24; hour++) {
        hours.push(dayjs().hour(hour).minute(0).format('HH:mm'))
    }
    return hours
}

const unassignFromShift = async (payload, id) => {
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
        const response = await API.post(`/v1/shifts/${id}/unassign`, payload, options)
        const data = await response.data
        return data
    } catch (error) {
        throw new Error(error)
    }
}

export { createWeekShift, updateWeekShift, deleteWeekShift, convertToHourTz, converToUTC, getDayHours, unassignFromShift }