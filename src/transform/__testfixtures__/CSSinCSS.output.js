const foo = 'bar'

const progressBarLabelStyles = ({ theme }) => css`
  text-transform: capitalize;
  margin-left: ${theme.layout.basePadding}px;
  color: ${theme.colors.reviewsLabel};
  font-size: ${theme.fonts.size.md};
  line-height: ${theme.fonts.lineHeight.md};

  ${mq.sm(`
  font-size: ${theme.fonts.size.sm};
  `)};
`
