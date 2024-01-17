import { useCallback, useEffect, useState } from "react"
import { Auth } from "aws-amplify"

import API from "../../api/NewUrl"
import { pathUrl } from "../../api/path-url"

const useNotification = (url) => {
    const initialState = { // Response initial values and reset shorthand
        data: {},
        meta: {},
        isLoading: true,
        error: false
    }

    const [notifications, setNotifications] = useState(initialState)

    const getAuth = async () => {
        try {
            const auth = await Auth.currentSession()
            const token = auth.getAccessToken().getJwtToken()
            const options = {
                headers: {
                    'Authorization': token,
                    ...(process.env.REACT_APP_NEW_ENV && {'env': process.env.REACT_APP_NEW_ENV}),
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

    const fetchData = useCallback( async () => {
        try {
            const { options } = await getAuth()
            const response = await API.get(url, options)
            const responseData = await response.data
            const { data, meta } = responseData

            const categorizedData = data.reduce( // structures response based on notification status: read, unread
                (acc, notification) => {
                    const category = notification.is_read ? 'read' : 'unread'
                    acc.data[category].push(notification)
                    return acc
                },
                { data: { read: [], unread: [] }, meta }
            )

            setNotifications({
                ...categorizedData,
                isLoading: false,
                error: false
            })
        } catch (error) {
            setNotifications({
                ...initialState,
                isLoading: false,
                error: true
            })
            console.error(error)
            throw error
        }
    }, [url])

    const refetch = () => {
        setNotifications(initialState)
        fetchData()
    }

    const updateNotification = async (id, payload) => {
        try {
            const { options } = await getAuth()
            const response = await API.patch(`${pathUrl.notification}/${id}`, { ...payload }, options)
            const data = await response.data
            return data
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const deleteNotification = async (id) => {
        try {
            const { options } = await getAuth()
            const response = await API.delete(`${pathUrl.notification}/${id}`, options)
            const data = await response.data
            return data
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    useEffect(() => {
        fetchData()
    }, [url])

    const { data, meta, isLoading, error } = notifications

    return {
        data,
        meta,
        isLoading,
        error,
        refetch,
        updateNotification,
        deleteNotification
    }
}

export default useNotification