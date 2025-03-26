import useFileListStore from '@/stores/file-list.store.ts';

function Footer() {
  const { baseFolder, totalFiles } = useFileListStore();

  return (
    <div className="bg-content1 flex h-[30px] w-full items-center justify-between">
      <div>{totalFiles}</div>
      <div>{baseFolder}</div>
    </div>
  );
}

export default Footer;
