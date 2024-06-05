export const voidEventDispatcher = {
  dispatchEvent: () => null
}

export const addNotificationListenerMock = jest.fn()

export const createInstanceMock = jest.fn(() => ({
  getEnabledFeatures: getEnabledFeaturesMock,
  isFeatureEnabled: isFeatureEnabledMock,
  notificationCenter: {
    addNotificationListener: addNotificationListenerMock
  },
  activate: activateMock,
  createUserContext: optimizelyUserContextMock
}))

export const decideMock = jest.fn((toggleKey) => ({
  enabled: toggleKey === "foo"
}))
export const optimizelyUserContextMock = jest.fn((userId, attributes) => ({
  decide: decideMock
}))
    

export const isFeatureEnabledMock = jest.fn((toggleId) => toggleId === 'foo')

export const getEnabledFeaturesMock = jest.fn((userId, attributes) => {
  if (userId) {
    if (attributes.deviceType) {
      return [
        `${userId}-${attributes.deviceType}-test-1`,
        `${userId}-${attributes.deviceType}-test-2`
      ]
    }

    return [`${userId}-test-1`, `${userId}-test-2`]
  }

  return []
})

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
