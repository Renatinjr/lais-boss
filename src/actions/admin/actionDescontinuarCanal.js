import axios from "axios";
import Config from "../../config";

const actionDescontinuarCanal = canalId => {
    return axios({
        method: "delete",
        url: `${Config.urlDev}/api/v1/canais/${canalId}/deletar`,
    });
};

export default actionDescontinuarCanal;
