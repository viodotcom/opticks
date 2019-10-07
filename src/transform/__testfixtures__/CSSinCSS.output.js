const foo = 'bar'

const progressBarLabelStyles = ({ theme }) => css`
  text-transform: capitalize;
  margin-left: ${theme.layout.basePadding}px;
  color: ${theme.colors.reviewsLabel};
  font-size: ${theme.fonts.size.md};
  line-height: ${theme.fonts.lineHeight.md};

  ${mq.sm(`
  font-size: ${theme.fonts.size.sm};
  `)}

  ${mq.md(css`
    padding: 0 ${theme.layout.basePadding}px ${theme.layout.basePadding * 1.5}px;
  `)};
`
