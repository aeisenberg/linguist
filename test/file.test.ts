import * as path from 'path';
import slash from 'slash2';

import { LocFile, FileInfo } from '../src/file';

describe('File', () => {
  it('should calculate info for a javascript file', async () => {
    await doTest('x.js', {
      languages: 'javascript',
      lines: {
        code: 5,
        comment: 5,
        total: 17
      },
      name: 'x.js',
      size: 52
    });
  });

  it('should calculate info for an html file', async () => {
    await doTest('x.html', {
      languages: 'html',
      lines: {
        code: 4,
        comment: 4,
        total: 10
      },
      name: 'x.html',
      size: 52
    });
  });

  it('should calculate info for a python file', async () => {
    await doTest('x.py', {
      languages: 'python',
      lines: {
        code: 7,
        comment: 8,
        total: 19
      },
      name: 'x.py',
      size: 152
    });
  });

  it('should calculate info for a ruby file', async () => {
    await doTest('x.rb', {
      languages: 'ruby',
      lines: {
        code: 7,
        comment: 6,
        total: 15
      },
      name: 'x.rb',
      size: 69
    });
  });

  it('should calculate info for a csharp file', async () => {
    await doTest('x.cs', {
      languages: 'c#',
      lines: {
        code: 10,
        comment: 4,
        total: 17
      },
      name: 'x.cs',
      size: 253
    });
  });

  async function doTest(fileName: string, expectedFileInfo: FileInfo) {
    const fullPath = slash(path.join(__dirname, `/data2/${fileName}`));
    const actualFileInfo = await new LocFile(fullPath).getFileInfo();
    expect(actualFileInfo).toEqual(expectedFileInfo);
  }
});
