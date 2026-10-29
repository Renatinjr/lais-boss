import axios from "axios";
import Config from "src/config";

const v3_actionAgentsFeedback = (querys) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v3/ai/feedback`,
        params: querys
    });
};

export default v3_actionAgentsFeedback;
