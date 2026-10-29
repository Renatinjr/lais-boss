import axios from "axios";
import Config from "src/config";

const v2_actionConfigGlobal = () => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v2/admin/internal/config/global`
    });
};

export default v2_actionConfigGlobal;
