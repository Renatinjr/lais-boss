import axios from "axios";
import Config from "../../config";

const actionListaCanaisPorCliente = clienteId => {
    return axios({
        method: "get",
        url: `${Config.urlDev}/api/v1/canais/${clienteId}/lista`
    });
};

export default actionListaCanaisPorCliente;
