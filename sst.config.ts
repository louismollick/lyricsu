import { type SSTConfig } from "sst";
import { NextjsSite, Function } from "sst/constructs";
import githubActionsStack from "~/infra/githubActionsStack";

export default {
  config(_input) {
    return {
      name: "lyricsu",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(githubActionsStack).stack(function Site({ stack }) {
      const ichiranLambda = new Function(stack, "ichiran", {
        handler: "src/lambda/ichiran.handler",
        copyFiles: [{ from: "src/lambda/ichiran-cli" }],
        url: true,
      });

      const site = new NextjsSite(stack, "site", {
        timeout: "60 seconds",
        environment: {
          ICHIRAN_URL: ichiranLambda.url!,
          DATABASE_URL: process.env.DATABASE_URL!,
          SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID!,
          SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET!,
          SPOTIFY_SP_DC: process.env.SPOTIFY_SP_DC!,
          ICHIRAN_CONNECTION: process.env.ICHIRAN_CONNECTION!,
        },
        bind: [ichiranLambda],
      });

      stack.addOutputs({
        SiteUrl: site.url,
        Function: ichiranLambda.url,
      });
    });
  },
} satisfies SSTConfig;
