export interface StepFunctionEvent {
  refId: number;
  message: string;
  userId?: string;
  timeStamp: string;
}

export const handler = async (event: StepFunctionEvent): Promise<any> => {
  try {
    var { message, userId, timeStamp, refId } = event;
    console.log(message, userId, timeStamp, refId);
    if (refId > 0) {
      console.log("accessed data from DB based on id");
      //modify refId in step 2
      refId = 123456789;
    }

    return {
      step1: "success",
      refId,
      message,
      userId,
      timeStamp,
    };
  } catch (err: any) {
    console.error(err);
    return {
      step1: "failed",
      message: err.message,
    };
  }
};
