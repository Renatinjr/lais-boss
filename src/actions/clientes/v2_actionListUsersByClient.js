import axios from "axios";
import Config from "../../config";

const v2_actionListUsersByClient = (clienteId) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v2/clientes/${clienteId}/usuarios`
    });
};

export default v2_actionListUsersByClient;