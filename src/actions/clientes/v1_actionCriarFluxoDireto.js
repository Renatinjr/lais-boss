import axios from "axios";
import Config from "../../config";

const v1_actionCriarFluxoDireto = (data) => {
    
    return axios({
        method: "post",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v1/clientes/cliente/fluxos/criar`,
        data
    });
};

export default v1_actionCriarFluxoDireto;