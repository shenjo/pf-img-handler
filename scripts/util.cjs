const {resolve, join} = require('path');
const {stat, statfs, readdir} = require('fs/promises')

/**
 *
 * @param {string} dirname - 目录路径
 * @param {boolean} deep - 是否深度检测
 * @returns {Promise<string[]|*[]>}
 */
async function getNamesByDir(dirname, deep) {
  let result = []
  const [exist, isFile, isDir] = await isPathExisted(dirname)
  if (isDir) {
    result = await readdir(dirname);
    return result
  }
  return result
}

/**
 *
 * @param {string} path
 * @returns {Promise<[boolean,boolean,boolean]>}
 */
async function isPathExisted(path) {
  try {
    const info = await stat(path)
    return [true, info.isFile(), info.isDirectory()]
  } catch (e) {
    return [false, false, false]
  }
  
}

// getNamesByDir(resolve(__dirname, 'other'))


module.exports = {
  getNamesByDir,
  isPathExisted
}