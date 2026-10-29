import axios from "axios";
import Config from "../../../config";

const v2_actionCriarAgente = (clienteId, data) => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v2/${clienteId}/ai/agentes/criar`,
        data
        });
};

export default v2_actionCriarAgente;