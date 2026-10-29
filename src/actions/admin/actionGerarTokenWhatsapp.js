import axios from "axios";
import Config from "../../config";

const actionGerarTokenWhatsapp = (pod, sessao) => {
    return axios({
        method: "post",
        url: `https://z${pod}.zindi.com.br/api/${sessao}/THISISMYSECURETOKEN/generate-token`
    });
};

export default actionGerarTokenWhatsapp;
