import v2_actionAiNodes from 'src/actions/v2/ai/v2_actionAiNodes'
import client from './client'
import axios from 'axios'
const getAllNodes = () => client.get('/nodes')



const getSpecificNode = async (id) => await v2_actionAiNodes(id);
const getNodesByCategory = (name) => client.get(`/nodes/category/${name}`)

const executeCustomFunctionNode = (body) => client.post(`/node-custom-function`, body)

export default {
    getAllNodes,
    getSpecificNode,
    executeCustomFunctionNode,
    getNodesByCategory
}
