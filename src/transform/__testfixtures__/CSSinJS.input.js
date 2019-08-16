import { toggle } from 'opticks'

const PriceElement = styled('div')(
  ({ theme }) => css`
    color: ${theme.colors.grayDarker};

    ${toggle(
    'foo',
    `
          font-size: ${theme.fonts.size.lg};
          font-weight: ${theme.fonts.weight.lg};
        `,
    `
          font-size: ${theme.fonts.size.md};
          font-weight: 800;
        `
  )}

    ${toggle(
    'foo',
    () => css`
        color: ${theme.fonts.colors.primary};
        background: black;
      `,
    () => css`
        color: ${theme.fonts.colors.secondary};
        background: white;
      `
  )}
  `
)
