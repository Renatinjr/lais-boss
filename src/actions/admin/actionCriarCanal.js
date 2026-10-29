import axios from "axios";
import Config from "../../config";

const actionCriarCanal = data => {
    return axios({
        method: "post",
        url: `${Config.urlDev}/api/v1/canais/criar`,
        data
    });
};

export default actionCriarCanal;
