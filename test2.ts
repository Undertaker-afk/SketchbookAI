import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';

// Create a wrapper for fetch to log all calls
const fetchWrapper = async (url: string, options?: RequestInit): Promise<Response> => {
  console.log(`fetch called with url:`, url, `and options:`, options);
  return await fetch(url, options);
};

interface GitFS {
  readFile: (filepath: string, options: { encoding?: string }) => Promise<Uint8Array | string>;
  writeFile: (filepath: string, data: Uint8Array | string, options: { encoding?: string }) => Promise<void>;
  unlink: (filepath: string) => Promise<void>;
  readdir: (filepath: string) => Promise<string[]>;
  mkdir: (filepath: string) => Promise<void>;
  rmdir: (filepath: string) => Promise<void>;
  stat: (filepath: string) => Promise<{ type: string; mode: number; size: number; ino: number; mtimeMs: number }>;
  lstat: (filepath: string) => Promise<{ type: string; mode: number; size: number; ino: number; mtimeMs: number }>;
}

const fs: GitFS = {
  readFile: async (filepath: string, options: { encoding?: string }) => {
    const response = await fetchWrapper(`${filepath}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return options.encoding ? await response.text() : new Uint8Array(await response.arrayBuffer());
  },
  writeFile: async (filepath: string, data: Uint8Array | string, options: { encoding?: string }) => {
    await fetchWrapper(`${filepath}`, {
      method: 'PUT',
      body: data,
      headers: { 'Content-Type': options.encoding || 'application/octet-stream' }
    });
  },
  unlink: async (filepath: string) => {
    await fetchWrapper(`${filepath}`, { method: 'DELETE' });
  },
  readdir: async (filepath: string) => {
    const response = await fetchWrapper(`${filepath}?list`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json() as string[];
  },
  mkdir: async (filepath: string) => {
    await fetchWrapper(`${filepath}`, { method: 'MKCOL' });
  },
  rmdir: async (filepath: string) => {
    await fetchWrapper(`${filepath}`, { method: 'DELETE' });
  },
  stat: async (filepath: string) => {
    const response = await fetchWrapper(`${filepath}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const lastModified = response.headers.get('Last-Modified');
    return {
      type: 'file',
      mode: 0o100644,
      size: parseInt(response.headers.get('Content-Length') || '0', 10),
      ino: 0,
      mtimeMs: lastModified ? new Date(lastModified).getTime() : 0,
    };
  },
  lstat: async (filepath: string) => {
    // For simplicity, we're using the same implementation as stat
    return fs.stat(filepath);
  },
};

(async () => {
  try {
    const commits = await git.log({
      fs,
      dir: './',
      depth: 10, // Adjust depth for more commits
    });

    commits.forEach(commit => {
      console.log(commit);
    });
  } catch (error) {
    console.error('Error:', error);
  }
})();
