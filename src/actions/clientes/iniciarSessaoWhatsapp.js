import axios from "axios";
import Config from "../../config";

const iniciarSessaoWhatsapp = (pod, sessao, token) => {
    return axios({
        method: "post",
        url: `https://z${pod}.zindi.com.br/api/${sessao}/start-session`,
        headers: {
            'Authorization': 'Bearer ' + token
          }
    });
};

export default iniciarSessaoWhatsapp;
