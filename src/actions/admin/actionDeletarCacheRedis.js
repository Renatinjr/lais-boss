import axios from "axios";
import Config from "../../config";

const actionDeletarCacheRedis = (sessao) => {
    return axios({
        method: "delete",
        url: `${Config.urlDev}/api/v1/admin/redis/${sessao}/deletar-cache`
    });
};

export default actionDeletarCacheRedis;
