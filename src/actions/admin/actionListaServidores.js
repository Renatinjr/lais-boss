import axios from "axios";
import Config from "../../config";

const actionListaServidores = () => {
    return axios({
        method: "get",
        url: `${Config.urlDev}/api/v1/admin/servers/lista`
    });
};

export default actionListaServidores;
