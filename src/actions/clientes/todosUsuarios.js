import axios from "axios";
import Config from "../../config";

const todosUsuarios = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/clientes/lista/boss`,
        data
    });
};

export default todosUsuarios;
