import axios from "axios";
import Config from "../../../config";

const v2_actionAgenteTreinamentos = (id) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v2/${id}/ai/trainings`
        });
};

export default v2_actionAgenteTreinamentos;