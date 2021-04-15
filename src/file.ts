/**
 * detect file info
 */

import * as fs from 'fs-extra';
import * as Path from 'path';
// @ts-ignore
import slash from 'slash2';

import { Languages } from './languages';

const SIMPLE_LINE_REG = /\s{1,}\/\/\s{1,}/g;
const ONLY_COMMENT_SIMPLE_LINE_REG = /\/\//g;
const ONE_LINE_REG = /$(\s{1,})\*.*/g;

export interface LineInfo {
  total: number;
  code: number;
  comment: number;
}

export interface FileInfo {
  name: string;
  languages: string;
  size: number;
  lines: LineInfo;
}

const DefaultLine: LineInfo = {
  total: 0,
  code: 0,
  comment: 0,
};

const DefaultFileInfo: FileInfo = {
  name: '',
  languages: '',
  size: 0,
  lines: DefaultLine,
};

/**
 * collect language info of a file
 *
 * @export
 * @class LocFile
 */
export class LocFile {
  private path: string;
  private rawPath: string;

  private language = new Languages();

  /**
   * Creates an instance of LocFile.
   * @param {string} filePath
   * @memberof LocFile
   */
  constructor(rawPath: string) {
    this.path = slash(rawPath);
    this.rawPath = rawPath;
  }

  /**
   * get file type through a path
   *
   * @param {string} path
   * @returns {string}
   * @memberof LocFile
   */
  private getType(path: string): string {
    const fileExtension = `.${path.split('.').pop()}`;
    return this.language.extensionMap[fileExtension] || '';
  }

  private filterData = (data: string): LineInfo => {
    const lines = data.split(/\n/);
    let commentLength = 0;
    let codeLength = lines.length;
    const total = codeLength;

    lines.forEach((line) => {
      // 多行注释
      if (/(\*)|(\*\/)/g.test(line) || ONE_LINE_REG.test(line)) {
        commentLength += 1;
        codeLength -= 1;
      }
      // 单行注释
      if (SIMPLE_LINE_REG.test(line)) {
        commentLength += 1;
        // 只有注释
        if (ONLY_COMMENT_SIMPLE_LINE_REG.test(line)) {
          codeLength -= 1;
        }
      }
      if (!line) {
        codeLength -= 1;
      }
    });

    return {
      ...DefaultLine,
      total,
      code: codeLength,
      comment: commentLength,
    };
  };

  /**
   * Get file info when LocFile init
   *
   * @returns {FileInfo}
   * @memberof LocFile
   */
  public async getFileInfo(data?: string): Promise<FileInfo> {
    if (!(await fs.pathExists(this.rawPath))) {
      throw new Error(`Error: file ${this.rawPath} does not exist.`);
    }

    let newData = data;
    const info: FileInfo = Object.assign({}, DefaultFileInfo);
    const name = this.path.split(Path.sep).pop() || '';
    try {
      const stat = await fs.stat(this.path);
      if (!stat.isFile()) {
        return info;
      }
      newData = data || await fs.readFile(this.path, 'utf-8');
      info.name = name;
      info.size = (stat && stat.size) || 0;
      info.languages = this.getType(this.path);
      if (!info.languages) {
        return info;
      }
      if (newData) {
        info.lines = this.filterData(newData);
      }
    } catch (err) {
      throw new Error('read file failed.');
    }
    return info;
  }

  /**
   * return file path
   *
   * @returns {string}
   * @memberof LocFile
   */
  public getPath(): string {
    return this.path;
  }

  public getFileInfoByContent(name: string, data: string): FileInfo {
    const info: FileInfo = Object.assign({}, DefaultFileInfo);
    info.name = name;
    info.languages = this.getType(name);
    info.lines = this.filterData(data);
    return info;
  }
}
