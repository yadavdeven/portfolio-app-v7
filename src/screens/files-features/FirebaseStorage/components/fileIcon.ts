import { ImageSourcePropType } from 'react-native';

// Pre-colored type icons. `txt` doubles as the generic fallback.
const ICONS = {
  pdf: require('../../../../assets/images/icons8-pdf-100.png'),
  excel: require('../../../../assets/images/icons8-excel-100.png'),
  word: require('../../../../assets/images/icons8-microsoft-word-100.png'),
  txt: require('../../../../assets/images/icons8-txt-100.png'),
  video: require('../../../../assets/images/icons8-video-file-100.png'),
  image: require('../../../../assets/images/icons8-image-file-100.png'),
};

const has = (list: string[], ext: string) => list.includes(ext);

// Map a file's name/MIME to its icon. Checks specific types before the
// generic text/* so e.g. .docx (an application/* MIME) wins over text.
export const getFileIcon = (
  name?: string,
  contentType?: string | null,
): ImageSourcePropType => {
  const ext = (name?.split('.').pop() ?? '').toLowerCase();
  const ct = (contentType ?? '').toLowerCase();

  if (ct.startsWith('image/') || has(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic', 'heif', 'svg'], ext)) {
    return ICONS.image;
  }
  if (ct.startsWith('video/') || has(['mp4', 'mov', 'avi', 'mkv', 'webm', 'm4v', '3gp'], ext)) {
    return ICONS.video;
  }
  if (ct === 'application/pdf' || ext === 'pdf') {
    return ICONS.pdf;
  }
  if (ct.includes('word') || has(['doc', 'docx'], ext)) {
    return ICONS.word;
  }
  if (ct.includes('sheet') || ct.includes('excel') || has(['xls', 'xlsx', 'csv'], ext)) {
    return ICONS.excel;
  }
  if (ct.startsWith('text/') || has(['txt', 'md', 'rtf', 'log'], ext)) {
    return ICONS.txt;
  }
  return ICONS.txt; // generic fallback
};
