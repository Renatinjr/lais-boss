import axios from "axios";
import Config from "../../../config";

const v2_actionImportarContatos = (clienteId, data) => {
    // Console log para inspecionar Config, clienteId e data
    console.log("Config:", Config);
    console.log("Cliente ID:", clienteId);
    console.log("Data:", data);

    return axios({
        method: "post",
        url: `${Config.dev ? Config.api_dev : Config.api_prod}/api/v2/${clienteId}/usuarios/bulk`,
        data
    });
};

export default v2_actionImportarContatos;