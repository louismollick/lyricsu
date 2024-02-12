import { type SSTConfig } from "sst";
import { NextjsSite, Function } from "sst/constructs";
import iamStack from "~/infra/iamStack";

export default {
  config(_input) {
    return {
      name: "lyricsu",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(iamStack).stack(function Site({ stack }) {
      const ichiranLambda = new Function(stack, "ichiran", {
        handler: "src/lambda/ichiran.handler",
        copyFiles: [{ from: "src/lambda/ichiran-cli" }],
        url: true,
      });

      const site = new NextjsSite(stack, "site", {
        timeout: "60 seconds",
        environment: {
          ICHIRAN_URL: ichiranLambda.url!,
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
