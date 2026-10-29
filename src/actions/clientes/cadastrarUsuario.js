import axios from "axios";
import Config from "../../config";

const cadastrarUsuario = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/usuarios/cadastrar`,
        data
    });
};

export default cadastrarUsuario;
