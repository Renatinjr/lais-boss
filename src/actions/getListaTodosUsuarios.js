import axios from "axios";
import Config from "../config";

const getListaTodosUsuarios = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/clientes/getListaTodosUsuarios`,
        data
    });
};

export default getListaTodosUsuarios;
