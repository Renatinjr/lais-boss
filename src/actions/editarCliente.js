import axios from "axios";
import Config from "../config";

const editarCliente = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/editarCliente`,
        data
    });
};

export default editarCliente;
