#!/bin/bash
set -eo pipefail
APIID=$(aws cloudformation describe-stack-resource --stack-name aws-lambda-nodejs-tracing-sample --logical-resource-id api --query 'StackResourceDetail.PhysicalResourceId' --output text)
REGION=$(aws configure get region)

echo "https://$APIID.execute-api.$REGION.amazonaws.com/api/ -v"
while true; do
curl https://$APIID.execute-api.$REGION.amazonaws.com/api/ -v
sleep 2
done
