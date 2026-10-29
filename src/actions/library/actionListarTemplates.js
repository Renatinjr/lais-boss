import axios from "axios";
import Config from "../../config";

const actionListarTemplates = (params = {}) => {
    const { page = 1, limit = 50, status, category, search } = params;
    
    let url = `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/library/templates?page=${page}&limit=${limit}`;
    
    if (status) {
        url += `&status=${status}`;
    }
    if (category) {
        url += `&category=${category}`;
    }
    if (search) {
        url += `&search=${encodeURIComponent(search)}`;
    }
    
    return axios({
        method: "get",
        url
    });
};

export default actionListarTemplates;

