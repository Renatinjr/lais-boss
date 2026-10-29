'use client';

import { Icon } from '@iconify/react';
import { capitalCase } from 'change-case';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import roundAccountBox from '@iconify/icons-ic/round-account-box';
import shareFill from '@iconify/icons-eva/share-fill';
import personAddFill from '@iconify/icons-eva/person-add-fill';
import flip2Outline from '@iconify/icons-eva/flip-2-outline';
import { BsLightningFill, BsFillFunnelFill, BsFillDatabaseFill } from 'react-icons/bs';
import { FiMonitor, FiSmartphone, FiUser, FiActivity } from 'react-icons/fi';
// { useDispatch, useSelector } from '../../redux/store';
import {  getListaCanaisPorCliente } from '../../redux/slices/user';
import { useDispatch, useSelector } from "react-redux";
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import ClientForm from '../../components/_dashboard/user/ClientForm';
import { Container, Tab, Box, Tabs, Stack } from '@mui/material';
import { getSetoresList, getUsuariosList, getFluxoList, getRespostasList, getFunilList } from '../../redux/slices/user';
import FlowList from "../../views/dashboard/FlowList";
import UsuariosList from "../dashboard/UsuariosList";
import SetoresList from "./SetoresList";
import RespostasList from "./RespostasList";
import FunilList from "./FunilList";
import AplicativoPage from "../dashboard/AplicativoPage";
// ACTIONS -------------------------------------------------------------
import actionBuscarClienteById from 'src/actions/clientes/actionBuscarClienteById';
import editarJobMsgUnread from '../../actions/clientes/editarJobMsgUnread';
import editarMsgFinalizacao from '../../actions/clientes/editarMsgFinalizacao';
// actions 
import actionEditarCliente from 'src/actions/clientes/actionEditarCliente';
import actionAdminActionCliente from 'src/actions/clientes/actionAdminActionCliente';
import CanaisList from './CanaisList';
import v2_actionEditarCliente from 'src/actions/v2/clientes/v2_actionEditarCliente';
import AgentsList from './Agentes'; 
import ConsumoPage from './Consumo'; 
import v2_getSpent_action from "src/actions/clientes/v2_getSpent_action";
import v2_actionPlanos from "src/actions/admin/v2_actionPlanos";

