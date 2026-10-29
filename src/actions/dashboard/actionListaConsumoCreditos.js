import axios from "axios";
import Config from "../../config";

const actionListaConsumoCreditos = (fields) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v2/admin/internal/relatorios/consumo-creditos${fields && fields}`
    });
};

export default actionListaConsumoCreditos;
