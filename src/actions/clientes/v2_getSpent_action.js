import axios from "axios";
import Config from "../../config";

const v2_getSpent_action = (id, querys) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v2/${id}/consumo${querys}`
    });
};

export default v2_getSpent_action;