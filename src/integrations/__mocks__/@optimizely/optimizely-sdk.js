// @flow

export const voidEventDispatcher = {
  dispatchEvent: () => null
}

export const addNotificationListenerMock = jest.fn()

export const createInstanceMock = jest.fn(() => ({
  isFeatureEnabled: isFeatureEnabledMock,
  getFeatureVariableString: getFeatureVariableStringMock,
  notificationCenter: {
    addNotificationListener: addNotificationListenerMock
  }
}))

export const isFeatureEnabledMock = jest.fn(toggleId => toggleId === 'foo')

export const getFeatureVariableStringMock = jest.fn(toggleId => {
  if (toggleId === 'foo') return 'b'
  return null
})

const mock = {
  createInstance: createInstanceMock
}

export default mock