// ----------------------------------------------------------------------
export default function ClientCreate() {
  const { themeStretch } = useSettings();
  const pathname = usePathname();
  const { name } = useParams();
  const dispatch = useDispatch();
  const { setoresList, usuariosList, fluxoList, respostasList, funilList, listaCanais } = useSelector((state) => state.user);
  const isEdit = pathname.includes('edit');
  const [clientData, setClientData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReadyCheckMsgSend, setIsReadyCheckMsgSend] = useState(false);
  const [msgBoasVindas, setMsgBoasVindas] = useState("");
  const [msgPesquisa, setMsgPesquisa] = useState("");
  const [msgFinalizacao, setMsgFinalizacao] = useState("");
  const [isMensagemFinalizacao, setIsMensagemFinalizacao] = useState(false);
  const [numero, setNumero] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [isSentinela, setIsSentinela] = useState(null)
  const [inadimplenciaAtivo, setInadimplenciaAtivo] = useState(false);
  const [inadimplenciaMensagem, setInadimplenciaMensagem] = useState('');
  const [inadimplenciaLoading, setInadimplenciaLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('geral');
  const [mensagemPesquisa, setMensagemPesquisa] = useState('');
  const [statusPesquisa, setStatusPesquisa] = useState(true)

  const [statusPesquisaChat, setStatusPesquisaChat] = useState(false)
  const searchParams = useSearchParams();
  const router = useRouter();
  const [spentData, setSpentData] = useState(null);
  const [planoSelecionado, setPlanoSelecionado] = useState('');
  const [addonsSelecionados, setAddonsSelecionados] = useState([]);
  const [dadosPlanos, setDadosPlanos] = useState({ data: { planos: [], adicionais: [] } });
  const [features, setFeatures] = useState([]);

  // Ao montar, checa se existe "tab" na URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setCurrentTab(tabParam);
    }
  }, [searchParams]);

  const handleChangeTab = (event, newValue) => {
    setCurrentTab(newValue);
    // Atualiza a URL para refletir a aba atual
    router.replace(`${pathname}?tab=${newValue}`);
  };

  
  useEffect(() => {
    if (clientData?._id) {
      const queryString = "?inicio=2025-03-28&final=2025-03-30&periodo=mes_atual";
      v2_getSpent_action(clientData._id, queryString)
        .then((res) => {
          setSpentData(res.data); // Objeto no formato { error, data: {...} }
        })
        .catch((err) => console.error("Erro ao buscar consumo:", err));
    }
  }, [clientData]);
  const handleEditarCliente = () => {
    console.log('teste')
  }

  async function v2EditarCliente() {
    try {
      const response = await v2_actionEditarCliente(clientData._id, { 
        scope: {
          status: statusPesquisaChat,
          enviar_pesquisa_finalizar_silencioso: false,
          msgFeedback: msgPesquisa
        },
        action:'editar_config_pesquisa'
      });
      return response;
  } catch(error) {
     console.log(error)
  }
}



  const handleEditarMsgFinalizacao = () => {
    editarMsgFinalizacao({ clienteId: clientData._id, msgFinalizacao: msgFinalizacao, isMensagemFinalizacao: isMensagemFinalizacao }).then(() => {
      actionBuscarClienteById(name).then(res => {
        setIsMensagemFinalizacao(res.data.cliente.config.msgFinalizacao.isMensagemFinalizacao );
        setMsgFinalizacao(res.data.cliente.config.msgFinalizacao.textoMensagemFinalizacao );
        setClientData(res.data.cliente);
      });
    }).catch(() => { 
      setIsLoading(false)
     })
  }

  
  const handleEditarDadosEssenciais = () => {
    setIsLoading(true)
    actionEditarCliente(clientData._id, { 
      scope: {
        sentinela:isSentinela,
        nomeCliente:nomeCliente,
        numero:numero
      },
      action:'editar_dados_essenciais'
    }).then(() => {
      actionBuscarClienteById(name).then(res => {
        setIsSentinela(res.data.cliente.sentinela);
        setIsMensagemFinalizacao(res.data.cliente.config.msgFinalizacao.isMensagemFinalizacao );
        setMsgFinalizacao(res.data.cliente.config.msgFinalizacao.textoMensagemFinalizacao );
        setClientData(res.data.cliente);
        setIsLoading(false)
      });
    }).catch(() => {
      setIsLoading(false)
     })
  }

  const handleEditarMsgUnread = () => {
    editarJobMsgUnread({ clienteId: clientData._id, msgBoasVindas: msgBoasVindas, isReadyCheckMsgSend: isReadyCheckMsgSend }).then(() => {
      actionBuscarClienteById(name).then(res => {
        setIsReadyCheckMsgSend(res.data.cliente.isReadyCheckMsgSend);
        setMsgBoasVindas(res.data.cliente.config.msgBoasVindas);
        setClientData(res.data.cliente);
        dispatch(getSetoresList({ clienteId: res.data.cliente._id }));
        dispatch(getFluxoList(res.data.cliente._id));
        dispatch(getRespostasList(res.data.cliente._id));
      });
    }).catch(() => { })
  }

  const handleChangeIsReadyCheckMsgSend = (event) => {
    setIsReadyCheckMsgSend(event.target.checked)
  }

  const handleChangeIsMsgFinalizacao = (event) => {
    setIsMensagemFinalizacao(event.target.checked)
  }

  const handleChangeSentinela = (event) => {
    setIsSentinela(event.target.checked)
  }

  const MENSAGEM_INADIMPLENCIA_PADRAO = 'Atenção: há pendências financeiras em sua conta. Entre em contato com o suporte para regularizar o acesso.';

  const handleSalvarInadimplencia = async (nextAtivo, nextMensagem) => {
    if (!clientData?._id) {
      console.warn('[inadimplencia] clientData._id ausente');
      return;
    }
    const mensagemFinal = (nextMensagem && String(nextMensagem).trim())
      ? nextMensagem
      : MENSAGEM_INADIMPLENCIA_PADRAO;
    const prevAtivo = inadimplenciaAtivo;
    const prevMensagem = inadimplenciaMensagem;
    setInadimplenciaAtivo(nextAtivo);
    setInadimplenciaMensagem(nextAtivo ? mensagemFinal : '');
    setInadimplenciaLoading(true);
    try {
      console.log('[inadimplencia] enviando', { clienteId: clientData._id, ativo: nextAtivo, mensagem: mensagemFinal });
      const response = await actionAdminActionCliente(clientData._id, {
        scope: {
          action: 'marcar_inadimplencia',
          ativo: nextAtivo,
          mensagem: nextAtivo ? mensagemFinal : ''
        }
      });
      console.log('[inadimplencia] resposta', response?.status, response?.data);
    } catch (err) {
      console.error('[inadimplencia] erro:', err?.response?.status, err?.response?.data || err?.message || err);
      setInadimplenciaAtivo(prevAtivo);
      setInadimplenciaMensagem(prevMensagem);
      alert(`Erro ao atualizar inadimplência: ${err?.response?.data?.mensagem || err?.message || 'verifique o backend'}`);
    } finally {
      setInadimplenciaLoading(false);
    }
  }

  const handleSubmitPesquisaConfig = () => {
    setIsLoading(true)
    actionEditarCliente(clientData._id, { 
      scope: {
        mensagem_pesquisa:mensagemPesquisa
      },
      action:'editar_pesquisa_fv'
    }).then(() => {
      actionBuscarClienteById(name).then(res => {
        setIsLoading(false);
        
      });
    }).catch(() => {
      setIsLoading(false)
     })
  }

  useEffect(() => {
    // Buscar planos e addons
    v2_actionPlanos()
      .then((response) => {
        if (!response.error) {
          setDadosPlanos(response.data);
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar planos:", error);
      });

    actionBuscarClienteById(name).then(res => {
      setIsSentinela(res.data.cliente.sentinela);
      setIsReadyCheckMsgSend(res.data.cliente.isReadyCheckMsgSend);
      setMsgBoasVindas(res.data.cliente.config.msgBoasVindas);
      setInadimplenciaAtivo(!!res.data.cliente.config?.inadimplencia?.ativo);
      setInadimplenciaMensagem(res.data.cliente.config?.inadimplencia?.mensagem || '');
      setIsMensagemFinalizacao(res.data.cliente.config.msgFinalizacao.isMensagemFinalizacao );
      if(res.data.cliente.config.msgFinalizacao.isMensagemFinalizacao) {
        setMsgFinalizacao(res.data.cliente.config.msgFinalizacao.textoMensagemFinalizacao );
      }
 
     // setStatusPesquisa(res.data.cliente.config.forca_venda.status_pesquisa);
     console.log(res.data.cliente.config.forca_venda)
     if(res.data.cliente.config.forca_venda && res.data.cliente.config.forca_venda.mensagem_pesquisa) {
      setMensagemPesquisa(res.data.cliente.config.forca_venda.mensagem_pesquisa ? res.data.cliente.config.forca_venda.mensagem_pesquisa : "");
     }
     if(res.data.cliente.config.feedback.status) {
      setStatusPesquisaChat(res.data.cliente.config.feedback.status);
     }
     if(res.data.cliente.config.feedback.msgFeedback) {
      setMsgPesquisa(res.data.cliente.config.feedback.msgFeedback);
     }
     console.log(res.data.cliente.config.feedback)
      setClientData(res.data.cliente);
      setNumero(res.data.cliente.numero);
      setNomeCliente(res.data.cliente.nome);
      setFeatures(res.data.cliente.features || []);
      dispatch(getSetoresList({ clienteId: res.data.cliente._id }));
      dispatch(getFluxoList(res.data.cliente._id));
      dispatch(getRespostasList(res.data.cliente._id));
      dispatch(getListaCanaisPorCliente(res.data.cliente._id));
      // Armazenar IDs dos serviços para conversão posterior
      setClientData(res.data.cliente);
    });

    dispatch(getUsuariosList(name));

  }, [dispatch]);

  // Converter IDs dos serviços em objetos completos quando dadosPlanos estiver disponível
  useEffect(() => {
    if (clientData?.billing?.services && dadosPlanos?.data?.adicionais?.length > 0) {
      const servicesIds = clientData.billing.services;
      console.log('Services IDs:', servicesIds);
      
      const servicesCompletos = servicesIds.map(serviceId => {
        const addonCompleto = dadosPlanos.data.adicionais.find(addon => addon._id === serviceId);
        if (addonCompleto) {
          return {
            id: addonCompleto._id,
            nome: addonCompleto.name,
            preco: parseFloat(addonCompleto.regular_price) || 0,
            quantidade: 1,
            key: addonCompleto.key
          };
        }
        return null;
      }).filter(Boolean);
      
      console.log('Services completos:', servicesCompletos);
      setAddonsSelecionados(servicesCompletos);
    }
  }, [clientData, dadosPlanos]);

  const handleChangePlano = (event) => {
    setPlanoSelecionado(event.target.value);
  };

  const handleChangeAddons = (novoCarrinho) => {
    setAddonsSelecionados(novoCarrinho);
  };

  const handleChangeFeatures = (novasFeatures) => {
    setFeatures(novasFeatures);
  };

  const handleSubmitFeatures = () => {
    setIsLoading(true);
    actionEditarCliente(clientData._id, {
      scope: {
        features: features
      },
      action: 'editar_features'
    }).then(() => {
      actionBuscarClienteById(name).then(res => {
        setFeatures(res.data.cliente.features || []);
        setClientData(res.data.cliente);
        setIsLoading(false);
      });
    }).catch(() => {
      setIsLoading(false);
    });
  };

  // Função para adicionar item ao carrinho
  const handleAdicionarAoCarrinho = (addon) => {
    setAddonsSelecionados(carrinhoAtual => {
      // Procura se o item já existe no carrinho
      const itemExistente = carrinhoAtual.find(item => item.id === addon._id);
      
      if (itemExistente) {
        // Se existe, aumenta a quantidade
        return carrinhoAtual.map(item => 
          item.id === addon._id 
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }
      
      // Se não existe, adiciona com quantidade 1
      return [...carrinhoAtual, {
        id: addon._id,
        nome: addon.name,
        preco: addon.regular_price,
        quantidade: 1,
        key: addon.key
      }];
    });
  };

  // Função para remover item do carrinho
  const handleRemoverDoCarrinho = (addonId) => {
    setAddonsSelecionados(carrinhoAtual => {
      const itemExistente = carrinhoAtual.find(item => item.id === addonId);
      
      if (itemExistente?.quantidade > 1) {
        // Se tem mais de um, diminui a quantidade
        return carrinhoAtual.map(item => 
          item.id === addonId 
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        );
      }
      
      // Se só tem um, remove do carrinho
      return carrinhoAtual.filter(item => item.id !== addonId);
    });
  };

  const ACCOUNT_TABS = [
    {
      value: 'geral',
      icon: <Icon icon={roundAccountBox} width={20} height={20} />,
      component: <ClientForm
        isEdit={isEdit}
        currentUser={clientData}
        msgBoasVindas={msgBoasVindas}
        isMensagemFinalizacao={isMensagemFinalizacao}
        msgFinalizacao={msgFinalizacao}
        isReadyCheckMsgSend={isReadyCheckMsgSend}
        isSentinela={isSentinela}
        msgPesquisa={msgPesquisa}
        changeIsSentinela={event => handleChangeSentinela(event)}
        changeIsMensagemFinalizacao={event => handleChangeIsMsgFinalizacao(event)}
        changeIsReadyCheckMsgSend={event => handleChangeIsReadyCheckMsgSend(event)}
        changeMsgPesquisa={event => setMsgPesquisa(event.target.value)}
        changeMsgBoasVindas={event => setMsgBoasVindas(event.target.value)}
        changeMsgFinalizacao={event => setMsgFinalizacao(event.target.value)}
        editarCheckMsg={handleEditarMsgUnread}
        editarMsgFinalizacao={handleEditarMsgFinalizacao}
        changeNomeCliente={event => setNomeCliente(event.target.value)}
        changeNumero={event => setNumero(event.target.value)}
        numero={numero}
        nomeCliente={nomeCliente}
        submitPesquisaConfig={v2EditarCliente}
        submitDadosEssenciais={handleEditarDadosEssenciais}
        isLoading={isLoading}
        statusPesquisaChat={statusPesquisaChat}
        changeStatusPesquisaChat={event => setStatusPesquisaChat(event.target.checked)}
        planoSelecionado={planoSelecionado}
        changePlanoSelecionado={handleChangePlano}
        addonsSelecionados={addonsSelecionados}
        changeAddonsSelecionados={handleChangeAddons}
        dadosPlanos={dadosPlanos}
        submitPlanosServicos={handleEditarDadosEssenciais}
        features={features}
        changeFeatures={handleChangeFeatures}
        submitFeatures={handleSubmitFeatures}
        clienteId={clientData._id}
        inadimplenciaAtivo={inadimplenciaAtivo}
        inadimplenciaMensagem={inadimplenciaMensagem}
        inadimplenciaLoading={inadimplenciaLoading}
        changeInadimplenciaMensagem={(value) => setInadimplenciaMensagem(value)}
        submitInadimplencia={handleSalvarInadimplencia}
      />
    },
    {
      value: 'setores',
      icon: <Icon icon={shareFill} width={20} height={20} />,
      component: <Box sx={{ height: 390 }}><SetoresList usuario={name} clienteData={clientData} propsEditarCliente={handleEditarCliente} setoresData={setoresList} /></Box>
    },
    {
      value: 'usuarios',
      icon: <Icon icon={personAddFill} width={20} height={20} />,
      component: <Box sx={{ height: 390 }}><UsuariosList cliente={name} clienteData={clientData} setoresData={setoresList} usuariosData={usuariosList} /></Box>
    },
    {
      value: 'fluxo',
      icon: <Icon icon={flip2Outline} width={20} height={20} />,
      component: <Box sx={{ height: 390 }}><FlowList clienteData={clientData} usuario={name} usuariosData={usuariosList} setoresData={setoresList} fluxoData={fluxoList.fluxo} /></Box>
    },
    //{
    //  value: 'respostas',
    //  icon: <BsLightningFill size={20} />,
    //  component: <Box sx={{ height: 390 }}><RespostasList clienteData={clientData} usuario={name} respostasData={respostasList} /></Box>
    // },
    // {
    //   value: 'funil',
    //   icon: <BsFillFunnelFill size={20} />,
    //   component: <Box sx={{ height: 390 }}><FunilList clienteData={clientData} usuario={name} respostasData={funilList} /></Box>
    // },
    {
     value: 'canais',
     icon: <FiMonitor size={20} />,
     component: <Box sx={{ height: 390 }}><CanaisList clienteData={clientData} usuario={name} usuariosData={usuariosList} setoresData={setoresList} data={listaCanais} /></Box>
    },

    // {
    //   value: 'aplicativo',
    //   icon: <FiSmartphone size={20} />,
    //   component: <Box sx={{ height: 490 }}><AplicativoPage 
    //   clienteData={clientData} 
    //   usuario={name} 
    //   usuariosData={usuariosList} 
    //   setoresData={setoresList} 
    //   data={listaCanais} 
    //   statusPesquisa={statusPesquisa}
    //   mensagemPesquisa={mensagemPesquisa}
    //   changeStatusPesquisa={event => setStatusPesquisa(event.target.checked)}
    //   changeMensagemPesquisa={event => {
    //     setMensagemPesquisa(event.target.value)
    //   } }
    //   submitPesquisaConfig={handleSubmitPesquisaConfig}
    //   /></Box>
    // },
    // {
    //   value: 'agentes',
    //   icon: <FiUser size={20} />,
    //   component: (
    //     <Box sx={{ width: 1100 }}>
    //       <AgentsList clienteData={clientData}
    //        />
    //     </Box>
    //   ),
      
    // },
    // {
    //   value: 'consumo',
    //   icon: <FiActivity size={20} />,
    //   component: (
    //     <Box sx={{ width: '100%' }}>
    //       <ConsumoPage spentData={spentData} />
    //     </Box>
    //   )
    // },
  ];

  return (
    <Page title="Lais boss">
      <Container maxWidth>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Criar Novo Cliente' : 'Editar Cliente'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Clientes', href: PATH_DASHBOARD.root },
            { name: !isEdit ? 'New user' : name }
          ]}
        />


        <Stack spacing={5}>
          <Tabs
            value={currentTab}
            scrollButtons="auto"
            variant="scrollable"
            allowScrollButtonsMobile
            onChange={handleChangeTab}
          >
            {ACCOUNT_TABS.map((tab) => (
              <Tab disableRipple key={tab.value} label={capitalCase(tab.value)} icon={tab.icon} value={tab.value} />
            ))}
          </Tabs>

          {ACCOUNT_TABS.map((tab) => {
            const isMatched = tab.value === currentTab;
            return isMatched && <Box key={tab.value}>{tab.component}</Box>;
          })}
        </Stack>


      </Container>
    </Page>
  );
}
