import { useTranslation } from 'react-i18next';

import { Menu } from '@tauri-apps/api/menu/menu';
import { MenuItem } from '@tauri-apps/api/menu/menuItem';
import { Submenu } from '@tauri-apps/api/menu/submenu';
import { PredefinedMenuItem } from '@tauri-apps/api/menu/predefinedMenuItem';
import { CheckMenuItem } from '@tauri-apps/api/menu/checkMenuItem';
import { useEffect } from 'react';
import useUIStore from '@/stores/ui.store.ts';
import useFileListStore from '@/stores/file-list.store.ts';
import { invoke } from '@tauri-apps/api/core';

let appMenu: Menu | null = null;
function MenuBar() {
  const { t } = useTranslation();
  const { openPickerDialogs } = useFileListStore();
  const { setSettingsDialogOpen } = useUIStore();

  useEffect(() => {
    buildAppMenu().then((menu) => {
      appMenu = menu;
    });

    return () => {
      appMenu = null;
    };
  }, []);

  async function buildFileMenu() {
    const fileMenu = await Submenu.new({
      text: t('menubar.file'),
      id: 'file',
    });

    await fileMenu.append([
      await MenuItem.new({
        id: 'file.add',
        text: t('actions.add_dots'),
        accelerator: 'CmdOrCtrl+O',
        action: handleMenuTrigger,
      }),
      await MenuItem.new({
        id: 'file.add_folder',
        text: t('actions.add_folder_dots'),
        accelerator: 'CmdOrCtrl+Shift+O',
        action: handleMenuTrigger,
      }),
      await MenuItem.new({
        id: 'file.advanced_import',
        text: t('actions.advanced_import'),
        action: handleMenuTrigger,
      }),
      await PredefinedMenuItem.new({ item: 'Separator' }),
      await PredefinedMenuItem.new({ text: t('actions.exit'), item: 'Quit' }),
    ]);

    return fileMenu;
  }

  async function buildEditMenu() {
    const editMenu = await Submenu.new({
      text: t('menubar.edit'),
      id: 'edit',
    });

    await editMenu.append([
      await MenuItem.new({
        id: 'edit.remove',
        text: t('actions.remove'),
        accelerator: 'Del',
        enabled: false,
        action: handleMenuTrigger,
      }),
      await MenuItem.new({
        id: 'edit.clear',
        text: t('actions.clear'),
        enabled: false,
        action: handleMenuTrigger,
      }),
      await PredefinedMenuItem.new({ item: 'Separator' }),
      await MenuItem.new({
        id: 'edit.select_all',
        text: t('actions.select_all'),
        accelerator: 'CmdOrCtrl+A',
        enabled: false,
        action: handleMenuTrigger,
      }),
      await PredefinedMenuItem.new({ item: 'Separator' }),
      await MenuItem.new({
        id: 'edit.settings',
        text: t('actions.settings'),
        action: handleMenuTrigger,
      }),
    ]);

    return editMenu;
  }

  async function buildViewMenu() {
    const viewMenu = await Submenu.new({
      text: t('menubar.view'),
      id: 'view',
    });

    await viewMenu.append([
      await MenuItem.new({
        id: 'view.preview',
        text: t('actions.preview'),
        accelerator: 'CmdOrCtrl+P',
        enabled: false,
        action: handleMenuTrigger,
      }),
      await PredefinedMenuItem.new({ item: 'Separator' }),
      await CheckMenuItem.new({
        id: 'view.show_previews',
        text: t('actions.show_previews'),
        checked: true,
        action: handleMenuTrigger,
      }),
      await CheckMenuItem.new({
        id: 'view.auto_preview',
        text: t('actions.auto_preview'),
        checked: true,
        action: handleMenuTrigger,
      }),
    ]);

    return viewMenu;
  }

  async function buildHelpMenu() {
    const helpMenu = await Submenu.new({
      text: t('menubar.help'),
      id: 'help',
    });

    await helpMenu.append([
      await MenuItem.new({
        id: 'help.donate',
        text: t('actions.donate'),
        action: handleMenuTrigger,
      }),
      await MenuItem.new({
        id: 'help.about',
        text: t('actions.about'),
        action: handleMenuTrigger,
      }),
    ]);

    return helpMenu;
  }

  async function buildAppMenu() {
    const menu = await Menu.new();

    // Append menus to the main menu
    await menu.append(await buildFileMenu());
    await menu.append(await buildEditMenu());
    await menu.append(await buildViewMenu());
    await menu.append(await buildHelpMenu());
    // Set the menu as the app menu
    return menu.setAsAppMenu();
    // return menu;
  }

  async function handleMenuTrigger(id: string) {
    switch (id) {
      case 'file.add':
        await openPickerDialogs('files');
        break;
      case 'file.add_folder':
        await openPickerDialogs('folder');
        break;
      case 'file.advanced_import':
        //TODO
        break;
      case 'edit.remove':
        await invoke('remove_items_from_list', { keys: [] });
        break;
      case 'edit.clear':
        await invoke('clear_list');
        break;
      case 'edit.select_all':
        //TODO
        break;
      case 'edit.settings':
        setSettingsDialogOpen(true);
        break;
      case 'view.preview':
        //TODO
        break;
      case 'view.show_previews':
        //TODO
        break;
      case 'view.auto_preview':
        //TODO
        break;
      case 'help.donate':
        //TODO
        break;
      case 'help.about':
        //TODO
        break;
    }
  }

  return null;
}

const toggleMenuVisibility = async (showing: boolean) => {
  if (appMenu) {
    const items = await appMenu.items();
    for (const i of items) {
      if (i instanceof PredefinedMenuItem) {
        continue;
      }
      await i.setEnabled(!showing);
    }
  }
};
useUIStore.subscribe((state) => state.settingsDialogOpen, toggleMenuVisibility);
useFileListStore.subscribe((state) => state.isImporting, toggleMenuVisibility);
useFileListStore.subscribe(
  (state) => state.fileList,
  async (fileList) => {
    if (!appMenu) return;
    const menuEntry = await appMenu.get('edit');

    if (!(menuEntry instanceof Submenu)) {
      return;
    }
    const item = await menuEntry.get('edit.clear');

    if (item instanceof MenuItem) {
      await item.setEnabled(fileList.length > 0);
    }
  },
);
export default MenuBar;
