import axios from "axios";
import Config from "../../config";

const actionListaConsumoCreditosTodos = (fields) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v2/clientes/consumo/todos${fields && fields}`
    });
};

export default actionListaConsumoCreditosTodos;
