import { map, filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
// utils
import axios from '../../utils/axios';

import getSetoresByClient from "../../actions/getSetoresByClient";
import getListaUsuariosByCliente from 'src/actions/getListaUsuariosByCliente';
import getFluxoByClient from 'src/actions/getFluxoByClient';

import listaTodosUsuariosBossByClienteId from 'src/actions/usuarios/listaTodosUsuariosBossByClienteId';
import usuariosById from '../../actions/clientes/usuariosById';
import usuariosByCodigoCliente from '../../actions/clientes/usuariosByCodigoCliente';
import actionUsuariosByClienteId from 'src/actions/clientes/actionUsuariosByClienteId';
import listaSetores from '../../actions/clientes/listaSetores';
import listafluxos from '../../actions/clientes/listaFluxos';
import listaRespostas from '../../actions/clientes/listaRespostas';
import listaFunil from '../../actions/clientes/listaFunil';
import actionListaCanaisPorCliente from 'src/actions/clientes/actionListaCanaisPorCliente';

// ----------------------------------------------------------------------

const initialState = {
  isLoading: false,
  error: false,
  myProfile: null,
  posts: [],
  users: [],
  respostasList: [],
  setoresList: [],
  usuariosList: [],
  listaCanais:[],
  fluxoList: [],
  funilList:[],
  List:[],
  followers: [],
  friends: [],
  gallery: [],
  cards: null,
  addressBook: [],
  invoices: [],
  notifications: null
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET PROFILE
    getProfileSuccess(state, action) {
      state.isLoading = false;
      state.myProfile = action.payload;
    },

    // GET POSTS
    getPostsSuccess(state, action) {
      state.isLoading = false;
      state.posts = action.payload;
    },

    // GET USERS
    getUsersSuccess(state, action) {
      state.isLoading = false;
      state.users = action.payload;
    },

    // DELETE USERS
    deleteUser(state, action) {
      const deleteUser = filter(state.userList, (user) => user.id !== action.payload);
      state.userList = deleteUser;
    },

    // GET FOLLOWERS
    getFollowersSuccess(state, action) {
      state.isLoading = false;
      state.followers = action.payload;
    },

    // ON TOGGLE FOLLOW
    onToggleFollow(state, action) {
      const followerId = action.payload;

      const handleToggle = map(state.followers, (follower) => {
        if (follower.id === followerId) {
          return {
            ...follower,
            isFollowed: !follower.isFollowed
          };
        }
        return follower;
      });

      state.followers = handleToggle;
    },

    // GET FRIENDS
    getFriendsSuccess(state, action) {
      state.isLoading = false;
      state.friends = action.payload;
    },

    // GET GALLERY
    getGallerySuccess(state, action) {
      state.isLoading = false;
      state.gallery = action.payload;
    },

    // GET MANAGE USERS
    getUserListSuccess(state, action) {
      state.isLoading = false;
      state.userList = action.payload;
    },

      // BUSCAR RESPOSTAS
      getRespostasListSuccess(state, action) {
        state.isLoading = false;
        state.respostasList = action.payload;
      },

         // BUSCAR FUNIS
         getFunilListSuccess(state, action) {
          state.isLoading = false;
          state.funilList = action.payload;
        },
        getListaCanaisSuccess(state, action) {
          state.isLoading = false;
          state.listaCanais = action.payload;
        },
  

    // BUSCAR SETORES DE CLIENTES
    getUserListSetoresSuccess(state, action) {
      state.isLoading = false;
      state.setoresList = action.payload;
    },

    // BUSCAR USUARIOS DE CLIENTES
    getUserListUsuariosSuccess(state, action) {
      state.isLoading = false;
      state.usuariosList = action.payload;
    },

    // BUSCAR FLUXO DE CLIENTES
    getUserListFluxoSuccess(state, action) {
      state.isLoading = false;
      state.fluxoList = action.payload;
      console.log('fluxo state', state.fluxoList)
    },

    // GET CARDS
    getCardsSuccess(state, action) {
      state.isLoading = false;
      state.cards = action.payload;
    },

    // GET ADDRESS BOOK
    getAddressBookSuccess(state, action) {
      state.isLoading = false;
      state.addressBook = action.payload;
    },

    // GET INVOICES
    getInvoicesSuccess(state, action) {
      state.isLoading = false;
      state.invoices = action.payload;
    },

    // GET NOTIFICATIONS
    getNotificationsSuccess(state, action) {
      state.isLoading = false;
      state.notifications = action.payload;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { onToggleFollow, deleteUser } = slice.actions;

// ----------------------------------------------------------------------

export function getProfile() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/profile');
      dispatch(slice.actions.getProfileSuccess(response.data.profile));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getPosts() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/posts');
      dispatch(slice.actions.getPostsSuccess(response.data.posts));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getFollowers() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/social/followers');
      dispatch(slice.actions.getFollowersSuccess(response.data.followers));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getFriends() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/social/friends');
      dispatch(slice.actions.getFriendsSuccess(response.data.friends));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getGallery() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/social/gallery');
      dispatch(slice.actions.getGallerySuccess(response.data.gallery));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getUserList() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/manage-users');
      dispatch(slice.actions.getUserListSuccess(response.data.users));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getRespostasList(id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
       const responseFunil = await listaFunil(id);
      const response = await listaRespostas(id);
      dispatch(slice.actions.getFunilListSuccess(responseFunil.data.funis));
      dispatch(slice.actions.getRespostasListSuccess(response.data.respostas));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function getListaCanaisPorCliente(id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
       const response = await actionListaCanaisPorCliente(id);
       dispatch(slice.actions.getListaCanaisSuccess(response.data.data));

    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}


export function getFunilList(id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await listaFunil(id);
      dispatch(slice.actions.getFunilListSuccess(response.data.funis));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}




// ----------------------------------------------------------------------

export function getFluxoList(id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await listafluxos({id:id});
      dispatch(slice.actions.getUserListFluxoSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getSetoresList(id) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await listaSetores(id);
      dispatch(slice.actions.getUserListSetoresSuccess(response.data.setores));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getUsuariosList(name) {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await listaTodosUsuariosBossByClienteId(name);
      console.log('clientes list', response.data.usuarios)
      dispatch(slice.actions.getUserListUsuariosSuccess(response.data.usuarios));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getCards() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/account/cards');
      dispatch(slice.actions.getCardsSuccess(response.data.cards));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getAddressBook() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/account/address-book');
      dispatch(slice.actions.getAddressBookSuccess(response.data.addressBook));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getInvoices() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/account/invoices');
      dispatch(slice.actions.getInvoicesSuccess(response.data.invoices));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getNotifications() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/account/notifications-settings');
      dispatch(slice.actions.getNotificationsSuccess(response.data.notifications));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getUsers() {
  return async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/all');
      dispatch(slice.actions.getUsersSuccess(response.data.users));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
