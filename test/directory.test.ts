import * as path from 'path';
import slash from 'slash2';

import { LocDir, LocDirOptions, LocResult } from '../src/directory';

describe('Directory', () => {
  it('should calculate info for a directory', async () => {
    await doTest({
      cwd: __dirname + '/data2'
    }, {
      files: [
        'data2/x.cs',
        'data2/x.html',
        'data2/x.js',
        'data2/x.py',
        'data2/x.rb',
      ],
      info: {
        code: 33,
        comment: 27,
        total: 78,
      },
      languages: {
        "c#": {
          code: 10,
          comment: 4,
          sum: 1,
          total: 17,
        },
        html: {
          code: 4,
          comment: 4,
          sum: 1,
          total: 10,
        },
        javascript: {
          code: 5,
          comment: 5,
          sum: 1,
          total: 17,
        },
        python: {
          code: 7,
          comment: 8,
          sum: 1,
          total: 19,
        },
        ruby: {
          code: 7,
          comment: 6,
          sum: 1,
          total: 15,
        }
      }
    });
  });

  it('should calculate info for a directory only for specified languages', async () => {
    await doTest({
      analysisLanguages: ['javascript', 'python'],
      cwd: __dirname + '/data2'
    }, {
      files: [
        'data2/x.js',
        'data2/x.py',
      ],
      info: {
        code: 12,
        comment: 13,
        total: 36,
      },
      languages: {
        javascript: {
          code: 5,
          comment: 5,
          sum: 1,
          total: 17,
        },
        python: {
          code: 7,
          comment: 8,
          sum: 1,
          total: 19,
        }
      }
    });
  });

  it('should calculate using multiple includes', async () => {
    await doTest({
      cwd: __dirname + '/data3/a',
      include: ['a', './b', 'c/**']
    }, {
      files: [
        'data3/a/a/d',
        'data3/a/a/e',
        'data3/a/a/f',
        'data3/a/b/d',
        'data3/a/b/e',
        'data3/a/b/f',
        'data3/a/c/d',
        'data3/a/c/e',
        'data3/a/c/f',
      ],
      ...makeEmptyBlock(9)
    });
  });

  it('should calculate using multiple includes and excludes', async () => {
    await doTest({
      cwd: __dirname + '/data3',
      include: ['a', './b', 'c/**'],
      exclude: ['**/b']
    }, {
      files: [
        'data3/a/a/d',
        'data3/a/a/e',
        'data3/a/a/f',
        'data3/a/c/d',
        'data3/a/c/e',
        'data3/a/c/f',

        'data3/c/a/d',
        'data3/c/a/e',
        'data3/c/a/f',
        'data3/c/c/d',
        'data3/c/c/e',
        'data3/c/c/f',
      ],
      ...makeEmptyBlock(12)
    });
  });

  it('should calculate using no includes and one excludes', async () => {
    await doTest({
      cwd: __dirname + '/data3',
      exclude: ['**/b']
    }, {
      files: [
        'data3/a/a/d',
        'data3/a/a/e',
        'data3/a/a/f',
        'data3/a/c/d',
        'data3/a/c/e',
        'data3/a/c/f',

        'data3/c/a/d',
        'data3/c/a/e',
        'data3/c/a/f',
        'data3/c/c/d',
        'data3/c/c/e',
        'data3/c/c/f',
      ],
      ...makeEmptyBlock(12)
    });
  });

  it('should calculate using multiple includes and slashy excludes', async () => {
    await doTest({
      cwd: __dirname + '/data3',
      include: ['a', './b', 'c/**'],
      exclude: ['**/b/']
    }, {
      files: [
        'data3/a/a/d',
        'data3/a/a/e',
        'data3/a/a/f',
        'data3/a/c/d',
        'data3/a/c/e',
        'data3/a/c/f',

        'data3/c/a/d',
        'data3/c/a/e',
        'data3/c/a/f',
        'data3/c/c/d',
        'data3/c/c/e',
        'data3/c/c/f',
      ],
      ...makeEmptyBlock(12)
    });
  });

  it('should calculate using multiple includes and globstar excludes', async () => {
    await doTest({
      cwd: __dirname + '/data3',
      include: ['a', './b', 'c/**'],
      exclude: ['**/b/**']
    }, {
      files: [
        'data3/a/a/d',
        'data3/a/a/e',
        'data3/a/a/f',
        'data3/a/c/d',
        'data3/a/c/e',
        'data3/a/c/f',

        'data3/c/a/d',
        'data3/c/a/e',
        'data3/c/a/f',
        'data3/c/c/d',
        'data3/c/c/e',
        'data3/c/c/f',
      ],
      ...makeEmptyBlock(12)
    });
  });

  it('should calculate using multiple includes and multiple excludes', async () => {
    await doTest({
      cwd: __dirname + '/data3',
      include: ['a', './b', 'c/**'],
      exclude: ['**/b/**', '**/c']
    }, {
      files: [
        "data3/a/a/d",
        "data3/a/a/e",
        "data3/a/a/f",
      ],
      ...makeEmptyBlock(3)
    });
  });

  it('should calculate using multiple includes and excludes for explicit files', async () => {
    await doTest({
      cwd: __dirname + '/data3/a',
      include: ['a', './b', 'c/**'],
      exclude: ['**/f']
    }, {
      files: [
        'data3/a/a/d',
        'data3/a/a/e',
        'data3/a/b/d',
        'data3/a/b/e',
        'data3/a/c/d',
        'data3/a/c/e',
      ],
      ...makeEmptyBlock(6)
    });
  });

  async function doTest(options: LocDirOptions, expectedResult: LocResult) {
    const actualResult = await new LocDir(options).loadInfo();
    // files are returned as full paths, and unsorted. Ensure that is fixed befre
    // testing.
    actualResult.files = actualResult.files.map(f => f.substring(__dirname.length + 1)).sort();
    expect(actualResult).toEqual(expectedResult);
  }

  function makeEmptyBlock(fileCount) {
    return {
      info: {
        code: 0,
        comment: 0,
        total: 0
      },
      languages: {
        '': {
          code: 0,
          comment: 0,
          sum: fileCount,
          total: 0,
        }
      }
    };
  }
});
