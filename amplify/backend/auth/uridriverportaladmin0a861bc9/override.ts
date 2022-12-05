import { AmplifyAuthCognitoStackTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyAuthCognitoStackTemplate) {

  resources.userPool.lambdaConfig = {
    ...resources.userPool.lambdaConfig,
    postConfirmation: "arn:aws:lambda:us-east-2:***REMOVED***:function:uri-portal-cognito-sb-post-confirmation-admin-005-04",
    preSignUp: "arn:aws:lambda:us-east-2:***REMOVED***:function:uri-portal-cognito-sb-pre-signup-admin-005-03",
  };
}