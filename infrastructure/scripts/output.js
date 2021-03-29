const fs = require('fs');
const yaml = require('js-yaml');

function handler(data, serverless, options) {
  console.log('Received Stack Output', data)
  const yamlStr = yaml.dump(data);
  fs.writeFileSync(process.cwd() + '/.build/stack.yaml', yamlStr, { encoding: 'utf-8' });
}

module.exports = { handler }
