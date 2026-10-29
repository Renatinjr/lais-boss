import axios from "axios";
import Config from "src/config";

const v2_actionEditarUsuario = (id, data) => {
    return axios({
        method: "put",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v2/usuarios/${id}/editar`,
        data
    });
};

export default v2_actionEditarUsuario;
