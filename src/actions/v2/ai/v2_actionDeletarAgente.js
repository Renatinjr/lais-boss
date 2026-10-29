import axios from "axios";
import Config from "src/config";

const v2_actionDeletarAgente = (id) => {
    return axios({
        method: "delete",
        url: `${Config.dev ? Config.url_dev : Config.urlBackend}/api/v2/ai/agentes/${id}/deletar`
    });
};

export default v2_actionDeletarAgente;
