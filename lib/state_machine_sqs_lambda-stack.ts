import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "path";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class StateMachineSqsLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //state machine queue
    const queue = new sqs.Queue(this, "StateMachineSqsLambdaQueue", {
      visibilityTimeout: cdk.Duration.seconds(300),
    });

    //create lambda to process queue message
    const processQueLambda = new NodejsFunction(
      this,
      "processSQS-startStateMachine-lambda",
      {
        functionName: "processSQS-startStateMachine-lambda",
        runtime: Runtime.NODEJS_20_X,
        handler: "handler",
        entry: join(
          __dirname,
          "..",
          "src",
          "lambdas",
          "LambdaProcessSQS",
          "handler.ts"
        ),
        environment: {
          QUEUE_URL: queue.queueUrl,
        },
      }
    );

    //set lambda policy
    processQueLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["*"],
        resources: ["*"],
      })
    );

    //attach sqs to sqs message
    processQueLambda.addEventSource(new SqsEventSource(queue));

    //grant lambda to consume the queue
    queue.grantConsumeMessages(processQueLambda);

    //create lambda step1
    const step1Lambda = new NodejsFunction(this, "emiStep1Lambda", {
      functionName: "emiStep1Lambda",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: join(
        __dirname,
        "..",
        "src",
        "lambdas",
        "LambdaStep1",
        "handler.ts"
      ),
    });

    step1Lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ["*"],
        actions: ["*"],
      })
    );

    //create first step
    const step1Task = new tasks.LambdaInvoke(this, "invokeStep1Lambda", {
      stateName: "invokeStep1Lambda",
      comment: "step 1",
      lambdaFunction: step1Lambda,
      outputPath: "$.Payload",
    });

    const step2Lambda = new NodejsFunction(this, "emiStep2Lambda", {
      functionName: "emiStep2Lambda",
      runtime: Runtime.NODEJS_20_X,
      handler: "handler",
      entry: join(
        __dirname,
        "..",
        "src",
        "lambdas",
        "LambdaStep2",
        "handler.ts"
      ),
    });

    step2Lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        resources: ["*"],
        actions: ["*"],
      })
    );

    const step2Task = new tasks.LambdaInvoke(this, "invokeStep2Lambda", {
      stateName: "invokeStep2Lambda",
      comment: "step 2",
      lambdaFunction: step2Lambda,
      outputPath: "$.Payload",
      //inputPath: "$",
    });

    //define state machine
    const definition = step1Task.next(step2Task);

    const stateMachine = new sfn.StateMachine(this, "EmiStateMachine", {
      definition,
      timeout: cdk.Duration.minutes(5),
    });
  }
}
