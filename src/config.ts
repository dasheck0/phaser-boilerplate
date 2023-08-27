import { Dimension2 } from './types/math.type';
import { Scale } from './ui/text.prefab';

export interface Environment {
  dimension: Dimension2;
  debug: boolean;
  backgroundColor: string;
  typography: {
    fontFamily: string;
    baseFontSize: number;
    scale: Scale;
  };
}

export class Config {
  private static instance: Config;
  private environment: Environment;

  private constructor() {
    this.environment = {
      dimension: {
        width: 768,
        height: 1366,
      },
      debug: true,
      backgroundColor: '#88b1ea',
      typography: {
        fontFamily: 'Arial',
        baseFontSize: 16,
        scale: 'major_third',
      },
    };
  }

  public static getInstance(): Config {
    if (!this.instance) {
      this.instance = new Config();
    }

    return this.instance;
  }

  public set enviroment(environment: Environment) {
    this.environment = environment;
  }

  public get enviroment(): Environment {
    return this.environment;
  }
}
