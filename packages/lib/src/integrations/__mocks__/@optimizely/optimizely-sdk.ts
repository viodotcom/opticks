export const voidEventDispatcher = {
  dispatchEvent: () => null
}

export const addNotificationListenerMock = jest.fn()

export const createInstanceMock = jest.fn(() => ({
  isFeatureEnabled: isFeatureEnabledMock,
  notificationCenter: {
    addNotificationListener: addNotificationListenerMock
  },
  createUserContext: optimizelyUserContextMock
}))

export const decideMock = jest.fn((toggleKey) => {
  switch (toggleKey) {
    case 'foo':
      return {variationKey: 'b'}
    case 'bax':
      return {variationKey: 'c'}
    default:
      return {variationKey: undefined}
  }
})
export const optimizelyUserContextMock = jest.fn(() => ({
  decide: decideMock
}))

export const isFeatureEnabledMock = jest.fn((toggleId) => toggleId === 'foo')

const originalModule = jest.requireActual('@optimizely/optimizely-sdk')

const mock = {
  ...originalModule,
  createInstance: createInstanceMock
}

export default mock
