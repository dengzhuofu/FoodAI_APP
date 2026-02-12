import client from './client';
import { Platform } from 'react-native';

export const uploadFile = async (
  uri: string,
  options?: { filename?: string; mimeType?: string }
): Promise<string> => {
  const formData = new FormData();
  
  // Need to convert URI to blob/file object for React Native
  const filename = options?.filename || uri.split('/').pop() || 'file';
  const match = /\.(\w+)$/.exec(filename);
  const ext = (match?.[1] || '').toLowerCase();
  const typeFromExt: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    m4v: 'video/x-m4v',
    avi: 'video/x-msvideo',
    mkv: 'video/x-matroska',
  };
  const type =
    options?.mimeType ||
    (ext && typeFromExt[ext] ? typeFromExt[ext] : 'application/octet-stream');

  if (Platform.OS === 'web') {
    // For Web, we need to fetch the blob from the blob: URI
    const response = await fetch(uri);
    const blob = await response.blob();
    formData.append('file', blob, filename);
  } else {
    // For Native (iOS/Android)
    // @ts-ignore: FormData expects specific object structure in RN
    formData.append('file', {
      uri,
      name: filename,
      type,
    });
  }

  const response = await client.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Return the full URL
  // If response.data.url is relative, prepend baseURL
  const url = response.data.url;
  if (url.startsWith('http')) {
    return url;
  }
  return `${client.defaults.baseURL?.replace('/api/v1', '')}${url}`;
};
