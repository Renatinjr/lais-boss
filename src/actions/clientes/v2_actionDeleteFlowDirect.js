import axios from "axios";
import Config from "../../config";

const v2_actionDeleteFlowDirect = (flowDirectId) => {
    return axios({
        method: "delete",
        url: `${Config.dev ? Config.url_dev : Config.api_prod}/api/v2/${flowDirectId}/delete-flow-direct`
    });
};

export default v2_actionDeleteFlowDirect;