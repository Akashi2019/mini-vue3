const execa = require('execa');

// const targets = 'reactivity';
const targets = 'runtime-dom';


// 一次并行打包
async function build(target) {
  await execa('rollup', ['-cw', '--environment', `TARGET:${target}`], {
    stdio: 'inherit'
  });
}

build(targets);
