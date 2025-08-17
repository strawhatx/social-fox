import { DefaultStrategy } from "./default.ts";
import { TwitterStrategy } from "./twitter.ts";

export interface ProcessOauthStrategy {
    handleRequest(req: Request, body: Record<string, any>): Promise<string>;
}

export class ProcessOauthStrategyFactory {
    static getStrategy(provider: string): ProcessOauthStrategy {
        switch (provider) {
            case "twitter_oauth1":
                return new TwitterStrategy();
            default:
                return new DefaultStrategy();
        }
    }
}