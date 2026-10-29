import axios from "axios";
import Config from "../../config";

const actionObterTemplate = (id) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/library/templates/${id}`
    });
};

export default actionObterTemplate;

