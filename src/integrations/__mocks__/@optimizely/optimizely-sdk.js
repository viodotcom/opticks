// @flow

export const voidEventDispatcher = {
  dispatchEvent: () => null
}

export const addNotificationListenerMock = jest.fn()

export const createInstanceMock = jest.fn(() => ({
  isFeatureEnabled: isFeatureEnabledMock,
  notificationCenter: {
    addNotificationListener: addNotificationListenerMock
  },
  activate: activateMock
}))

export const isFeatureEnabledMock = jest.fn(toggleId => toggleId === 'foo')

export const activateMock = jest.fn((toggleId, userId) => {
  const shouldReturnB =
    (toggleId === 'foo' && userId === 'fooBSide') ||
    (toggleId === 'bar' && userId === 'barBSide')

  return shouldReturnB && 'b'
})

const mock = {
  createInstance: createInstanceMock
}

export default mock
