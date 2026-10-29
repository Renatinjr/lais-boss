import axios from "axios";
import Config from "../../config";

const actionConfigurarCanalMeta = (data) => {
    return axios({
        method: "post",
        url: `${Config.urlDev}/api/v2/admin/meta/configurar-canal`,
        data
    });
};

export default actionConfigurarCanalMeta;
