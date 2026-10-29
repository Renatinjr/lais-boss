import axios from "axios";
import Config from "../../config";

const loginAdmin = data => {
    return axios({
        method: "post",
        url: (Config.urlDev || '') + "/api/v1/auth/login/admin",
        data
    });
};

export default loginAdmin;
