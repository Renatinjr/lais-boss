import axios from "axios";
import Config from "../../config";

const v2_actionPlanos = () => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v2/admin/planos`
    });
};

export default v2_actionPlanos;