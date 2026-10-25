import React, { useRef, useState } from 'react';
import { AlertButton, SecondaryButton } from '@generatedata/shared';
import WarningIcon from '@mui/icons-material/Warning';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@generatedata/shared';
import { useClasses } from './DeleteDataSetDialog.styles';

export type DeleteDataSetDialogProps = {
  visible: boolean;
  onClose: () => void;
  onDelete: () => void | Promise<any>;
  i18n: any;
  dataSetName?: string | null;
};

const DeleteDataSetDialog = ({ visible, dataSetName, onClose, onDelete, i18n }: DeleteDataSetDialogProps) => {
  const classNames = useClasses();
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const close = () => { if (!pendingRef.current) onClose(); };
  const remove = async () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    try { await onDelete(); }
    finally { pendingRef.current = false; setPending(false); }
  };

  return (
    <Dialog onClose={close} open={visible}>
      <div style={{ width: 420 }}>
        <DialogTitle onClose={close}>{i18n.deleteDataSet}</DialogTitle>
        <DialogContent dividers className={classNames.contentPanel}>
          <WarningIcon />
          <div style={{ flex: 1 }}>
            {i18n.deleteDataSetConfirm}
            {dataSetName ? <div className={classNames.dataSetName}>{dataSetName}</div> : null}
          </div>
        </DialogContent>
        <DialogActions>
          <SecondaryButton disabled={pending} onClick={close}>{i18n.cancel}</SecondaryButton>
          <AlertButton disabled={pending} onClick={remove}>{i18n.delete}</AlertButton>
        </DialogActions>
      </div>
    </Dialog>
  );
};

export default DeleteDataSetDialog;
