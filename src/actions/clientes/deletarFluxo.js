import axios from "axios";
import Config from "../../config";

const deletarFluxo = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/clientes/cliente/fluxos/deletar`,
        data
    });
};

export default deletarFluxo;
