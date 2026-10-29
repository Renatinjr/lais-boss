import axios from "axios";
import Config from "src/config";

const v2_actionDeletarTreinamento = (id) => {
    return axios({
        method: "delete",
        url: `${Config.dev ? Config.url_dev : Config.urlBackend}/api/v2/ai/trainings/${id}/delete`
            });
};

export default v2_actionDeletarTreinamento;
