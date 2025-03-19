import useFileListStore from '@/stores/file-list.store.ts';

function ListPanel() {
  const { fileList, baseFolder } = useFileListStore();
  const listItems = fileList.map((path) => <li key={path.id}>{path.path}</li>);

  return (
    <div className="size-full">
      <div className="bg-background size-full rounded">
        <p className="font-bold">{baseFolder}</p>
        <ul>{listItems}</ul>
      </div>
    </div>
  );
}

export default ListPanel;
