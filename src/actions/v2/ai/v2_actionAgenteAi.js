import axios from "axios";
import Config from "../../../config";

const v2_actionAgenteAi = (id) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v2/ai/agentes/${id}/detalhes`
        });
};

export default v2_actionAgenteAi;