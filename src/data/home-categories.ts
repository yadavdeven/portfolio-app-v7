// types
export type SubItem = {
  id: string;
  name: string;
};

export type CategorySection = {
  id: string;
  title: string;
  data: SubItem[];
};

// typed categories array
export const categories: CategorySection[] = [
  {
    id: 'animations',
    title: 'Animations',
    data: [
      { id: 'sub1', name: 'sub1' },
      { id: 'sub2', name: 'sub2' },
      { id: 'sub3', name: 'sub3' },
    ],
  },
  {
    id: 'native_modules',
    title: 'Native Modules',
    data: [
      { id: 'sub1', name: 'sub1' },
      { id: 'sub2', name: 'sub2' },
      { id: 'sub3', name: 'sub3' },
    ],
  },
  {
    id: 'custom_hooks',
    title: 'Custom Hooks',
    data: [
      { id: 'sub1', name: 'sub1' },
      { id: 'sub2', name: 'sub2' },
      { id: 'sub3', name: 'sub3' },
    ],
  },
  {
    id: 'file_storage_uploads',
    title: 'File Storage and Uploads',
    data: [
      { id: 'sub1', name: 'sub1' },
      { id: 'sub2', name: 'sub2' },
      { id: 'sub3', name: 'sub3' },
    ],
  },
  {
    id: 'camera_media_processing',
    title: 'Camera & Media Processing',
    data: [
      { id: 'sub1', name: 'sub1' },
      { id: 'sub2', name: 'sub2' },
      { id: 'sub3', name: 'sub3' },
    ],
  },
];
