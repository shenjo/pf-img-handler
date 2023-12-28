const fs = require('fs');
const path = require('path');
const {ESLint} = require('eslint');

async function init() {
  const eslint = new ESLint();
  const configFile = path.resolve(__dirname, '../.eslintrc.cjs');
  try {
    const config = await eslint.calculateConfigForFile(configFile);
    const outputFilePath = path.resolve(__dirname, '../eslint-rules.json'); // 替换为你希望输出的文件路径
    fs.writeFileSync(outputFilePath, JSON.stringify(config.rules, null, 2));
    
    
  } catch (e) {
    // console.log('shenjo error', e);
  }
  
}
init();