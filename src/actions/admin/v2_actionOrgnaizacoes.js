import axios from "axios";
import Config from "../../config";

const v2_actionOrganizacoes = () => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v2/admin/organizacoes`
    });
};

export default v2_actionOrganizacoes;