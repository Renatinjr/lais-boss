import axios from "axios";
import Config from "../../config";

const deletarRespostaRapida = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/clientes/cliente/respostas/deletar`,
        data
    });
};

export default deletarRespostaRapida;
