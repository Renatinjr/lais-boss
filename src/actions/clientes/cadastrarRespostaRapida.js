import axios from "axios";
import Config from "../../config";

const cadastrarRespostaRapida = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/clientes/cliente/respostas/criar`,
        data
    });
};

export default cadastrarRespostaRapida;
