import axios from "axios";
import Config from "../../config";

const listaTodosUsuariosBossByClienteId = clienteId => {
    return axios({
        method: "get",
          url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/usuarios/lista/boss/${clienteId}/id`
    });
};

export default listaTodosUsuariosBossByClienteId;
