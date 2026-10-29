import axios from "axios";
import Config from "../../config";

const actionEditarTemplate = (id, data) => {
    return axios({
        method: "put",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/library/templates/${id}`,
        data,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

export default actionEditarTemplate;

