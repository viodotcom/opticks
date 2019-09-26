import { toggle } from 'opticks'

const PriceElement = styled('div')(
  ({ theme }) => css`
    border-radius: ${toggle('foo', `3px`, `${3}px`)};
  `
)
