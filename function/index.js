const AWS = require('aws-sdk')
// Create client outside of handler to reuse
const lambda = new AWS.Lambda()

// SnappyFlow Tracing config
const sf = require('sf-apm-lib');

let projectName = process.env.PROJECT_NAME;
let appName = process.env.APP_NAME;
let profileKey = process.env.SF_PROFILE_KEY;
var sfObj = new sf.Snappyflow();
sfObj.init(profileKey, projectName, appName);
var apm;
try {
  var sfTraceConfig = sfObj.getTraceConfig();
  //console.log('## Trace Config ' + serialize(sfTraceConfig))
  apm = require('elastic-apm-node').start({
    serviceName: 'nodejs-lambda',
    serverUrl: sfTraceConfig['SFTRACE_SERVER_URL'],
    globalLabels: sfTraceConfig['SFTRACE_GLOBAL_LABELS'],
    verifyServerCert: sfTraceConfig['SFTRACE_VERIFY_SERVER_CERT'] === undefined ? false : sfTraceConfig['SFTRACE_VERIFY_SERVER_CERT'],
    active: sfTraceConfig['SFTRACE_SERVER_URL'] === undefined ? false : true,
    stackTraceLimit: sfTraceConfig['SFTRACE_STACK_TRACE_LIMIT'],
    captureSpanStackTraces: sfTraceConfig['SFTRACE_CAPTURE_SPAN_STACK_TRACES'],
    captureBody: 'all'
  })
} catch (e) {
  console.log(e)
}


// Handler
exports.handler = async function(event, context) {
  var trans = apm.startTransaction('lambda handler', 'lambda');
  var span = apm.startSpan('parse json');

  try {
    JSON.parse('{"app": "test"}')
  } catch (e) {
    apm.captureError(e);
  }

  // when we've processed the json, stop the custom span
  if (span) span.end()

  console.log('## ENVIRONMENT VARIABLES: ' + serialize(process.env))
  console.log('## CONTEXT: ' + serialize(context))
  console.log('## EVENT: ' + serialize(event))
  try {
    let accountSettings = await getAccountSettings()
    trans.result = 'success';
    let resp = formatResponse(serialize(accountSettings.AccountUsage))
    // end the transaction
    trans.end();
    return resp
  } catch(error) {
    apm.captureError(error);
    trans.result = error ? 'error' : 'success';
    let resp = formatError(error)
    // end the transaction
    trans.end();
    return resp
  }
}

var formatResponse = function(body){
  var response = {
    "statusCode": 200,
    "headers": {
      "Content-Type": "application/json"
    },
    "isBase64Encoded": false,
    "multiValueHeaders": { 
      "X-Custom-Header": ["My value", "My other value"],
    },
    "body": body
  }
  return response
}

var formatError = function(error){
  var response = {
    "statusCode": error.statusCode,
    "headers": {
      "Content-Type": "text/plain",
      "x-amzn-ErrorType": error.code
    },
    "isBase64Encoded": false,
    "body": error.code + ": " + error.message
  }
  return response
}
// Use SDK client
var getAccountSettings = function(){
  return lambda.getAccountSettings().promise()
}

var serialize = function(object) {
  return JSON.stringify(object, null, 2)
}