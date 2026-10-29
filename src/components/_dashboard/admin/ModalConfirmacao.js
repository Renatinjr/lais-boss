import * as React from 'react';
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from '@material-ui/core'

export default function ModalConfirmacao({ titulo, open, onClose, onConfirm }) {

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {titulo}
            </DialogTitle>
            <DialogContent>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant='contained' onClick={onConfirm} autoFocus>Continuar</Button>
            </DialogActions>
        </Dialog>
    );
}