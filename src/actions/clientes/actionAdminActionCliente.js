import axios from "axios";
import Config from "../../config";

const actionAdminActionCliente = (clienteId, data) => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v2/admin/${clienteId}/action`,
        data,
        timeout: 15000
        // url: (Config.urlDev || '') + "/api/v1/clientes/cliente/" + clienteId
    });
};

export default actionAdminActionCliente;