const PriceElement = styled('div')(
  ({ theme }) => css`
    color: ${theme.colors.grayDarker};

    ${`
        font-size: ${theme.fonts.size.md};
        font-weight: 800;
      `}
  `
)
