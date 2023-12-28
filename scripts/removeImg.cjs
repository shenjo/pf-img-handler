const path = require('path');
const fs = require('fs/promises')
const {getNamesByDir, isPathExisted} = require("./util.cjs");
const resultJSON = require('../handled.json')

const imagesDir = path.join(__dirname, '../public/females'); // images 目录的路径
const replaceStr = path.join(__dirname, '../public')

async function run() {
  const dirs = await getNamesByDir(imagesDir)
  
  const p = dirs.map(handleEachDir)
  
  await Promise.all(p);
  // 输出所有子目录
  console.log('处理完成:');
}

async function handleEachDir(dir) {
  const eachImageDir = path.resolve(imagesDir, dir);
  const res1 = await isPathExisted(eachImageDir)
  if (!res1[2]) {
    return true;
  }
  
  const find = resultJSON.find(item => item.dirName === dir + '');
  if (!find) {
    return true;
  }
  const files = (await getNamesByDir(eachImageDir)).filter(item=> !item.includes('-1024'));
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const filePath = path.join(eachImageDir, file);
    const [existed, isFile, isDir] = await isPathExisted(filePath)
    if (isFile) {
      const srcImg = filePath.replace(replaceStr, '');
      const targetImg = filePath.replace('.jpg', '-1024.jpg')
      const obj = find.images.find(some => some.srcImg === srcImg);
      if (obj && obj.delete) {
        try {
          
          fs.unlink(filePath)
          fs.unlink(targetImg)
          console.log('shenjo 删除成功', filePath)
        } catch (e) {
          //
          // console.log('shenjo 删除失败', filePath)
        }
      }
      
    }
  }
  return true;
}


run();