import axios from "axios";
import Config from "src/config";

const v2_actionEditarAgenteAi = (agentId, data) => {
    return axios({
        method: "put",
        url: `${Config.dev ? Config.url_dev : Config.urlBackend}/api/v2/ai/agentes/${agentId}/editar`,
        data
        });
};

export default v2_actionEditarAgenteAi;
