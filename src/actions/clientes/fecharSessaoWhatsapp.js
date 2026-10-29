import axios from "axios";
import Config from "../../config";

const fecharSessaoWhatsapp = (pod, sessao, token) => {
    return axios({
        method: "post",
        url: `https://z${pod}.zindi.com.br/api/${sessao}/close-session`,
        headers: {
            'Authorization': 'Bearer ' + token
          }
    });
};

export default fecharSessaoWhatsapp;
