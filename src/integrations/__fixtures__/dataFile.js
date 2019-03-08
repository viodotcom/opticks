export default {
  accountId: '12345',
  anonymizeIP: false,
  botFiltering: false,
  projectId: '23456',
  revision: '6',
  version: '4',
  experiments: [
    {
      id: 'foo',
      key: 'foo',
      status: 'Running',
      layerId: 'layerFoo',
      variations: [
        {
          featureEnabled: false,
          id: 'foo-a',
          key: 'a'
        },
        {
          featureEnabled: true,
          id: 'foo-b',
          key: 'b'
        }
      ],
      trafficAllocation: [
        {
          entityId: 'foo-a',
          endOfRange: 5000
        },
        {
          entityId: 'foo-b',
          endOfRange: 10000
        }
      ],
      audienceIds: ['foo-default-dates'],
      forcedVariations: []
    },
    {
      id: 'bar',
      key: 'bar',
      status: 'Running',
      layerId: 'layerBar',
      variations: [
        {
          featureEnabled: false,
          id: 'bar-a',
          key: 'a'
        },
        {
          featureEnabled: true,
          id: 'bar-b',
          key: 'b'
        }
      ],
      trafficAllocation: [
        {
          entityId: 'bar-a',
          endOfRange: 5000
        },
        {
          entityId: 'bar-b',
          endOfRange: 10000
        }
      ],
      audienceIds: [],
      forcedVariations: []
    }
  ],
  featureFlags: [
    {
      experimentIds: ['foo'],
      id: 'foo',
      key: 'foo'
    },
    {
      experimentIds: ['bar'],
      id: 'bar',
      key: 'bar'
    }
  ],
  events: [],
  audiences: [
    {
      id: 'foo-default-dates',
      name: 'Foo Traffic',
      conditions:
        '[ "and", { "name": "trafficSource", "value": "foo", "type": "custom_attribute" }, { "name": "hasDefaultDates", "value": true, "type": "custom_attribute" }, ["not", { "name": "deviceType", "value": "mobile", "type": "custom_attribute" } ] ]'
    }
  ],
  attributes: [
    { id: 'trafficSource', key: 'trafficSource' },
    { id: 'hasDefaultDates', key: 'hasDefaultDates' },
    { id: 'deviceType', key: 'deviceType' }
  ],
  groups: [],
  rollouts: [],
  variables: []
}
