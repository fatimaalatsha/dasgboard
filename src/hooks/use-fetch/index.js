import { useState, useEffect, useCallback } from 'react'// Import useState, useEffect and useCallback
import { Auth } from 'aws-amplify'// Import Auth from aws-amplify

import API from '../../api/BaseUrl'// Import API base url

const useFectch = (url) => {
    const [fetchedData, setFetchedData] = useState({// Set initia fetch state to empty
        data: [],
        isLoading: true,
        error: false,
    })

    const controller = new AbortController()// Create a new AbortController

    const fetchData = useCallback(async () => {
        try {
            const auth = await Auth.currentSession()// Get current session
            const token = auth.getAccessToken().getJwtToken()// Get token from session
            const options = { // Set options for fetch
                headers: {
                    'Authorization': token,
                    ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
                }
            }
            const response = await API.get(url, options)// Fetch data from API
            const data = await response.data// Get data from response
            if (data) {
                setFetchedData({// Set fetched data
                    data,
                    isLoading: false,
                    error: false,
                })
            }

        } catch (error) {
            setFetchedData({// Set fetch state to error
                data: [],
                isLoading: false,
                error: true,
            })
            console.log(error)
        }
    }, [url])// Create a new fetchData function

    useEffect(() => {
        fetchData()// Call fetchData function
        return () => controller.abort()// Abort fetch request
    }, [fetchData, url])// Call fetchData function on mount and unmount

    const { data, isLoading, error } = fetchedData// Destructure fetched data
    return { data, isLoading, error }// Return fetched data
}

export default useFectch