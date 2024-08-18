export interface StepFunctionEvent {
  message: string;
  userId?: string;
  timeStamp: string;
}

export const handler = async (event: StepFunctionEvent): Promise<any> => {
  try {
    const { message, userId, timeStamp } = event;
    console.log(message, userId, timeStamp);
    return {
      step1: "success",
      refId: 1235,
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
