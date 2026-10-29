import axios from "axios";
import Config from "../../config";

const listaFunil = clienteId => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/clientes/cliente/funil/lista/${clienteId}`
    });
};

export default listaFunil;
