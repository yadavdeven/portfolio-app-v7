// types
type SubItem = {
  id: string;
  name: string;
  routeTo?: string;
};

type CategorySection = {
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
      { id: 'a-1', name: 'Cards Rotate', routeTo: 'CardsRotateScreen' },
      { id: 'a-3', name: 'Scroll Animation', routeTo: 'ScrollAnimationScreen' },
      {
        id: 'a-4',
        name: 'Checkbox Animation',
        routeTo: 'CheckboxAnimationScreen',
      },
    ],
  },
  {
    id: 'features',
    title: 'Features',
    data: [
      { id: 'f-1', name: 'Text Editor', routeTo: 'TextEditorScreen' },
      {
        id: 'f-2',
        name: 'Biometric Authentication',
        routeTo: 'BiometricScreen',
      },
    ],
  },
  {
    id: 'file_storage_uploads',
    title: 'File Storage and Uploads',
    data: [
      {
        id: 'd-1',
        name: 'File Save & Share',
        routeTo: 'FileSaveAndDownloadScreen',
      },
      { id: 'd-2', name: 'Firebase Upload' },
      { id: 'd-3', name: 'AWS S3 Bucket Upload' },
      { id: 'd-4', name: 'Download & View Files Firebase' },
      { id: 'd-5', name: 'Download & View Files AWS' },
    ],
  },
  {
    id: 'components',
    title: 'Components',
    data: [
      { id: 'g-1', name: 'Select Dropdowns', routeTo: 'SelectDropdowns' },
      { id: 'g-2', name: 'Text Inputs' },
    ],
  },
  {
    id: 'camera_media_processing',
    title: 'Camera & Media Processing',
    data: [
      { id: 'e-1', name: 'Capture Image & Upload' },
      { id: 'e-2', name: 'Capture Video & Upload' },
      { id: 'e-3', name: 'Capture, Edit & Play Video' },
      { id: 'e-4', name: 'Barcode/QR Scanner' },
    ],
  },
  {
    id: 'native_modules',
    title: 'Native Modules',
    data: [
      { id: 'b-1', name: 'Show Welcome Alert', routeTo: 'WelcomeAlertScreen' },
      { id: 'b-3', name: 'sub3' },
      { id: 'b-4', name: 'sub4' },
    ],
  },
  {
    id: 'custom_hooks',
    title: 'Custom Hooks',
    data: [
      { id: 'c-1', name: 'Custom Hook 1' },
      { id: 'c-2', name: 'Custom Hook 2' },
      { id: 'c-3', name: 'Custom Hook 3' },
    ],
  },
];
