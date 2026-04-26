import { defineConfig, type RolldownPlugin, type RolldownOptions, type OutputOptions } from 'rolldown';
import { staticsDetector } from './plugin/static_detector';

export default defineConfig((_): RolldownOptions[] => {
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
      } as OutputOptions,
    },
    {
      plugins: [inlineCssPlugin()],
      input: 'src/script/injection_script.ts',
      output: {
        file: 'dist/injection_script.js',
        format: 'iife',
        ...outputOptions,
      } as OutputOptions,
    },
    {
      input: 'src/menu/menu.ts',
      output: {
        file: 'dist/menu/menu.js',
        format: 'esm',
        ...outputOptions,
      } as OutputOptions,
    },
    {
      input: 'src/script/credentials_retriever.ts',
      output: {
        file: 'dist/credentials_retriever.js',
        format: 'iife',
        ...outputOptions,
      } as OutputOptions,
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
        const inlineCss = data.toString().replace(/\n/g, '').replace(/\s+/g, ' ').trim();
        return `export default ${JSON.stringify(inlineCss)};`;
      },
    },
  };
}
