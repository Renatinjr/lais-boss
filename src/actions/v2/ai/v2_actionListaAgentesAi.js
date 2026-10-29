import axios from "axios";
import Config from "../../../config";

const v2_actionListaAgentesAi = (clienteId) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v2/ai/agentes/${clienteId}`
        });
};

export default v2_actionListaAgentesAi;