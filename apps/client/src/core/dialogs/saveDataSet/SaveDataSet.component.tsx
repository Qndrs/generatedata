import React, { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { TextField } from '@generatedata/shared';
import { PrimaryButton } from '@generatedata/shared';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@generatedata/shared';
import { useClasses } from './SaveDataSet.styles';
import { SaveDataDialogType } from '~store/account/account.reducer';

export type SaveDataSetDialogProps = {
  visible: boolean;
  isLoggedIn: boolean;
  dialogType: SaveDataDialogType;
  showRegistration: boolean;
  onRedirectToLogin: () => void;
  onClose: any;
  onSave: (dataSetName: string) => void | Promise<any>;
  i18n: any;
};

const SaveDataSetDialog = ({
  visible,
  isLoggedIn,
  dialogType,
  onClose,
  onSave,
  showRegistration,
  onRedirectToLogin,
  i18n
}: SaveDataSetDialogProps) => {
  const navigate = useNavigate();
  const classNames = useClasses();

  const newDataSetNameField = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const close = () => { if (!savingRef.current) onClose(); };
  const [newDataSetName, setNewDataSetName] = useState('');
  const [newDataSetNameError, setNewDataSetErrorName] = useState('');

  const onExited = (): void => {
    setNewDataSetName('');
    setNewDataSetErrorName('');
  };

  let title = dialogType === SaveDataDialogType.save ? i18n.save : i18n.saveAs;
  let content = (
    <div className={classNames.newDataSet}>
      <TextField
        throttle={false}
        disabled={saving}
        ref={newDataSetNameField}
        error={newDataSetNameError}
        placeholder={i18n.dataSetName}
        autoFocus
        value={newDataSetName}
        onChange={(e: any): void => {
          setNewDataSetName(e.target.value);
          setNewDataSetErrorName('');
        }}
      />
    </div>
  );

  const saveDataSet = async (e: any): Promise<void> => {
    e.preventDefault();
    if (savingRef.current) return;

    if (!newDataSetName.trim()) {
      setNewDataSetErrorName(i18n.missingDataSetName);
      newDataSetNameField.current!.focus();
    } else {
      savingRef.current = true;
      setSaving(true);
      try {
        await onSave(newDataSetName.trim());
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    }
  };

  const gotoRegistration = useCallback(() => {
    onClose();
    navigate('/register');
  }, []);

  let buttons = <PrimaryButton type="submit" disabled={saving}>{saving ? i18n.savingDataSet : i18n.save}</PrimaryButton>;

  if (!isLoggedIn) {
    title = i18n.pleaseLogin;
    const msg = showRegistration ? i18n.loginOrRegisterToSave : i18n.loginToSave;
    content = (
      <div className={classNames.notLoggedIn}>
        <PersonAddIcon />
        {msg}
      </div>
    );
    buttons = (
      <>
        <PrimaryButton onClick={onRedirectToLogin}>{i18n.login}</PrimaryButton>
        {showRegistration && <PrimaryButton onClick={gotoRegistration}>{i18n.register}</PrimaryButton>}
      </>
    );
  }

  return (
    <Dialog onClose={close} open={visible} TransitionProps={{ onExited }}>
      <form onSubmit={saveDataSet}>
        <div style={{ width: 420 }}>
          <DialogTitle onClose={close}>{title}</DialogTitle>
          <DialogContent dividers className={classNames.contentPanel}>
            {content}
          </DialogContent>
          <DialogActions>{buttons}</DialogActions>
        </div>
      </form>
    </Dialog>
  );
};

export default SaveDataSetDialog;
