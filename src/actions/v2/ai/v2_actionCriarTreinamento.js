import axios from "axios";
import Config from "src/config";

const v2_actionCriarTreinamento = (agentId, data) => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.url_dev : Config.urlBackend}/api/v2/ai/agentes/${agentId}/trainings/criar`,
        data
        });
};

export default v2_actionCriarTreinamento;
