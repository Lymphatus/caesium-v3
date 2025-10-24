use crate::{scan_files, CImage};
use indexmap::IndexSet;
use std::cmp::{min, Ordering};
use std::ops::Div;
use std::path::PathBuf;

#[derive(Debug, Clone, PartialEq, Default)]
pub enum FileListColumn {
    #[default]
    Filename,
    Size,
    Resolution,
    Saved,
}

impl FileListColumn {
    pub(crate) fn from_str(s: &str) -> Option<Self> {
        match s {
            "filename" => Some(FileListColumn::Filename),
            "size" => Some(FileListColumn::Size),
            "resolution" => Some(FileListColumn::Resolution),
            "saved" => Some(FileListColumn::Saved),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Default)]
pub enum SortOrder {
    #[default]
    Ascending,
    Descending,
}

impl SortOrder {
    pub(crate) fn from_str(s: &str) -> Option<Self> {
        match s {
            "ascending" => Some(SortOrder::Ascending),
            "descending" => Some(SortOrder::Descending),
            _ => None,
        }
    }
}

#[derive(Default)]
pub struct AppData {
    pub(crate) file_list: AppDataFileList,
    pub(crate) base_path: PathBuf,
}

#[derive(Default)]
pub struct AppDataFileList {
    pub list: IndexSet<CImage>,
    pub filtered_ids: IndexSet<String>,
    pub paged_list: Vec<CImage>,
    pub current_page: usize,
    pub items_per_page: usize,
    pub search_query: String,
    pub sorting: AppDataFileListSorting,
}

#[derive(Default)]
pub struct AppDataFileListSorting {
    column: FileListColumn,
    order: SortOrder,
}

impl AppData {
    pub fn default() -> Self {
        Self {
            file_list: AppDataFileList::new(),
            base_path: PathBuf::new(),
        }
    }

    pub fn new() -> Self {
        Self::default()
    }

    pub fn compute_base_path(&mut self) -> Result<(), std::io::Error> {
        let mut base_path = PathBuf::default();
        for c in self.file_list.iter() {
            base_path = match scan_files::compute_base_path(c.path.as_ref(), &base_path) {
                Some(p) => p,
                None => {
                    return Err(std::io::Error::other(format!(
                        "Could not compute base path for file {0}",
                        c.path
                    )))
                }
            };
        }
        self.base_path = base_path;
        Ok(())
    }
}

impl AppDataFileList {
    pub fn default() -> Self {
        Self {
            list: IndexSet::new(),
            filtered_ids: IndexSet::new(),
            paged_list: vec![],
            current_page: 1,
            items_per_page: 50,
            search_query: String::new(),
            sorting: AppDataFileListSorting::default(),
        }
    }

    pub fn new() -> Self {
        Self::default()
    }

    pub fn clear(&mut self) {
        self.list = IndexSet::new();
        self.filtered_ids = IndexSet::new();
    }

    pub fn remove_ids(&mut self, ids: &Vec<String>) {
        for id in ids {
            self.remove(id);
        }

        self.compute_paged_list();
    }
    fn remove(&mut self, id: &str) {
        if self.filtered_ids.contains(id) {
            self.filtered_ids.shift_remove(id);
        }

        self.list.shift_remove(id);
    }

    pub fn len(&self) -> usize {
        if !self.filtered_ids.is_empty() {
            return self.filtered_ids.len();
        }

        if self.filtered_ids.is_empty() && !self.search_query.is_empty() {
            return 0;
        }

        self.list.len()
    }

    pub fn full_len(&self) -> usize {
        self.list.len()
    }

    pub fn iter(&self) -> impl Iterator<Item = &CImage> {
        self.list.iter()
    }

    //TODO should we account for the filtered ids?
    pub fn replace(&mut self, cimage: CImage) {
        self.list.replace(cimage);
    }

    //TODO should we account for the filtered ids?
    pub fn get(&self, id: &str) -> Option<&CImage> {
        self.list.get(id)
    }

    pub fn insert(&mut self, cimage: CImage) {
        if self.is_query_hit(&cimage, &self.search_query) {
            self.filtered_ids.insert(cimage.id.clone());
        }
        self.list.insert(cimage);
    }

    pub fn change_page(&mut self, page: usize) {
        let max_page = (self.len() as f64 / self.items_per_page as f64).ceil() as usize;
        self.current_page = page.min(max_page).max(1);

        self.compute_paged_list();
    }

    pub fn sort_list_by(&mut self, column: FileListColumn, order: SortOrder) {
        self.sorting.column = column;
        self.sorting.order = order;

        self.sort_list();
    }

    pub fn sort_list(&mut self) {
        self.list.par_sort_by(|a, b| {
            let comparison = match self.sorting.column {
                FileListColumn::Filename => a.name.cmp(&b.name),
                FileListColumn::Size => a.size.cmp(&b.size),
                FileListColumn::Resolution => (a.width * a.height).cmp(&(b.width * b.height)),
                FileListColumn::Saved => get_saved_size(a.size, a.compressed_size)
                    .partial_cmp(&(get_saved_size(b.size, b.compressed_size)))
                    .unwrap_or(Ordering::Equal), // TODO Don't know if this is the best way to handle this
            };

            match self.sorting.order {
                SortOrder::Ascending => comparison,
                SortOrder::Descending => comparison.reverse(),
            }
        });

        self.filter_list(&self.search_query.clone());
        self.compute_paged_list();
    }

    pub fn filter_list(&mut self, query: &String) {
        self.search_query = query.clone();
        self.filtered_ids.clear();
        for c in self.list.iter() {
            if self.is_query_hit(c, query) {
                self.filtered_ids.insert(c.id.clone());
            }
        }

        self.change_page(self.current_page);
    }

    fn compute_paged_list(&mut self) {
        if self.list.is_empty() || self.filtered_ids.is_empty() {
            self.paged_list = vec![];
            return;
        }
        let offset = (self.current_page - 1) * self.items_per_page;
        let paged_ids = self
            .filtered_ids
            .get_range(offset..min(self.filtered_ids.len(), offset + self.items_per_page)) //TODO check out of range
            .unwrap() //TODO
            .iter()
            .cloned()
            .collect::<Vec<String>>();

        self.paged_list = vec![];
        for id in paged_ids {
            match self.get(id.as_str()) {
                Some(c) => self.paged_list.push(c.clone()),
                None => continue,
            }
        }
    }

    fn is_query_hit(&self, cimage: &CImage, query: &String) -> bool {
        cimage.path.contains(query) || cimage.name.contains(query)
    }
}

fn get_saved_size(old_size: u64, new_size: u64) -> f64 {
    if old_size == 0 {
        return 0.0;
    }
    (old_size.saturating_sub(new_size) as f64).div(old_size as f64)
}
