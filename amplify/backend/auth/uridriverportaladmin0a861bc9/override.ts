import { AmplifyAuthCognitoStackTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyAuthCognitoStackTemplate) {

  resources.userPool.lambdaConfig = {
    ...resources.userPool.lambdaConfig,
    postConfirmation: "arn:aws:lambda:us-east-2:***REMOVED***:function:***REMOVED***",
    preSignUp:"arn:aws:lambda:us-east-2:***REMOVED***:function:***REMOVED***",
  };
}