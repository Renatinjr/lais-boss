import axios from "axios";
import Config from "../config";

const criarUsuario = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/clientes/criar`,
        data
    });
};

export default criarUsuario;
