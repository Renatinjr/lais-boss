import axios from "axios";
import Config from "../../config";

const actionListaUsuariosAtivos = (fields) => {
    return axios({
        method: "get",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v1/dashboard/relatorios/usuarios-ativos${fields && fields}`
    });
};

export default actionListaUsuariosAtivos;
