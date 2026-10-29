import axios from "axios";
import Config from "../../config";

const actionDeletarTemplate = (id) => {
    return axios({
        method: "delete",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/library/templates/${id}`
    });
};

export default actionDeletarTemplate;

