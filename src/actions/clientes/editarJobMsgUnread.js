import axios from "axios";
import Config from "../../config";

const editarJobMsgUnread = data => {
    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/clientes/cliente/msgs-unread/editar`,
        data
    });
};

export default editarJobMsgUnread;
