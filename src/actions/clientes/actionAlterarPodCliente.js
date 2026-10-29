import axios from "axios";
import Config from "../../config";

const actionAlterarPodCliente = (clienteId, novoPod) => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/clientes/cliente/${clienteId}/alterar-pod`,
        data: {
            pod: novoPod
        }
    });
};

export default actionAlterarPodCliente;
