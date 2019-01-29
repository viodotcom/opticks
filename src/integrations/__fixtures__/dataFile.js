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
          id: '1',
          key: 'control',
          variables: [
            {
              id: 'variation',
              key: 'variation',
              type: 'string',
              value: 'a'
            }
          ]
        },
        {
          featureEnabled: true,
          id: '2',
          key: 'treatment',
          variables: [
            {
              id: 'variation',
              key: 'variation',
              type: 'string',
              value: 'b'
            }
          ]
        }
      ],
      trafficAllocation: [
        {
          entityId: '1',
          endOfRange: 5000
        },
        {
          entityId: '2',
          endOfRange: 10000
        }
      ],
      audienceIds: ['foo-default-dates'],
      forcedVariations: []
    }
  ],
  featureFlags: [
    {
      experimentIds: ['foo'],
      id: 'foo',
      key: 'foo',
      variables: [
        {
          defaultValue: 'a',
          id: 'variation',
          key: 'variation',
          type: 'string'
        }
      ]
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
  attributes: [{ id: 'trafficSource', key: 'trafficSource' }],
  groups: [],
  rollouts: [],
  variables: []
}
