import axios from "axios";
import Config from "../../config";

const v2_actionListSectorsByClient = (clienteId) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v2/clientes/${clienteId}/setores`
    });
};

export default v2_actionListSectorsByClient;