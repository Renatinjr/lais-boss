import axios from "axios";
import Config from "../../config";

const editarFunil = data => {
    return axios({
        method: "post",
        url: (Config.urlDev || '') + "/api/v1/clientes/cliente/funil/editar",
        data
    });
};

export default editarFunil;
