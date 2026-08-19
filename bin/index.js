#!/usr/bin/env node
import('../src/index.mjs')
  .then(({ runCli }) => runCli())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
