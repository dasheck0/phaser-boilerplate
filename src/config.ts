import { Dimension2 } from './types/math.type';

export interface Environment {
  dimension: Dimension2;
  debug: boolean;
  backgroundColor: string;
}

export default class Config {
  private static instance: Config;
  private environment: Environment;

  private constructor() {
    this.environment = {
      dimension: {
        width: 768,
        height: 1366,
      },
      debug: false,
      backgroundColor: '#88b1ea',
    };
  }

  public static getInstance(): Config {
    if (!this.instance) {
      this.instance = new Config();
    }

    return this.instance;
  }

  public get enviroment(): Environment {
    return this.environment;
  }
}
