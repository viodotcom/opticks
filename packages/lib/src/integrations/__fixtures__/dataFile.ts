export default {
  accountId: '12345',
  projectId: '23456',
  revision: '6',
  attributes: [
    {id: 'trafficSource', key: 'trafficSource'},
    {id: 'hasDefaultDates', key: 'hasDefaultDates'},
    {id: 'deviceType', key: 'deviceType'}
  ],
  audiences: [
    {
      id: 'foo-default-dates',
      name: 'Foo Traffic',
      conditions:
        '[ "and", { "name": "trafficSource", "value": "foo", "type": "custom_attribute" }, { "name": "hasDefaultDates", "value": true, "type": "custom_attribute" }, ["not", { "name": "deviceType", "value": "mobile", "type": "custom_attribute" } ] ]'
    }
  ],
  version: '4',
  events: [],
  integrations: [],
  anonymizeIP: false,
  botFiltering: false,
  typedAudiences: [],
  variables: [],
  environmentKey: 'production',
  sdkKey: '12345',
  featureFlags: [
    {
      experimentIds: ['foo'],
      id: 'foo',
      rolloutId: 'rollout-1234',
      key: 'foo',
      variables: []
    },
    {
      experimentIds: ['bar'],
      id: 'bar',
      rolloutId: 'rollout-456',
      key: 'bar',
      variables: []
    }
  ],
  rollouts: [
    {
      id: 'rollout-1234',
      experiments: [
        {
          id: '12345',
          key: 'foo-exp',
          status: 'Running',
          layerId: '1234',
          variations: [
            {
              id: '12345',
              key: 'on',
              featureEnabled: true,
              variables: []
            }
          ],
          trafficAllocation: [
            {
              entityId: '12345',
              endOfRange: 5000
            }
          ],
          forcedVariations: {},
          audienceIds: [],
          audienceConditions: []
        },
        {
          id: 'default-foo',
          key: 'default-foo',
          status: 'Running',
          layerId: 'default-foo',
          variations: [
            {
              id: '624542',
              key: 'off',
              featureEnabled: false,
              variables: []
            }
          ],
          trafficAllocation: [
            {
              entityId: '624542',
              endOfRange: 10000
            }
          ],
          forcedVariations: {},
          audienceIds: [],
          audienceConditions: []
        }
      ]
    }
  ],
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
  groups: []
}
