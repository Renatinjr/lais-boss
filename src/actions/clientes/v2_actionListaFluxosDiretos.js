import axios from "axios";
import Config from "../../config";

const v2_actionListaFluxosDiretos = (clienteId) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v2/${clienteId}/flows-direct`
    });
};

export default v2_actionListaFluxosDiretos;