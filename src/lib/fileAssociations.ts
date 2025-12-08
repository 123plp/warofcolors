// File Associations System
// Maps file extensions to applications

export interface FileAssociation {
  extension: string;
  appId: string;
  appName: string;
  icon?: string;
}

// Default file associations
const DEFAULT_ASSOCIATIONS: FileAssociation[] = [
  // Text files
  { extension: '.txt', appId: 'notepad', appName: 'Notepad' },
  { extension: '.md', appId: 'notepad', appName: 'Notepad' },
  { extension: '.log', appId: 'notepad', appName: 'Notepad' },
  { extension: '.json', appId: 'notepad', appName: 'Notepad' },
  { extension: '.xml', appId: 'notepad', appName: 'Notepad' },
  { extension: '.cfg', appId: 'notepad', appName: 'Notepad' },
  { extension: '.ini', appId: 'notepad', appName: 'Notepad' },
  
  // Images
  { extension: '.png', appId: 'image-viewer', appName: 'Image Viewer' },
  { extension: '.jpg', appId: 'image-viewer', appName: 'Image Viewer' },
  { extension: '.jpeg', appId: 'image-viewer', appName: 'Image Viewer' },
  { extension: '.gif', appId: 'image-viewer', appName: 'Image Viewer' },
  { extension: '.webp', appId: 'image-viewer', appName: 'Image Viewer' },
  { extension: '.svg', appId: 'image-viewer', appName: 'Image Viewer' },
  { extension: '.bmp', appId: 'image-viewer', appName: 'Image Viewer' },
  
  // Recovery images
  { extension: '.img', appId: 'image-editor', appName: 'Image Editor' },
  { extension: '.dmp', appId: 'notepad', appName: 'Notepad' },
  
  // Documents
  { extension: '.pdf', appId: 'pdf-reader', appName: 'PDF Reader' },
  { extension: '.doc', appId: 'notepad', appName: 'Notepad' },
  { extension: '.docx', appId: 'notepad', appName: 'Notepad' },
  
  // Media
  { extension: '.mp3', appId: 'music-player', appName: 'Music Player' },
  { extension: '.wav', appId: 'music-player', appName: 'Music Player' },
  { extension: '.ogg', appId: 'music-player', appName: 'Music Player' },
  { extension: '.mp4', appId: 'video-player', appName: 'Video Player' },
  { extension: '.webm', appId: 'video-player', appName: 'Video Player' },
  { extension: '.avi', appId: 'video-player', appName: 'Video Player' },
  
  // Spreadsheets
  { extension: '.csv', appId: 'spreadsheet', appName: 'Spreadsheet' },
  { extension: '.xlsx', appId: 'spreadsheet', appName: 'Spreadsheet' },
  { extension: '.xls', appId: 'spreadsheet', appName: 'Spreadsheet' },
  
  // Executables (special handling)
  { extension: '.exe', appId: 'terminal', appName: 'Terminal' },
  { extension: '.sh', appId: 'terminal', appName: 'Terminal' },
  { extension: '.bat', appId: 'terminal', appName: 'Terminal' },
];

const ASSOCIATIONS_KEY = 'urbanshade_file_associations';

export const getFileAssociations = (): FileAssociation[] => {
  try {
    const custom = localStorage.getItem(ASSOCIATIONS_KEY);
    if (custom) {
      const customAssoc = JSON.parse(custom) as FileAssociation[];
      // Merge custom with defaults, custom takes priority
      const merged = [...DEFAULT_ASSOCIATIONS];
      for (const ca of customAssoc) {
        const idx = merged.findIndex(a => a.extension === ca.extension);
        if (idx !== -1) {
          merged[idx] = ca;
        } else {
          merged.push(ca);
        }
      }
      return merged;
    }
  } catch {}
  return DEFAULT_ASSOCIATIONS;
};

export const getAssociationForFile = (filename: string): FileAssociation | null => {
  const ext = getFileExtension(filename);
  if (!ext) return null;
  
  const associations = getFileAssociations();
  return associations.find(a => a.extension.toLowerCase() === ext.toLowerCase()) || null;
};

export const getFileExtension = (filename: string): string | null => {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) return null;
  return filename.substring(lastDot).toLowerCase();
};

export const setFileAssociation = (extension: string, appId: string, appName: string): boolean => {
  try {
    const associations = getFileAssociations();
    const idx = associations.findIndex(a => a.extension === extension);
    
    const newAssoc: FileAssociation = { extension, appId, appName };
    
    if (idx !== -1) {
      associations[idx] = newAssoc;
    } else {
      associations.push(newAssoc);
    }
    
    // Only save custom overrides
    const customs = associations.filter(a => {
      const def = DEFAULT_ASSOCIATIONS.find(d => d.extension === a.extension);
      return !def || def.appId !== a.appId;
    });
    
    localStorage.setItem(ASSOCIATIONS_KEY, JSON.stringify(customs));
    return true;
  } catch {
    return false;
  }
};

export const resetFileAssociations = (): void => {
  localStorage.removeItem(ASSOCIATIONS_KEY);
};

// Get app ID for opening a file
export const getAppForFile = (filename: string): string | null => {
  const assoc = getAssociationForFile(filename);
  return assoc?.appId || null;
};
