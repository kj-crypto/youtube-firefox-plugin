import { DefaultLogger, ILogger } from './logger';

/**
 * Create exclude-pattern for `find -regex <exclude-pattern>`
 *
 * @example
 * ```ts
 * const excludePattern = new ExcludePattern([".html", "*.json", "ts"]);
 * console.log(excludePattern.getPattern()); // '.*\.\(html\|json\|ts\)$'
 * console.log(new ExcludePattern().getPattern()); // '.*\.\(ts\|js\)$'
 * ```
 */
export class ExcludePattern {
  private pattern: string;
  private readonly defaultPattern = String.raw`'.*\.\(ts\|js\)$'`;
  private logger: ILogger;
  constructor(extensions?: string[], options?: ExcludePatternOptions) {
    if (options?.logger) {
      this.logger = options.logger;
    } else {
      this.logger = new DefaultLogger();
    }
    this.pattern = this.parseExtensions(extensions);
  }
  setLogger(logger: ILogger) {
    this.logger = logger;
  }

  private parseExtensions(extensions?: string[]): string {
    if (!extensions || extensions.length === 0) {
      return this.defaultPattern;
    }
    let result = String.raw`'.*\.\(`;
    for (const ext of extensions) {
      const extName = /\.?\*?(\w+)$/.exec(ext)?.[1];
      if (extName) {
        result += extName + String.raw`\|`;
      } else {
        this.logger.error(`Cannot handle extension: ${ext}`);
      }
    }
    result = result.slice(0, -2) + String.raw`\)$'`;
    return result;
  }

  getPattern(): string {
    return this.pattern;
  }
}

type ExcludePatternOptions = {
  logger?: ILogger;
};
