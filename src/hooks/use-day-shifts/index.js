import { useState, useCallback, useEffect } from "react"
import { Auth } from "aws-amplify"

import API from "../../api/NewUrl"

const useDayShifts = (url) => {
    const initialState = {
        data: [],
        isLoading: true,
        error: false
    }

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