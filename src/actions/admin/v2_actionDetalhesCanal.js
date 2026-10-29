import axios from "axios";
import Config from "../../config";

const v2_actionDetalhesCanal = (canalId) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v2/canal/${canalId}`
    });
};

export default v2_actionDetalhesCanal;