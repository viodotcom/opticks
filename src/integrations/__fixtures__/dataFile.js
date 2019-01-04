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
          featureEnabled: true,
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
      ]
    }
  ],
  featureFlags: [
    {
      experimentIds: ['foo'],
      id: 'a-a-feature',
      key: 'a-a-feature',
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
  audiences: [],
  attributes: [],
  groups: [],
  rollouts: [],
  variables: []
}
