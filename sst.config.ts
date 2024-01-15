import { Architecture } from "aws-cdk-lib/aws-lambda";
import { type SSTConfig } from "sst";
import { NextjsSite } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "lyricsu",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Site({ stack }) {
      const site = new NextjsSite(stack, "site", {
        timeout: "60 seconds",
        cdk: {
          server: {
            architecture: Architecture.X86_64, // so that ichiran-cli works
          },
        },
      });

      stack.addOutputs({
        SiteUrl: site.url,
      });
    });
  },
} satisfies SSTConfig;
