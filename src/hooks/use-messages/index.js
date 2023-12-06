import { useCallback, useEffect, useState } from "react"
import { Auth } from "aws-amplify"

import API from '../../api/NewUrl'
import { pathUrl } from '../../api/path-url'

const useMessages = (url) => {
    const initialState = {
        data: {},
        isLoading: false,
        error: false
    }

    const [messages, setMessages] = useState(initialState)

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
            console.error(error)
            throw error
        }
    }

    const fetchData = useCallback(async () => {
        try {
            const { options } = await getAuth()
            const response = await API.get(url, options)
            const data = await response.data
            setMessages({
                data: data,
                isLoading: false,
                error: false
            })
        } catch (error) {
            setMessages({
                ...initialState,
                error: true
            })
            console.error(error)
            throw error
        }
    }, [url])

    const refetch = () => {
        setMessages(initialState)
        fetchData()
    }

    const createMessage = async (payload) => {
        try {
            const { options } = await getAuth()
            const response = await API.post(pathUrl.messages, {...payload} ,options)
            const data = await response.data
            return data
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const readMessage = async (id) => {
        try {
            const { options } = await getAuth()
            const response = await API.get(`${pathUrl.messages}/${id}`, options)
            const data = await response.data
            return data
        } catch (error) {
            console.error(error)
            throw error
        }
    }
    
    const updateMessage = async (id, payload) => {
        try {
            const { options } = await getAuth()
            const response = await API.patch(`${pathUrl.messages}/${id}`, {...payload} ,options)
            const data = await response.data
            return data
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const deleteMessage = async (id) => {
        try {
            const { options } = await getAuth()
            const response = await API.delete(`${pathUrl.messages}/${id}`, options)
            const data = await response.data
            return data
        } catch (error) {
            console.error(error)
            throw error
        }
    }

    const sendMessage = async (id) => {
        try {
            const { options } = await getAuth()
            const response = await API.post(`${pathUrl.messages}/send/${id}`, options)
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

    const { data, isLoading, error } = messages

    return {
        data,
        isLoading,
        error,
        refetch,
        createMessage,
        readMessage,
        updateMessage,
        deleteMessage,
        sendMessage
    }
}

export default useMessages