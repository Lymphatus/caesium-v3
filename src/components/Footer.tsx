import useFileListStore from '@/stores/file-list.store.ts';

function Footer() {
  const { baseFolder, totalFiles } = useFileListStore();

  return (
    <div className="w-full h-[30px] flex items-center justify-between bg-content1">
      <div>{totalFiles}</div>
      <div>{baseFolder}</div>
    </div>
  );
}

export default Footer;
