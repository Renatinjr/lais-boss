import axios from "axios";
import Config from "../../config";

const listaFluxos = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/clientes/cliente/fluxos/lista`,
        data
    });
};

export default listaFluxos;
