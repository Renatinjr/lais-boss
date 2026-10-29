import axios from "axios";
import Config from "../../config";

const actionUsuariosByClienteId = clienteId => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/usuarios/lista/${clienteId}/id`
    });
};

export default actionUsuariosByClienteId;
