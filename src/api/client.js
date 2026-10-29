import axios from 'axios'
import { baseURL } from 'src/store/constant'

const apiClient = axios.create({
    baseURL: `https://ai.lais.app/api/v1`,
    headers: {
        'Content-type': 'application/json'
    }
})

apiClient.interceptors.request.use(function (config) {
    const username = localStorage.getItem('username')
    const password = localStorage.getItem('password')

    if (username && password) {
        config.auth = {
            username,
            password
        }
    }

    return config
})

export default apiClient