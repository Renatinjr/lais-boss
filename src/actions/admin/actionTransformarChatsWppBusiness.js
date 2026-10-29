import axios from "axios";
import Config from "../../config";

const actionTransformarChatsWppBusiness = (data) => {
    return axios({
        method: "post",
        url: `${Config.urlDev}/api/v2/admin/meta/transformar-chats`,
        data
    });
};

export default actionTransformarChatsWppBusiness;
