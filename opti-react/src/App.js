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
  return (
    <OptimizelyProvider
      optimizely={optimizely}
      user={{
          id: 'user123',
      }}
    >
      <div className="App">
        <header className="App-header">
          <OptimizelyFeature feature="discount">
            {(enabled, variables) => (
              `Got a discount of $${variables.amount || '100'}`
            )}
          </OptimizelyFeature>
          <WrappedPurchaseButton />
        </header>
      </div>
    </OptimizelyProvider>
  );
}

export default App;
