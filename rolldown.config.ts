import { defineConfig, RolldownPlugin } from 'rolldown';
import { staticsDetector } from './plugin/static_detector';

export default defineConfig(() => {
  const isWatch = process.argv.includes('--watch');
  const outputOptions = {
    sourcemap: isWatch ? 'inline' : false,
    minify: !isWatch,
  };

  return [
    {
      plugins: [
        staticsDetector({
          outDir: 'dist',
          sources: ['public', 'src'],
          excludes: ['*.ts', '*.js', 'script/styles.css'],
          isWatch,
        }),
      ],
      input: 'src/background.ts',
      output: {
        file: 'dist/background.js',
        format: 'esm',
        ...outputOptions,
      },
    },
    {
      plugins: [inlineCssPlugin()],
      input: 'src/script/injection_script.ts',
      output: {
        file: 'dist/injection_script.js',
        format: 'iife',
        ...outputOptions,
      },
    },
  ];
});

function inlineCssPlugin(): RolldownPlugin {
  return {
    name: 'inline-css',

    load: {
      filter: { id: /\.css\?inline$/ },
      async handler(id) {
        const actualId = id.replace(/\?inline$/, '');
        const data = await this.fs.readFile(actualId);
        // TODO: Optimize Inlining
        const inlineCss = data.toString().replace(/\n/g, '').replace(/\s+/g, ' ').trim();
        console.log('[LOAD] code', JSON.stringify(inlineCss));

        return `export default ${JSON.stringify(inlineCss)};`;
      },
    },
  };
}
