import axios from "axios";
import Config from "src/config";

const v2_actionAiNodes = (id) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.url_dev : Config.urlBackend}/api/v2/ai/nodes/${id}`
        });
};

export default v2_actionAiNodes;
