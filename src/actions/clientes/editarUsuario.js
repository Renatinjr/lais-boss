import axios from "axios";
import Config from "../../config";

const editarUsuario = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/usuarios/editar`,
        data
    });
};

export default editarUsuario;
