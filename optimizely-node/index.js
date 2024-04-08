/* eslint-disable no-console */
import * as dotenv from 'dotenv';
import express from 'express';
import optimizelySdk from '@optimizely/optimizely-sdk';
import readline from 'readline';
//
// const optimizelySdk = require('@optimizely/optimizely-sdk');
// const readline = require('readline');

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = express();

server.use(express.json());

const optimizely = optimizelySdk.createInstance({
  sdkKey: process.env.OPTIMIZELY_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// mock tracking a user event so you can see some experiment reports
const mockPurchase = (userContext) => {
  const userId = userContext.getUserId();
  return new Promise(function (resolve) {
    rl.question('Pretend that user ' + userId + ' made a purchase? y/n\n', function(answer) {
      // track a user event you defined in the Optimizely app
      if (answer === 'y') {
        userContext.trackEvent('purchase');
        console.log('Optimizely recorded a purchase in experiment results for user ' + userId);
      } else {
        console.log(`Optimizely didn't record a purchase in experiment results for user ${userId}`);
      }
      resolve(answer);
    });
  });
};

const runExperiment = async () => {
  let hasOnFlags = false;
  for (let i = 0; i < 4; i++) {
    // to get rapid demo results, generate random users. Each user always sees the same variation unless you reconfigure the flag rule.
    let userId = (Math.floor(Math.random() * (10000 - 1000) + 1000)).toString();

    // Create hardcoded user & bucket user into a flag variation
    let userContext = optimizely.createUserContext(userId);

    console.log('userContext', userContext);

    // 'product_sort' corresponds to a flag key in your Optimizely project
    let decision = userContext.decide('product_sort');
    let variationKey = decision.variationKey;

    // did decision fail with a critical error?
    if (variationKey === null) {
      console.log(' decision error: ', decision['reasons']);
    }
    // get a dynamic configuration variable
    // 'sort_method' corresponds to a variable key in your Optimizely project
    // let sortMethod = decision.variables['sort_method'];
    if (decision.enabled) {
      hasOnFlags = true;
    }

    // Mock what the users sees with print statements (in production, use flag variables to implement feature configuration)
    // always returns false until you enable a flag rule in your Optimizely project
    console.log(`\nFlag ${decision.enabled ? 'on' : 'off'}. User number ${userContext.getUserId()} saw flag variation: ${variationKey}`
      + ` as part of flag rule: ${decision.ruleKey}`);

    await mockPurchase(userContext);
  }

  if (!hasOnFlags) {
    console.log('\n\nFlag was off for everyone. Some reasons could include' +
      '\n1. Your sample size of visitors was too small. Rerun, or increase the iterations in the FOR loop' +
      '\n2. By default you have 2 keys for 2 project environments (dev/prod). Verify in Settings>Environments that you used' +
      ' the right key for the environment where your flag is toggled to ON.' +
      '\nCheck your key at https://app.optimizely.com/v2/projects/<your-project-id>/settings/implementation');
  } else {
    console.log('\n\nDone with your mocked A/B test. ' +
      `\nCheck out your report at https://app.optimizely.com/v2/projects/<your-project-id>/reports` +
      '\nBe sure to select the environment that corresponds to your SDK key');
  }
}

optimizely.onReady().then(({ success, reason }) => {
  if (!success) {
    console.log(`client initialization unsuccessful, reason: ${reason}`);
    return;
  }

  runExperiment();
});

async function startApp() {
  try {
    server.listen(PORT, () => { console.log(`Server works on port ${PORT}`); });
  } catch (error) {
    console.log('App start error', error);
  }
}

startApp();