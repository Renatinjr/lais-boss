'use client';

import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    Card,
    Container,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    FormLabel,
    DialogActions,
    Box,
    Autocomplete,
    Divider,
    Typography,
    Menu,
    IconButton,
    Switch
} from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useDispatch } from '../../redux/store';
import useSettings from '../../hooks/useSettings';
import Page from '../../components/Page';
import v2_actionListarCanaisAtencao from 'src/actions/v2/admin/v2_actionListarCanaisAtencao';
import Iconify from 'src/components/Iconify';
import ActionsChannel from 'src/sections/dashboard/global/ActionsChannel';
import actionEditarCliente from 'src/actions/clientes/actionEditarCliente';
import useAuth from 'src/hooks/useAuth';


const ItemCanalAtencao = ({ channel, onChangeSentinelaStatus }) => {
    const [anchorEl, setAnchorEl] = useState(null);

    return (
        <Box
            sx={{
                borderRadius: 1,
                border: 1,
                // light: the original light-grey card; dark: the theme's dark surface
                bgcolor: (theme) => (theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800]),
                borderColor: (theme) => (theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.divider),
                p: 1
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center"
                    }}>

                    <Box>
                        <Stack direction={"column"}>
                            <Typography
                                sx={{
                                    fontWeight: "semibold",
                                    fontSize: 12
                                }}><strong>{channel?.nomeCliente}</strong></Typography>
                            <Typography
                                sx={{
                                    fontWeight: "semibold",
                                    fontSize: 12
                                }}>canal: <strong>{channel?.canal?.nome}</strong></Typography>
                            <Typography
                                sx={{
                                    fontWeight: "semibold",
                                    fontSize: 12
                                }}>pod: <strong>{channel?.pod}</strong></Typography>

                            <Typography
                                sx={{
                                    fontWeight: "semibold",
                                    fontSize: 10
                                }}>{channel?.sessao}</Typography>
                            <Typography
                                sx={{
                                    fontWeight: "semibold",
                                    fontSize: 10
                                }}>{channel?.numero}</Typography>
                            <Stack direction="row" spacing={1} sx={{
                                alignItems: "center"
                            }}>
                                <Typography
                                    sx={{
                                        fontWeight: "semibold",
                                        fontSize: 10
                                    }}>conexão: </Typography>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        bgcolor: channel?.canal?.status_connection_whatsapp === "conectado" ? "success.main" : "error.main",
                                        mr: 1
                                    }}></Box>
                            </Stack>


                        </Stack>

                    </Box>
                </Box>
                <Stack direction={"column"}>
                    <Switch
                        onChange={onChangeSentinelaStatus}
                        checked={channel.sentinela}
                    />
                        <ActionsChannel data={channel} />
                </Stack>
            
            </Box>

        </Box>
    );
}



export default function Monitor() {
    const {user} = useAuth();

    const [listChannels, setListChannels] = useState([]);

    async function buscarCanaisAtencao() {
        try {
            let query = `?provedor=${user.provedor}`;
            const response = await v2_actionListarCanaisAtencao(query);
            if (response.status === 200) {
                setListChannels(response.data.data);
            }

        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        buscarCanaisAtencao()

    }, []);

    const handleChangeSentinelaStatus = async (clienteId, event) => {
        console.log(clienteId, event)
        try {
          await actionEditarCliente(clienteId.canal.cliente_id, {
            scope: {
              status: event
            },
            action: 'editar_status_sentinela'
          });
          buscarCanaisAtencao()
        } catch (error) {
          console.error(error);
        }
      };


    const orderedCategories = listChannels.sort((a, b) => {
        const order = ["ativo", "onboarding", "suporte", "demo", "dev"];


        return order.indexOf(a._id) - order.indexOf(b._id);
    });


    return (
        <Page title="Monitor">


            <Container maxWidth="xl">
                <Stack>
                    <Typography variant="h6">Canais que precisam de atenção</Typography>
                </Stack>
                {orderedCategories.map((category, index) => (
                    <Box key={category._id || index} sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            {category._id}
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 1,
                                gridTemplateColumns: {
                                    xs: 'repeat(1, 1fr)',
                                    sm: 'repeat(5, 1fr)',
                                },
                            }}
                        >
                            {category.items.map((item) => (
                                <ItemCanalAtencao
                                    key={item._id}
                                    channel={item}
                                    onChangeSentinelaStatus={e => {
                                        console.log(e.target.checked, item)
                                        handleChangeSentinelaStatus(item, e.target.checked)
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                ))}
            </Container>

        </Page>
    );
}