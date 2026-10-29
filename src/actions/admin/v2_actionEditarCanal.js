import axios from "axios";
import Config from "../../config";

const v2_actionEditarCanal = (canalId, data) => {
    return axios({
        method: "put",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v2/clientes/canal/${canalId}/editar`,
        data
    });
};

export default v2_actionEditarCanal;