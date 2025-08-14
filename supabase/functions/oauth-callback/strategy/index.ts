import { DefaultStrategy } from "./default.ts";
import { TwitterStrategy } from "./twitter.ts";

export interface OAuthCallbackStrategy {
    handleRequest(req: Request): Promise<Response>;
}

export class OAuthCallbackStrategyFactory {
    static getStrategy(provider: string): OAuthCallbackStrategy {
        switch (provider) {
            case "twitter":
                return new TwitterStrategy();
            default:
                return new DefaultStrategy();
        }
    }
}