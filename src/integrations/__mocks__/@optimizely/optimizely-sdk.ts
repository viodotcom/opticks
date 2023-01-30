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
  activate: activateMock
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

const mock = {
  createInstance: createInstanceMock
}

export default mock
