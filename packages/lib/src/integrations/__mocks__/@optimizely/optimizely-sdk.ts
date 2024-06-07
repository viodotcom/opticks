export const voidEventDispatcher = {
  dispatchEvent: () => null
}

export const addNotificationListenerMock = jest.fn()

export const createInstanceMock = jest.fn(() => ({
  isFeatureEnabled: isFeatureEnabledMock,
  notificationCenter: {
    addNotificationListener: addNotificationListenerMock
  },
  activate: activateMock,
  createUserContext: optimizelyUserContextMock
}))

export const decideMock = jest.fn((toggleKey) => ({
  enabled: toggleKey === 'foo'
}))
export const optimizelyUserContextMock = jest.fn(() => ({
  decide: decideMock
}))

export const isFeatureEnabledMock = jest.fn((toggleId) => toggleId === 'foo')

export const activateMock = jest.fn((toggleId, userId) => {
  const shouldReturnB =
    (toggleId === 'foo' && userId === 'fooBSide') ||
    (toggleId === 'bar' && userId === 'barBSide')

  return shouldReturnB && 'b'
})

const originalModule = jest.requireActual('@optimizely/optimizely-sdk')

const mock = {
  ...originalModule,
  createInstance: createInstanceMock
}

export default mock
