import React from 'react';
import {
    createInstance,
    OptimizelyFeature,
    OptimizelyProvider,
    withOptimizely
} from '@optimizely/react-sdk';
import mockedDatafile from './mockedDatafile.json';

import './App.css';

class Button extends React.Component {
  onClick = () => {
    const { optimizely } = this.props
    console.log('optimizely', optimizely)
    // after we have confirmed purchase completed
    optimizely.track('purchase')
  }

  render() {
    return (
      <button onClick={this.onClick}>
        Purchase
      </button>
    )
  }
}

const WrappedPurchaseButton = withOptimizely(Button)


const optimizely = createInstance({
  datafile: mockedDatafile
    // sdkKey: '<Your_SDK_Key>'
});

function App() {
  const userId = 'user123';
  const user = optimizely.createUserContext(userId);
  const decision = user.decide('discount');
  // const variation = optimizely.activate('discount', userId);

  // if (variation === 'control') {
  //   console.log('variation control', variation);
  // } else if (variation === 'treatment') {
  //   console.log('variation treatment', variation);
  // } else {
  //   console.log('variation default', variation);
  // }

  const enabled = optimizely.isFeatureEnabled('discount', userId);
  const amount = optimizely.getFeatureVariableInteger('discount', 'amount', userId);

  console.log('isFeatureEnabled', enabled);
  console.log('getFeatureVariable', amount);

  return (
    <OptimizelyProvider
      optimizely={optimizely}
      user={{
          id: userId,
      }}
    >
      <div className="App">
        <header className="App-header">
          <OptimizelyFeature feature="discount">
            {(enabled, variables) => {
              console.log('variables!!!!!!!!!!!!!', variables)
              return `Got a discount of $${variables.amount || 'BlaBla'}`
            }}
          </OptimizelyFeature>
          <WrappedPurchaseButton />
        </header>
      </div>
    </OptimizelyProvider>
  );
}

export default App;
