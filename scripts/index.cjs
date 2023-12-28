const path = require('path');
const fs = require('fs/promises')
const {getNamesByDir, isPathExisted} = require("./util.cjs");

const imagesDir = path.join(__dirname, '../public/male'); // images 目录的路径
const replaceStr = path.join(__dirname, '../public')
const outputFile = path.join(__dirname, '../src/data.json');
const info = [];
// 读取 images 目录下的所有文件和子目录
// fs.readdir(imagesDir, async (err, files) => {
//   if (err) {
//     console.error('无法读取 images 目录', err);
//     return;
//   }
//
//
//   // 过滤出子目录（排除文件）
//   const dirs = await getNamesByDir()
//
//   const p = dirs.map(handleEachDir)
//
//   await Promise.all(p);
//
//   // 输出所有子目录
//   console.log('子目录列表:', info);
// });

async function run() {
  await fs.writeFile(outputFile, JSON.stringify([], null, 2))
  const dirs = await getNamesByDir(imagesDir)
  
  const p = dirs.map(handleEachDir)
  
  await Promise.all(p);
  fs.writeFile(outputFile, JSON.stringify(info, null, 2))
  
  // 输出所有子目录
  console.log('子目录列表:', info);
}

async function handleEachDir(dir) {
  const eachImageDir = path.resolve(imagesDir, dir);
  const res1 = await isPathExisted(eachImageDir)
  if (!res1[2]) {
    return true;
  }
  let eachObj = {dirName: dir, images: []}
  info.push(eachObj)
  
  const files = await getNamesByDir(eachImageDir);
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const filePath = path.join(eachImageDir, file);
    const [existed, isFile, isDir] = await isPathExisted(filePath)
    if (isFile && !filePath.includes('1024') && !filePath.includes('DS_Store')) {
      const srcImg = filePath.replace(replaceStr, '');
      const targetImg = path.join(eachImageDir, `1024/${file}`).replace(replaceStr, '')
      const maskImg = path.join(eachImageDir, `1024/mask/${file}`).replace(replaceStr, '')
      // const maskImg =
      // const targetMaleImg = path.join(eachImageDir, `1024/male/${file}`).replace(replaceStr,'')
      eachObj.images.push({srcImg, targetImg, maskImg})
      
    }
  }
  return true;
}


run();