import { Plugin } from 'vite';
import { ChildProcess, exec, spawn } from 'child_process';
import path from 'path';
import { Logger } from './logger';
import { ExcludePattern } from './exclude';

type Signal = 'SIGINT' | 'SIGTERM' | 'SIGKILL' | 'exit';

export type StaticDetectorOptions = {
  sourceDirs?: string[];
  excludeExtensions?: string[];
};

export function staticsDetector(options: StaticDetectorOptions = {}): Plugin {
  let isWatchMode = false;
  let outDir = 'dist';
  const watchers = new Set<ChildProcess>();
  const logger = new Logger('[static-bundler]');
  const fullPath = path.join(import.meta.dirname!, 'copy_statics.sh');
  const excludeExtensions = new ExcludePattern(options.excludeExtensions || [], { logger });
  const buildCmd = `source ${fullPath} && set_exclude "${excludeExtensions.getPattern()}" && copy_statics`;
  const watchCmd = `source ${fullPath} && set_exclude "${excludeExtensions.getPattern()}" && watch_files`;
  const sources = options.sourceDirs?.length ? options.sourceDirs : ['public'];

  ['SIGINT', 'SIGTERM', 'exit'].forEach((signal) => {
    process.on(signal, () => {
      if (isWatchMode) killWatchers('SIGTERM');
      process.exit(0);
    });
  });

  const spawnWatcher = (source: string) => {
    const child = spawn('bash', ['-c', `${watchCmd} ${source} ${outDir}`], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    });

    watchers.add(child);

    child.stdout?.on('data', (data) => {
      logger.info(data.toString());
    });

    child.stderr?.on('data', (data) => {
      logger.error(data.toString());
    });

    child.on('error', (error) => {
      logger.error(`Failed to start process: ${error}`);
    });
  };

  const killWatchers = (signal: Signal) => {
    if (watchers.size > 0) {
      for (const child of watchers) {
        if (child.pid) {
          try {
            process.kill(-child.pid, signal);
            logger.info(`Shutdown process ${child.pid}`);
          } catch (e) {
            logger.error(`Failed to kill process: ${e}`);
          }
        }
      }
      watchers.clear();
    }
  };

  return {
    name: 'statics-bundler',
    configResolved(config) {
      isWatchMode = config.command === 'build' && !!config.build.watch;
      outDir = config.build.outDir;
    },

    async buildStart() {
      if (!isWatchMode) {
        for (const source of sources) {
          exec(`bash -c '${buildCmd} ${source} ${outDir}'`, (error, stdout, stderr) => {
            if (error) {
              logger.error(`Error: ${error}`);
              return;
            }
            logger.info(stdout);
            logger.info(stderr);
          });
        }
      } else {
        killWatchers('SIGTERM');
        for (const source of sources) {
          spawnWatcher(source);
          logger.info(`Started watcher for '${source}'`);
        }
      }
    },
  };
}
