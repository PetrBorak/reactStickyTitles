import PropTypes from 'prop-types';
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { createStore } from 'redux';
import { mockStore, toMockStore } from '../../mocks/mocked-store';

let mockedStoreToPass = null;
let storeToPass = null;

export function setupMockedStore() {
  mockedStoreToPass = mockStore(toMockStore);
  return mockedStoreToPass;
}

export function setupStore(toStore = null, reducer = null, enhancer = null) {
  const toPassToStore = toStore ? Object.assign({}, toMockStore, toStore) : toMockStore;
  storeToPass = createStore(reducer ? reducer : dumbReducer,
    toPassToStore,
    enhancer ? enhancer : undefined);
  return storeToPass;
}

export function setupComponent(Component, props, children = null) {

  const storeToPassInner = setupMockedStore();

  const component = children
    ? <Component {...props}>{children}</Component>
    : <Component {...props} />;

  const wrapper = mount(
    <Provider store={storeToPassInner}>{component}</Provider>
  );

  const store = wrapper.get(0).props.store;
  const connectWrapper = wrapper.find('Connect');
  return {
    props, wrapper, store, connectWrapper
  };
}

export function setupConnectInParalelWithStore(Component,
  props,
  children = null,
  mockedStore = true,
  noStore = false) {
  // eslint-disable-next-line no-nested-ternary, max-len
  const storeToPassInner = (noStore ? (mockedStore ? mockedStoreToPass : storeToPass) : (mockedStore ? setupMockedStore() : setupStore()));

  Component.childContextTypes = {
    store: PropTypes.object
  };

  Component.prototype.getChildContext = function getChildContext() {
    return { store: storeToPassInner };
  };

  Component.prototype.updateMergedPropsIfNeeded = function updateMergedPropsIfNeeded() {
    this.mergedProps = Object.assign({}, this.stateProps, this.dispatchProps, this.props);
    return true;
  };

  const propsWithStore = Object.assign({ ...props }, { store: storeToPassInner });
  // eslint-disable-next-line no-nested-ternary
  const component = children
    ? <Component {...propsWithStore}>{children}</Component>
    : <Component {...propsWithStore} />;

  const wrapper = mount(component);
  const connectWrapper = wrapper.find('Connect');

  return {
    props, wrapper, connectWrapper
  };
}

export function replaceStoreReducer(reducer) {
  mockedStoreToPass.replaceReducer(reducer);
}

export function dispatchStoreAction(action) {
  mockedStoreToPass.dispatch(action);
}

export function showStoreState(pointer) {
  switch (pointer) {
    case 0:
      console.log(mockedStoreToPass.getState());
      break;
    case 1:
      console.log(storeToPass.getState());
      break;
    default:
      console.log(mockedStoreToPass.getState());
      console.log(storeToPass.getState());
      break;
  }
}

function dumbReducer(state, action) {
  return Object.assign({}, state, action.payload);
}

export function changeMocks(payload) {
  storeToPass.dispatch({
    type: 'CHANGE_ACTION',
    payload
  });
}

export function wrappCallbackWithPromise(callback) {
  const fakePromise = {
    listeners: [],
    then(cb) {
      this.listeners.push(cb);
      return this;
    }
  };

  function wrappedCallback() {
    callback();
    fakePromise.listeners.forEach((listener) => {
      listener();
    });
  }

  return {
    promise: fakePromise,
    wrappedCallback
  };
}
