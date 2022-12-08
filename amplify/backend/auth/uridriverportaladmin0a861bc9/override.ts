import { AmplifyAuthCognitoStackTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyAuthCognitoStackTemplate) {

  resources.userPool.lambdaConfig = {
    ...resources.userPool.lambdaConfig,
    postConfirmation: "arn:aws:lambda:us-east-2:***REMOVED***:function:***REMOVED***",
    preSignUp: "arn:aws:lambda:us-east-2:***REMOVED***:function:***REMOVED***"
  };

  resources.addCfnResource(
    {
      type: "AWS::Cognito::UserPoolIdentityProvider",
      properties: {
        AttributeMapping: {
          username: "sub",
          email: "email",
          email_verified: "email_verified",
          'custom:first_name': "given_name",
          'custom:last_name': "family_name",
        },
        ProviderDetails: {
          client_id: "***REMOVED***-jvk3ld5ca3ijm2q8v09i01eu062hifea.apps.googleusercontent.com",
          client_secret: "***REMOVED***",
          authorize_scopes: "openid email profile",
        },
        ProviderName: "Google",
        ProviderType: "Google",
        UserPoolId: {
          Ref: "UserPool",
        },
      },
    },
    "google-social-provider"
  );
}