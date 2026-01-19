import AskDialog from '@/components/dialogs/AskDialog.tsx';
import { Button } from '@heroui/react';
import { t } from 'i18next';
import useUIStore from '@/stores/ui.store.ts';
import useSettingsStore from '@/stores/settings.store.ts';

function PromptOnExitDialog({ onConfirm, onCancel }: { onConfirm?: () => void; onCancel?: () => void }) {
  const { promptExitDialogOpen, setPromptExitDialogOpen } = useUIStore();
  const { skipMessagesAndDialogs } = useSettingsStore();

  return (
    <AskDialog
      buttons={
        <>
          <Button disableRipple color="primary" onPress={onConfirm}>
            {t('affirmative_answer')}
          </Button>
          <Button disableRipple onPress={onCancel}>
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
