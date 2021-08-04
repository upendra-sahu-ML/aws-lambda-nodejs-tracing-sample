# API Gateway proxy integration with Node.js

This sample application is a Lambda function that processes events from an API Gateway REST API. The API provides a public endpoint that you can access with a web browser or other HTTP client. When you send a request to the endpoint, the API serializes the request and sends it to the function. The function calls the Lambda API to get utilization data and returns it to the API in the required format.

:warning: The application creates a public API endpoint that is accessible over the internet. When you're done testing, run the cleanup script to delete it.

![Architecture](/images/sample-nodejs-apig.png)

The project source includes function code and supporting resources:

- `function` - A Node.js function.
- `template.yml` - An AWS CloudFormation template that creates an application.
- `1-create-bucket.sh`, `2-deploy.sh`, etc. - Shell scripts that use the AWS CLI to deploy and manage the application.

Use the following instructions to deploy the sample application.

# Requirements
- [Node.js 10 with npm](https://nodejs.org/en/download/releases/)
- The Bash shell. For Linux and macOS, this is included by default. In Windows 10, you can install the [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10) to get a Windows-integrated version of Ubuntu and Bash.
- [The AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) v1.17 or newer.

If you use the AWS CLI v2, add the following to your [configuration file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) (`~/.aws/config`):

```
cli_binary_format=raw-in-base64-out
```

This setting enables the AWS CLI v2 to load JSON events from a file, matching the v1 behavior.

# Setup
Download or clone this repository.

    $ git clone https://github.com/upendrasahu/aws-lambda-developer-guide.git
    $ cd aws-lambda-nodejs-tracing-sample

To create a new bucket for deployment artifacts, run `1-create-bucket.sh`.

    aws-lambda-nodejs-tracing-sample$ ./1-create-bucket.sh
    make_bucket: lambda-artifacts-a5e491dbb5b22e0d

# Deploy
To deploy the application, run `2-deploy.sh`.

    aws-lambda-nodejs-tracing-sample$ ./2-deploy.sh
    added 16 packages from 18 contributors and audited 18 packages in 0.926s
    added 17 packages from 19 contributors and audited 19 packages in 0.916s
    Uploading to e678bc216e6a0d510d661ca9ae2fd941  2737254 / 2737254.0  (100.00%)
    Successfully packaged artifacts and wrote output template to file out.yml.
    Waiting for changeset to be created..
    Waiting for stack create/update to complete
    Successfully created/updated stack - aws-lambda-nodejs-tracing-sample

This script uses AWS CloudFormation to deploy the Lambda functions and an IAM role. If the AWS CloudFormation stack that contains the resources already exists, the script updates it with any changes to the template or function code.

# Configure ENV variables
Configure These env variable in AWS lambda
- PROJECT_NAME: Name of the project in SnappyFlow
- APP_NAME: Name of the application in SnappyFlow
- SF_PROFILE_KEY: Key copied from SnappyFlow Profile

# Test
To invoke the function directly with a test event (`event.json`), run `3-invoke.sh`.

    aws-lambda-nodejs-tracing-sample$ ./3-invoke.sh
    {
        "StatusCode": 200,
        "ExecutedVersion": "$LATEST"
    }

Let the script invoke the function a few times and then press `CRTL+C` to exit.

To invoke the function with the REST API, run the `4-get.sh` script. This script uses cURL to send a GET request to the API endpoint.

    aws-lambda-nodejs-tracing-sample$ ./4-get.sh
    > GET /api/ HTTP/1.1
    > Host: mf2fxmplbj.execute-api.us-east-2.amazonaws.com
    > Accept: */*
    >
    < HTTP/1.1 200 OK
    < Content-Type: application/json
    < Content-Length: 55
    < Connection: keep-alive
    < x-amzn-RequestId: cb863771-xmpl-47cb-869e-3433209223a8
    < X-Custom-Header: My value
    < X-Custom-Header: My other value
    < X-Amzn-Trace-Id: Root=1-5e67ea83-4826xmpl9be7bf422bf70049
    ...
    {
      "TotalCodeSize": 184440616,
      "FunctionCount": 39
    }


Finally, view the application in the Lambda console.

*To view the application*
1. Open the [applications page](https://console.aws.amazon.com/lambda/home#/applications) in the Lambda console.
2. Choose **aws-lambda-nodejs-tracing-sample**.

# Cleanup
To delete the application, run `5-cleanup.sh`.

    aws-lambda-nodejs-tracing-sample$ ./5-cleanup.sh
