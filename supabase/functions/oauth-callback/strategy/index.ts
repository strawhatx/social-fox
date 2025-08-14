import { DefaultStrategy } from "./default.ts";
import { TwitterStrategy } from "./twitter.ts";

export interface OAuthCallbackStrategy {
    handleRequest(req: Request, body: Record<string, any>): Promise<string>;
}

export class OAuthCallbackStrategyFactory {
    static getStrategy(provider: string): OAuthCallbackStrategy {
        switch (provider) {
            case "twitter":
            case "twitter_oauth1":
                return new TwitterStrategy();
            default:
                return new DefaultStrategy();
        }
    }
}