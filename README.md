# CDK Project on setting up state machine and step functions

This project is to set up trigger a work flow from a message that arrives in a SQS.  the SQS will trigger a lambda, processing the event.Records stripping the body out and calling the ARN of the state machine to begin work flow.  In this case its a twp step lambda process.

![Screenshot 2024-08-18 at 18 24 12](https://github.com/user-attachments/assets/953221cc-ca60-46e9-9f08-6b818bab6114)

# below is the state machine in AWS console using the Graph View

<img width="1040" alt="Screenshot 2024-08-18 at 18 25 35" src="https://github.com/user-attachments/assets/4a677ae7-f0c9-430f-a5cc-e6f1d5877843">

# JSON structure of the state machine

```json
{
  "StartAt": "invokeStep1Lambda",
  "States": {
    "invokeStep1Lambda": {
      "Next": "invokeStep2Lambda",
      "Retry": [
        {
          "ErrorEquals": [
            "Lambda.ClientExecutionTimeoutException",
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException"
          ],
          "IntervalSeconds": 2,
          "MaxAttempts": 6,
          "BackoffRate": 2
        }
      ],
      "Type": "Task",
      "Comment": "step 1",
      "OutputPath": "$.Payload",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": {
        "FunctionName": "arn:aws:lambda:us-east-1:432599188850:function:emiStep1Lambda",
        "Payload.$": "$"
      }
    },
    "invokeStep2Lambda": {
      "End": true,
      "Retry": [
        {
          "ErrorEquals": [
            "Lambda.ClientExecutionTimeoutException",
            "Lambda.ServiceException",
            "Lambda.AWSLambdaException",
            "Lambda.SdkClientException"
          ],
          "IntervalSeconds": 2,
          "MaxAttempts": 6,
          "BackoffRate": 2
        }
      ],
      "Type": "Task",
      "Comment": "step 2",
      "OutputPath": "$.Payload",
      "Resource": "arn:aws:states:::lambda:invoke",
      "Parameters": {
        "FunctionName": "arn:aws:lambda:us-east-1:432599188850:function:emiStep2Lambda",
        "Payload.$": "$"
      }
    }
  },
  "TimeoutSeconds": 300
}
```

# all the steps in the state machine

<img width="1029" alt="Screenshot 2024-08-18 at 18 26 40" src="https://github.com/user-attachments/assets/06da5ce5-ea3a-4c55-b3ba-b285818c7c06">


## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
