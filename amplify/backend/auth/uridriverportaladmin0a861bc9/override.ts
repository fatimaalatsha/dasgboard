import { AmplifyAuthCognitoStackTemplate } from '@aws-amplify/cli-extensibility-helper';

export function override(resources: AmplifyAuthCognitoStackTemplate) {
  const firstNameAttribute = {
    attributeDataType: 'String',
    developerOnlyAttribute: false,
    mutable: true,
    name: 'first_name',
    required: false,
    stringAttributeConstraints: {
      maxLength: '256',
      minLength: '1',
    },
  }

  const lastNameAttribute = {
    attributeDataType: 'String',
    developerOnlyAttribute: false,
    mutable: true,
    name: 'last_name',
    required: false,
    stringAttributeConstraints: {
      maxLength: '256',
      minLength: '1',
    },
  }

  resources.userPool.lambdaConfig = {
    ...resources.userPool.lambdaConfig,
     postConfirmation: "arn:aws:lambda:us-east-2:***REMOVED***:function:uri-portal-cognito-dev-post-confirmation-admin-005-04",
     preSignUp:"arn:aws:lambda:us-east-2:***REMOVED***:function:uri-portal-cognito-dev-pre-signup-admin-005-03" 
  };

  resources.userPool.schema = [
    ...(resources.userPool.schema as any[]), // Carry over existing attributes (example: email)
    firstNameAttribute,
    lastNameAttribute
  ]
}
