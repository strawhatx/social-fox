declare module '@clerk/clerk-sdk-node' {
  export function createClerkClient(config: { secretKey: string }): { users: any };
}


