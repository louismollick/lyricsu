import { type SSTConfig } from "sst";
import { NextjsSite, Function } from "sst/constructs";
import { env } from "~/env.mjs";

export default {
  config(_input) {
    return {
      name: "lyricsu",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const ichiranLambda = new Function(stack, "MyFunction", {
        handler: "src/lambda/ichiran.handler",
        copyFiles: [{ from: "src/lambda/ichiran-cli" }],
        url: true,
      });

      const site = new NextjsSite(stack, "site", {
        timeout: "60 seconds",
        environment: {
          ...env,
          ICHIRAN_URL: ichiranLambda.url!,
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
