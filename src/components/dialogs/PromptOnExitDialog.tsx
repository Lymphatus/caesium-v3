import AskDialog from '@/components/dialogs/AskDialog.tsx';
import { t } from 'i18next';
import useUIStore from '@/stores/ui.store.ts';
import useSettingsStore from '@/stores/settings.store.ts';
import { Button } from '../ui/button';

function PromptOnExitDialog({ onConfirm, onCancel }: { onConfirm?: () => void; onCancel?: () => void }) {
  const { promptExitDialogOpen, setPromptExitDialogOpen } = useUIStore();
  const { skipMessagesAndDialogs } = useSettingsStore();

  return (
    <AskDialog
      buttons={
        <>
          <Button variant="destructive" onClick={onConfirm}>
            {t('affirmative_answer')}
          </Button>
          <Button variant="secondary" onClick={onCancel}>
            {t('negative_answer')}
          </Button>
        </>
      }
      isOpen={promptExitDialogOpen && !skipMessagesAndDialogs}
      message={t('confirm_exit_message')}
      onClosed={() => setPromptExitDialogOpen(false)}
    ></AskDialog>
  );
}

export default PromptOnExitDialog;
