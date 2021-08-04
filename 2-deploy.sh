#!/bin/bash
set -eo pipefail
cd function && npm install && cd ../
ARTIFACT_BUCKET=$(cat bucket-name.txt)
aws cloudformation package --template-file template.yml --s3-bucket $ARTIFACT_BUCKET --output-template-file out.yml
aws cloudformation deploy --template-file out.yml --stack-name aws-lambda-nodejs-tracing-sample --capabilities CAPABILITY_NAMED_IAM
