import { SQSEvent, SQSHandler } from "aws-lambda";
import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { StartExecutionCommand, SFNClient } from "@aws-sdk/client-sfn";

const sqsClient = new SQSClient({});
const sfnClient = new SFNClient({});

const stateMachineArn =
  "arn:aws:states:us-east-1:432599188850:stateMachine:EmiStateMachineB2580B20-7F2aMgfpfU0e";

export const handler: SQSHandler = async (event: SQSEvent): Promise<any> => {
  console.log(JSON.stringify(event, null, 2));
  if (!event.Records || !Array.isArray(event.Records)) {
    const errorMsg = "Event does not contain a valid Records Array";
    console.error(errorMsg);
    return {
      step1: "error",
      message: errorMsg,
    };
  }

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      console.log(body);

      //prep command to start state machine step 1
      const startExcecutionCommand = new StartExecutionCommand({
        stateMachineArn,
        input: JSON.stringify(body),
      });

      // send command start the state machine
      await sfnClient.send(startExcecutionCommand);

      // prep command to delete message from queue
      const deleteMessage = new DeleteMessageCommand({
        QueueUrl: process.env.QUEUE_URL!,
        ReceiptHandle: record.receiptHandle,
      });

      //send delete command
      await sqsClient.send(deleteMessage);

      const ret = {
        step1: "success",
      };

      console.log(ret);

      return ret;
    } catch (err: any) {
      console.error(err);
      return {
        step1: err.message,
      };
    }
  }
};
